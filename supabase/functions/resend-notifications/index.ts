const SUPABASE_URL = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_WEBHOOK_SECRET = Deno.env.get("NOTIFICATION_WEBHOOK_SECRET");

const INTERNAL_EMAIL = "solarsarva@gmail.com";
const FROM_EMAIL = "Sarva Solar <notifications@sarvasolar.in>";

type Status = "Pending" | "Failed" | "Sent" | "Processing";

type QueueEvent = {
  id: string;
  form_type: "Lead" | "Quote";
  record_id: string;
  customer_status: Status;
  internal_status: Status;
  customer_next_attempt_at: string;
  internal_next_attempt_at: string;
};

type Outcome = {
  status: "Sent" | "Failed";
  error: string | null;
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]!);
}

function secretMatches(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }

  return diff === 0;
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (!result.ok) {
    console.error(`Database RPC ${name} failed with HTTP ${result.status}`);
    throw new Error(`Database operation ${name} failed`);
  }

  return await result.json() as T;
}

async function getSavedRecord(event: QueueEvent): Promise<Record<string, any>> {
  const table = event.form_type === "Lead" ? "leads" : "quotes";
  const query = new URLSearchParams({
    id: `eq.${event.record_id}`,
    select: "*",
    limit: "1",
  });

  const result = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!result.ok) {
    throw new Error(`Could not read saved ${event.form_type.toLowerCase()}`);
  }

  const records = await result.json();
  if (!Array.isArray(records) || !records[0]) {
    throw new Error("Saved enquiry was not found");
  }

  return records[0];
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  idempotencyKey: string,
  replyTo?: string,
  text?: string,
): Promise<void> {
  const payload: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: [to],
    subject,
    html,
  };

  if (replyTo) payload.reply_to = replyTo;
  if (text) payload.text = text;

  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!result.ok) {
    // Do not log provider response bodies or customer information.
    throw new Error(`Resend returned HTTP ${result.status}`);
  }
}

function due(status: Status, nextAttempt: string): boolean {
  return status !== "Sent" && Date.parse(nextAttempt) <= Date.now();
}

