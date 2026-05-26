'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Write your content here...', error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const addLink = () => {
    const url = prompt('Enter URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className={`rounded-lg border ${error ? 'border-red-500' : 'border-border'} overflow-hidden bg-white`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 bg-secondary p-3 border-b border-border">
        <ToolbarButton
          onClick={toggleH1}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
          icon={<Heading1 className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={toggleH2}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
          icon={<Heading2 className="w-4 h-4" />}
        />

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={toggleBold}
          isActive={editor.isActive('bold')}
          title="Bold"
          icon={<Bold className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={toggleItalic}
          isActive={editor.isActive('italic')}
          title="Italic"
          icon={<Italic className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={toggleUnderline}
          isActive={editor.isActive('underline')}
          title="Underline"
          icon={<Underline className="w-4 h-4" />}
        />

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={toggleBulletList}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
          icon={<List className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={toggleOrderedList}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
          icon={<ListOrdered className="w-4 h-4" />}
        />

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={toggleBlockquote}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
          icon={<Quote className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={toggleCode}
          isActive={editor.isActive('code')}
          title="Inline Code"
          icon={<Code className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          title="Add Link"
          icon={<LinkIcon className="w-4 h-4" />}
        />
      </div>

      {/* Editor */}
      <div className={`prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none [&_.is-empty]::before:text-muted-foreground`}>
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-sm text-red-500 p-3 bg-red-50">{error}</p>}
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  title: string;
  icon: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, icon }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-white text-foreground hover:bg-muted border border-border'
      }`}
    >
      {icon}
    </button>
  );
}
