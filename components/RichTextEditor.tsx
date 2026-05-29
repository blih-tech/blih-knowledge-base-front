'use client';

import { useEffect } from 'react';

import { useEditor, EditorContent } from '@tiptap/react';
import { Mark, mergeAttributes, type RawCommands } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  Strikethrough,
  Minus,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

// ─── Custom inline mark: TextSize ─────────────────────────────────────────────
// Wraps selected text in <span data-text-size="h1|h2|h3"> so headings apply
// only to the selected range, not the whole block.

const TextSize = Mark.create({
  name: 'textSize',

  addAttributes() {
    return {
      level: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-text-size]', getAttrs: (el: HTMLElement) => ({ level: el.dataset.textSize }) }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['span', mergeAttributes({ 'data-text-size': HTMLAttributes.level }), 0];
  },

  addCommands() {
    return {
      setTextSize:
        (level: string) =>
        ({ commands }: { commands: RawCommands }) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (commands as any).setMark(this.name, { level }),
      unsetTextSize:
        () =>
        ({ commands }: { commands: RawCommands }) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (commands as any).unsetMark(this.name),
      toggleTextSize:
        (level: string) =>
        ({ editor, commands }: { editor: ReturnType<typeof useEditor>; commands: RawCommands }) =>
          editor?.isActive(this.name, { level })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (commands as any).unsetMark(this.name)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : (commands as any).setMark(this.name, { level }),
    } as Partial<RawCommands>;
  },
});


// ─── Component ────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onChangeJson?: (json: object) => void;
  placeholder?: string;
  error?: string;
  /** Bump this to imperatively replace editor content with the current `value` */
  externalContentVersion?: number;
}

export function RichTextEditor({
  value,
  onChange,
  onChangeJson,
  placeholder = 'Write your content here...',
  error,
  externalContentVersion,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // prevents SSR/hydration mismatch in Next.js
    extensions: [
      StarterKit.configure({
        heading: false, // disable block headings — using inline marks instead
        link: {         // configure the built-in StarterKit link instead of adding a duplicate
          openOnClick: false,
          autolink: true,
        },
      }),
      TextSize,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      onChangeJson?.(editor.getJSON());
    },
  });

  // When externalContentVersion bumps, force-set the editor content
  // (e.g. after a file import)
  useEffect(() => {
    if (!editor || externalContentVersion === undefined || externalContentVersion === 0) return;
    editor.commands.setContent(value, false);
    onChange(editor.getHTML());
    onChangeJson?.(editor.getJSON());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalContentVersion]);

  if (!editor) return null;

  const addLink = () => {
    const url = prompt('Enter URL');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`rounded-lg border ${error ? 'border-red-500' : 'border-border'} overflow-hidden bg-white`}>
      {/* ProseMirror scoped styles — no Tailwind Typography plugin required */}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 320px;
          padding: 1rem 1.25rem;
          font-size: 0.9375rem;
          line-height: 1.75;
          color: var(--foreground);
        }
        .ProseMirror > * + * { margin-top: 0.6em; }
        .ProseMirror p { margin: 0; }

        /* Inline text-size marks — applies only to selected/marked text */
        .ProseMirror [data-text-size="h1"] { font-size: 1.75rem;  font-weight: 700; line-height: 1.2; }
        .ProseMirror [data-text-size="h2"] { font-size: 1.35rem;  font-weight: 600; line-height: 1.3; }
        .ProseMirror [data-text-size="h3"] { font-size: 1.125rem; font-weight: 600; line-height: 1.4; }

        .ProseMirror ul { list-style: disc;    padding-left: 1.6em; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.6em; }
        .ProseMirror li > p { margin: 0; }

        .ProseMirror blockquote {
          border-left: 3px solid var(--primary);
          padding: 0.5em 1em;
          background: color-mix(in srgb, var(--primary) 6%, white);
          border-radius: 0 6px 6px 0;
          color: var(--muted-foreground);
          font-style: italic;
        }

        .ProseMirror code {
          background: var(--muted);
          border-radius: 4px;
          padding: 0.15em 0.4em;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.875em;
          color: #c026d3;
        }
        .ProseMirror pre {
          background: #1e293b;
          border-radius: 8px;
          padding: 1em 1.25em;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          color: #e2e8f0;
          padding: 0;
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid var(--border);
          margin: 1.25em 0;
        }

        .ProseMirror a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em     { font-style: italic; }
        .ProseMirror s      { text-decoration: line-through; }

        .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 bg-secondary/60 px-2.5 py-2 border-b border-border">
        {/* Inline size marks — apply only to selected text */}
        <Btn
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => (editor.chain().focus() as any).toggleTextSize('h1').run()}
          active={editor.isActive('textSize', { level: 'h1' })}
          title="Large heading (selected text only)"
        >
          <Heading1 className="w-4 h-4" />
        </Btn>
        <Btn
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => (editor.chain().focus() as any).toggleTextSize('h2').run()}
          active={editor.isActive('textSize', { level: 'h2' })}
          title="Medium heading (selected text only)"
        >
          <Heading2 className="w-4 h-4" />
        </Btn>
        <Btn
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => (editor.chain().focus() as any).toggleTextSize('h3').run()}
          active={editor.isActive('textSize', { level: 'h3' })}
          title="Small heading (selected text only)"
        >
          <Heading3 className="w-4 h-4" />
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Quote className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <Code className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
          <Minus className="w-4 h-4" />
        </Btn>

        <Sep />

        <Btn onClick={addLink} active={editor.isActive('link')} title="Link">
          <LinkIcon className="w-4 h-4" />
        </Btn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {error && (
        <p className="text-sm text-red-600 px-4 py-2.5 bg-red-50 border-t border-red-200">{error}</p>
      )}
    </div>
  );
}

// ─── Shared toolbar helpers ────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-5 bg-border mx-1 self-center shrink-0" />;
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground/70 hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}