async function attempt(
  shouldSend: boolean,
  send: () => Promise<void>,
): Promise<Outcome | null> {
  if (!shouldSend) return null;

  try {
    await send();
    return { status: "Sent", error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed";
    console.error("Notification channel failed:", message);
    return { status: "Failed", error: message.slice(0, 2000) };
  }
}

function emailContent(event: QueueEvent, record: Record<string, any>) {
  const isLead = event.form_type === "Lead";
  const name = isLead ? record.full_name : record.name;
  const email = record.email;
  const phone = record.phone;

  if (
    typeof name !== "string" || !name.trim() || name.length > 120 ||
    typeof email !== "string" || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Saved enquiry has invalid contact details");
  }

  const details: [string, unknown][] = isLead
    ? [
        ["Enquiry type", "Solar enquiry"],
        ["City", record.city],
        ["State", record.state],
        ["Solar for", record.solar_for],
        ["Monthly electricity bill", record.monthly_bill],
        ["Roof type", record.roof_type],
        ["Connection type", record.connection_type],
        ["Finance interest", record.finance_interest],
        ["Notes", record.notes],
      ]
    : [
        ["Enquiry type", "Solar quote request"],
        ["City", record.city],
        ["State", record.state],
        ["Property type", record.property_type],
        ["Monthly electricity bill", record.monthly_bill],
        ["Roof type", record.roof_type],
        ["Proposed capacity (kW)", record.proposed_kw],
        ["Estimated cost (₹)", record.estimated_cost],
        ["Estimated subsidy (₹)", record.estimated_subsidy],
        ["Estimated net cost (₹)", record.net_cost],
        ["Message", record.message],
      ];

  const visibleDetails = details.filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  const safe = (value: unknown) => escapeHtml(value);
  const reference = safe(event.record_id);
  const safeName = safe(name);
  const safeEmail = safe(email);
  const safePhone = safe(phone || "Not provided");
  const subjectPrefix = isLead ? "Solar enquiry" : "Solar quote request";
  const enquiryLabel = isLead ? "solar enquiry" : "solar quote request";
  const logoUrl = "https://sarvasolar.in/sarva-solar-logo.png";
  const websiteUrl = "https://sarvasolar.in";
  const adminUrl = "https://sarvasolar.in/admin";

  const cellStyle =
    "padding:12px 14px;border-bottom:1px solid #e5ece7;font-size:14px;line-height:1.5;vertical-align:top;";
  const labelStyle = `${cellStyle}color:#53665a;width:42%;font-weight:600;`;
  const valueStyle = `${cellStyle}color:#20392a;word-break:break-word;`;

  const makeRows = (items: [string, unknown][]) =>
    items.map(([label, value]) => `
      <tr>
        <td style="${labelStyle}">${safe(label)}</td>
        <td style="${valueStyle}">${safe(value)}</td>
      </tr>
    `).join("");

  // Do not echo private free-text notes/messages back into the customer email.
  const customerDetails = visibleDetails.filter(
    ([label]) => label !== "Notes" && label !== "Message",
  );

  const customerRows = makeRows(customerDetails);
  const internalRows = makeRows(visibleDetails);

  const shell = (content: string, preheader: string) => `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="color-scheme" content="light">
        <title>Sarva Solar</title>
      </head>
      <body style="margin:0;padding:0;background:#f2f6f3;font-family:Arial,Helvetica,sans-serif;color:#20392a;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${safe(preheader)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f6f3;width:100%;">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e0e9e2;border-radius:12px;overflow:hidden;">
                <tr>
                  <td align="center" style="padding:24px 20px 20px;background:#ffffff;border-bottom:4px solid #e9b949;">
                    <a href="${websiteUrl}" style="text-decoration:none;">
                      <img src="${logoUrl}" alt="Sarva Solar" width="190" style="display:block;width:190px;max-width:80%;height:auto;border:0;outline:none;text-decoration:none;">
                    </a>
                  </td>
                </tr>
                ${content}
                <tr>
                  <td style="padding:20px 24px;background:#173f2a;color:#ffffff;text-align:center;">
                    <p style="margin:0 0 7px;font-size:15px;font-weight:bold;">Sarva Solar</p>
                    <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:#e0eee4;">Solar solutions for a brighter tomorrow.</p>
                    <a href="${websiteUrl}" style="color:#f5d477;font-size:12px;text-decoration:underline;">sarvasolar.in</a>
                    <p style="margin:12px 0 0;color:#d1dfd5;font-size:11px;line-height:1.5;">
                      This is an automated email regarding your solar enquiry.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const customerHtml = shell(`
    <tr>
      <td style="padding:30px 28px 12px;">
        <p style="margin:0 0 8px;color:#39804c;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">
          Thank you for reaching out
        </p>
        <h1 style="margin:0 0 18px;color:#173f2a;font-size:25px;line-height:1.3;">
          Your solar journey starts here.
        </h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.8;">Dear <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 14px;color:#43574a;font-size:14px;line-height:1.8;">
          Thank you for your interest in Sarva Solar. We have successfully received your ${safe(enquiryLabel)}.
          Our team will review the information and contact you to discuss the next steps.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 22px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #e0e9e2;border-radius:8px;overflow:hidden;">
          <tr>
            <td colspan="2" style="padding:14px;background:#edf5ef;color:#173f2a;font-size:15px;font-weight:bold;">
              Your enquiry summary
            </td>
          </tr>
          ${customerRows}
          <tr>
            <td style="${labelStyle}">Reference ID</td>
            <td style="${valueStyle}font-weight:bold;">${reference}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 28px;">
        <p style="margin:0 0 12px;color:#43574a;font-size:14px;line-height:1.8;">
          If you need to share any additional information, you can email us at solarsarva@gmail.com.
        </p>
        <p style="margin:0;color:#20392a;font-size:14px;line-height:1.8;">
          Warm regards,<br><strong>Team Sarva Solar</strong>
        </p>
      </td>
    </tr>
  `, `We received your ${enquiryLabel}. Reference ${event.record_id}.`);

  const internalHtml = shell(`
    <tr>
      <td style="padding:28px 24px 12px;">
        <p style="margin:0 0 8px;color:#39804c;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">
          New customer notification
        </p>
        <h1 style="margin:0 0 12px;color:#173f2a;font-size:24px;line-height:1.35;">
          New ${isLead ? "solar lead" : "quote request"}
        </h1>
        <p style="margin:0;color:#53665a;font-size:14px;line-height:1.7;">
          A customer has submitted a new form on the Sarva Solar website. Please review the details and follow up.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 24px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #e0e9e2;border-radius:8px;overflow:hidden;">
          <tr>
            <td colspan="2" style="padding:14px;background:#edf5ef;color:#173f2a;font-size:15px;font-weight:bold;">
              Customer contact details
            </td>
          </tr>
          <tr><td style="${labelStyle}">Customer name</td><td style="${valueStyle}font-weight:bold;">${safeName}</td></tr>
          <tr><td style="${labelStyle}">Email</td><td style="${valueStyle}"><a href="mailto:${safeEmail}" style="color:#286b3e;">${safeEmail}</a></td></tr>
          <tr><td style="${labelStyle}">Phone</td><td style="${valueStyle}">${phone ? `<a href="tel:${safe(phone)}" style="color:#286b3e;">${safePhone}</a>` : safePhone}</td></tr>
          <tr><td style="${labelStyle}">Reference ID</td><td style="${valueStyle}font-weight:bold;">${reference}</td></tr>
          ${internalRows}
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 24px 30px;">
        <a href="${adminUrl}" style="display:inline-block;background:#24683a;color:#ffffff;padding:13px 22px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">
          Open Admin Dashboard
        </a>
        <p style="margin:14px 0 0;color:#64766a;font-size:12px;line-height:1.6;">
          Please verify the customer details before contacting them.
        </p>
      </td>
    </tr>
  `, `New ${isLead ? "solar lead" : "quote request"} from ${name}. Reference ${event.record_id}.`);

  const customerText = [
    "SARVA SOLAR",
    `Dear ${name},`,
    `Thank you for your interest in Sarva Solar. We have received your ${enquiryLabel}.`,
    "Our team will review your details and contact you about the next steps.",
    "",
    "ENQUIRY SUMMARY",
    ...customerDetails.map(([label, value]) => `${label}: ${String(value)}`),
    `Reference ID: ${event.record_id}`,
    "",
    "Warm regards,",
    "Team Sarva Solar",
    "https://sarvasolar.in",
  ].join("\n");

  const internalText = [
    "SARVA SOLAR — NEW CUSTOMER ENQUIRY",
    `Type: ${isLead ? "Solar lead" : "Quote request"}`,
    `Reference ID: ${event.record_id}`,
    `Customer name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    "",
    "ENQUIRY DETAILS",
    ...visibleDetails.map(([label, value]) => `${label}: ${String(value)}`),
    "",
    `Admin dashboard: ${adminUrl}`,
  ].join("\n");

  return {
    email,
    name,
    customerSubject: `Thank you, ${name} — we received your ${subjectPrefix.toLowerCase()} | Sarva Solar`,
    customerHtml,
    customerText,
    internalSubject: `New ${subjectPrefix}: ${name} | Sarva Solar`,
    internalHtml,
    internalText,
  };
}

