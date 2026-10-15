import React, { useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImagePlus,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Pilcrow,
} from 'lucide-react';
import { uploadMediaFile } from '../../services/api';

interface BlogRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const symbols = ['₹', '°', '±', '×', '÷', '≥', '≤', '→', '←', '•', '©', '™', '✓', '⚡', '☀'];

export const BlogRichTextEditor: React.FC<BlogRichTextEditorProps> = ({
  value,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState('16');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your solar article here...',
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'blog-editor-content min-h-[320px] px-5 py-4 text-base leading-8 text-slate-800 focus:outline-none',
      },
    },
  });

  if (!editor) {
    return <div className="min-h-80 rounded-xl border border-slate-200 bg-white" />;
  }

  const toolButton =
    'inline-flex items-center justify-center min-w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed';

  const runCommand = (command: () => boolean) => {
    command();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter the link URL (https://...)', previousUrl || 'https://');

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    try {
      const parsed = new URL(url.trim());
      if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) {
        throw new Error('Unsupported URL protocol');
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    } catch {
      window.alert('Please enter a valid http, https, or mailto link.');
    }
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files);
    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024,
    );

    if (invalidFile) {
      setUploadError('Choose image files only. Each image must be 10 MB or smaller.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      for (const file of selectedFiles) {
        const result = await uploadMediaFile(file);

        editor
          .chain()
          .focus()
          .setImage({
            src: result.url,
            alt: file.name.replace(/\.[^.]+$/, ''),
            title: file.name,
          })
          .run();
      }
    } catch (error) {
      console.error('Blog image upload failed:', error);
      setUploadError('An image could not be uploaded. Check your storage permissions and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-1 border-r border-slate-200 pr-2">
          <button type="button" className={toolButton} title="Undo" disabled={!editor.can().undo()} onClick={() => runCommand(() => editor.chain().focus().undo().run())}>
            <Undo2 size={17} />
          </button>
          <button type="button" className={toolButton} title="Redo" disabled={!editor.can().redo()} onClick={() => runCommand(() => editor.chain().focus().redo().run())}>
            <Redo2 size={17} />
          </button>
        </div>

        <select
          aria-label="Text style"
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
          }
          onChange={(event) => {
            const level = event.target.value;
            if (level === 'p') editor.chain().focus().setParagraph().run();
            if (level === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
            if (level === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
            if (level === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          aria-label="Font size"
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
          value={fontSize}
          onChange={(event) => applyFontSize(event.target.value)}
        >
          {['12', '14', '16', '18', '20', '24', '28', '32', '36'].map((size) => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-1">
          <button type="button" className={`${toolButton} ${editor.isActive('bold') ? 'bg-amber-100 border-amber-400' : ''}`} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={17} />
          </button>
          <button type="button" className={`${toolButton} ${editor.isActive('italic') ? 'bg-amber-100 border-amber-400' : ''}`} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={17} />
          </button>
          <button type="button" className={`${toolButton} ${editor.isActive('underline') ? 'bg-amber-100 border-amber-400' : ''}`} title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={17} />
          </button>
          <button type="button" className={`${toolButton} ${editor.isActive('bulletList') ? 'bg-amber-100 border-amber-400' : ''}`} title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={17} />
          </button>
          <button type="button" className={`${toolButton} ${editor.isActive('orderedList') ? 'bg-amber-100 border-amber-400' : ''}`} title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={17} />
          </button>
          <button type="button" className={`${toolButton} ${editor.isActive('blockquote') ? 'bg-amber-100 border-amber-400' : ''}`} title="Block quote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={17} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-l border-slate-200 pl-2">
          <button type="button" className={toolButton} title="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft size={17} />
          </button>
          <button type="button" className={toolButton} title="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter size={17} />
          </button>
          <button type="button" className={toolButton} title="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight size={17} />
          </button>
          <button type="button" className={toolButton} title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}>
            <Pilcrow size={17} />
          </button>
          <button type="button" className={toolButton} title="Insert divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={17} />
          </button>
          <button type="button" className={toolButton} title="Add link" onClick={addLink}>
            <LinkIcon size={17} />
          </button>
          <button type="button" className={toolButton} title="Upload images" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={17} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void uploadImages(event.target.files)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-3 py-2">
        <span className="mr-1 text-xs font-semibold text-slate-500">Special characters</span>
        {symbols.map((symbol) => (
          <button
            key={symbol}
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-amber-50"
            title={`Insert ${symbol}`}
            onClick={() => editor.chain().focus().insertContent(symbol).run()}
          >
            {symbol}
          </button>
        ))}
      </div>

      {uploading && (
        <p className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700" role="status">
          Uploading images… Please keep this editor open.
        </p>
      )}

      {uploadError && (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {uploadError}
        </p>
      )}

      <EditorContent editor={editor} />

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Rich-text article editor · Images up to 10 MB each · Content is saved when you save the article
      </div>
    </div>
  );
};

export default BlogRichTextEditor;
