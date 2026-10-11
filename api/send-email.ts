import nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const adminEmail = "solarsarva@gmail.com";

const tables = {
  Lead: "leads",
  Quote: "quotes",
  JobApplication: "job_applications",
} as const;

type FormType = keyof typeof tables;

function getCustomer(row: Record<string, any>, type: FormType) {
  return {
    name: row.full_name || row.name || "Valued Customer",
    email: row.email || "",
    phone: row.phone || "",
    details: row,
    type,
  };
}

function formatDetails(row: Record<string, any>) {
  return Object.entries(row)
    .filter(([key, value]) =>
      !["id", "created_at", "updated_at"].includes(key) &&
      value !== null &&
      value !== ""
    )
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ");
      return `${label}: ${typeof value === "object" ? JSON.stringify(value) : value}`;
    })
    .join("\n");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!supabaseUrl || !serviceRoleKey ||
      !smtpHost || !smtpUser || !smtpPass) {
    console.error("Email service configuration is incomplete.");
    return res.status(500).json({ error: "Email service unavailable" });
  }

  let body: any;
  try {
    body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const type = body?.formType as FormType;
  const recordId = body?.recordId;

  if (!Object.hasOwn(tables, type) ||
      typeof recordId !== "string" ||
      recordId.length > 100) {
    return res.status(400).json({ error: "Invalid submission reference" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error: lookupError } = await supabase
    .from(tables[type])
    .select("*")
    .eq("id", recordId)
    .maybeSingle();

  if (lookupError) {
    console.error("Supabase submission lookup failed:", {
      table: tables[type],
      code: lookupError.code,
      message: lookupError.message,
      details: lookupError.details,
      hint: lookupError.hint,
    });
    return res.status(500).json({
      error: "Could not look up submission",
    });
  }

  if (!row) {
    return res.status(404).json({ error: "Submission not found" });
  }

  // QuoteModal creates a related lead as well as a quote.
  // Send the quote notification only, avoiding duplicate emails.
  if (type === "Lead" &&
      String(row.notes || "").startsWith("Quote Modal:")) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const customer = getCustomer(row, type);
  const details = formatDetails(customer.details);
  const subjectPrefix = {
    Lead: "Solar enquiry",
    Quote: "Solar quote request",
    JobApplication: "Job application",
  }[type];

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const recipients = [
    {
      to: adminEmail,
      subject: `New ${subjectPrefix}: ${customer.name}`,
      text: `A new ${type} submission was received.\n\n${details}`,
    },
    ...(customer.email
      ? [{
          to: customer.email,
          subject: `We received your ${subjectPrefix.toLowerCase()}`,
          text:
            `Hello ${customer.name},\n\n` +
            `Thank you for contacting Sarva Solar. ` +
            `We have received your ${subjectPrefix.toLowerCase()} ` +
            `and our team will follow up with you.\n\n` +
            `For your reference:\n${details}\n\n` +
            `Regards,\nSarva Solar`,
        }]
      : []),
  ].filter((item, index, all) =>
    all.findIndex(
      candidate => candidate.to.toLowerCase() === item.to.toLowerCase()
    ) === index
  );

  let failed = false;

  for (const recipient of recipients) {
    const logId = "email-" + createHash("sha256")
      .update(`${type}:${recordId}:${recipient.to.toLowerCase()}`)
      .digest("hex")
      .slice(0, 32);

    const { data: existingLog, error: existingLogError } = await supabase
      .from("email_notifications")
      .select("status")
      .eq("id", logId)
      .maybeSingle();

    if (existingLogError) {
      console.error("Could not check existing email log:", existingLogError.message);
      failed = true;
      continue;
    }

    if (existingLog && existingLog.status !== "Failed") {
      continue;
    }

    if (existingLog?.status === "Failed") {
      const { error: deleteError } = await supabase
        .from("email_notifications")
        .delete()
        .eq("id", logId);

      if (deleteError) {
        console.error("Could not reset failed email log:", deleteError.message);
        failed = true;
        continue;
      }
    }

    const { error: logError } = await supabase
      .from("email_notifications")
      .insert({
        id: logId,
        to_email: recipient.to,
        subject: recipient.subject,
        form_type: type,
        customer_name: customer.name,
        customer_email: customer.email || null,
        customer_phone: customer.phone || null,
        details: customer.details,
        status: "Pending",
        delivery_method: "Gmail SMTP",
      });

    if (logError) {
      console.error("Could not create email log:", logError.message);
      failed = true;
      continue;
    }

    try {
      await transporter.sendMail({
        from: smtpUser,
        to: recipient.to,
        subject: recipient.subject,
        text: recipient.text,
      });

      const { error: updateError } = await supabase
        .from("email_notifications")
        .update({
          status: "Sent",
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", logId);

      if (updateError) {
        failed = true;
        console.error("Email sent but log update failed:", updateError.message);
      }
    } catch (error) {
      failed = true;
      const message = error instanceof Error
        ? error.message.slice(0, 1000)
        : "Unknown email delivery error";

      await supabase
        .from("email_notifications")
        .update({
          status: "Failed",
          error_message: message,
        })
        .eq("id", logId);

      console.error("Email delivery failed:", message);
    }
  }

  // The form was already saved. Email failures are tracked in the logs
  // and should not make the customer submit the form a second time.
  return res.status(200).json({
    ok: true,
    emailDelivery: failed ? "check-logs" : "processed",
  });
}