async function processEvent(event: QueueEvent, workerId: string) {
  // If loading the source record fails, leave the lock in place until expiry.
  // The next scheduled run can reclaim the job safely.
  const record = await getSavedRecord(event);
  const content = emailContent(event, record);

  const customerDue = due(event.customer_status, event.customer_next_attempt_at);
  const internalDue = due(event.internal_status, event.internal_next_attempt_at);

  const [customer, internal] = await Promise.all([
    attempt(customerDue, () =>
      sendEmail(
        content.email,
        content.customerSubject,
        content.customerHtml,
        `${event.id}-customer`,
            undefined,
      content.customerText,
    )
    ),
    attempt(internalDue, () =>
      sendEmail(
        INTERNAL_EMAIL,
        content.internalSubject,
        content.internalHtml,
        `${event.id}-internal`,
        content.email,
            content.internalText,
    )
    ),
  ]);

  const customerStatus = customer?.status ?? event.customer_status;
  const internalStatus = internal?.status ?? event.internal_status;

  const updated = await rpc<boolean>("update_notification_outbox", {
    p_event_id: event.id,
    p_worker_id: workerId,
    p_customer_status: customerStatus,
    p_internal_status: internalStatus,
    p_customer_error: customer?.error ?? null,
    p_internal_error: internal?.error ?? null,
    p_customer_attempted: customer !== null,
    p_internal_attempted: internal !== null,
  });

  if (!updated) {
    throw new Error("Could not record outcomes: worker lock expired or changed");
  }

  return {
    customer: customerStatus,
    internal: internalStatus,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405);
  }

  if (
    !SUPABASE_URL || !SERVICE_ROLE_KEY ||
    !RESEND_API_KEY || !NOTIFICATION_WEBHOOK_SECRET
  ) {
    console.error("Required server environment variables are missing");
    return response({ error: "Notification service is not configured" }, 500);
  }

  const suppliedSecret = req.headers.get("x-notification-secret");
  if (
    !suppliedSecret ||
    !secretMatches(suppliedSecret, NOTIFICATION_WEBHOOK_SECRET)
  ) {
    return response({ error: "Unauthorized" }, 401);
  }

  const workerId = crypto.randomUUID();

  try {
    const events = await rpc<QueueEvent[]>("claim_notification_outbox", {
      p_worker_id: workerId,
      p_batch_size: 10,
    });

    let processed = 0;
    let deferred = 0;
    let errors = 0;

    for (const event of events) {
      try {
        const result = await processEvent(event, workerId);
        processed++;
        if (result.customer === "Failed" || result.internal === "Failed") {
          errors++;
        }
      } catch (error) {
        // The lock expires after five minutes if processing cannot finish.
        console.error(
          `Queue event ${event.id} could not be completed:`,
          error instanceof Error ? error.message : "Unknown error",
        );
        deferred++;
      }
    }

    return response({ success: true, claimed: events.length, processed, deferred, failedChannels: errors });
  } catch (error) {
    console.error(
      "Notification worker failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return response({ error: "Notification worker failed" }, 500);
  }
});
