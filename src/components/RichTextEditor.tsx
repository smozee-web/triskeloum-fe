// src/components/RichTextEditor.tsx
import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListBulletIcon,
  CodeBracketIcon,
  LinkIcon,
  PhotoIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { List } from 'antd';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...'
}) => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  // Convert markdown to HTML for Tiptap initialization
  const mdToHtml = useMemo(() => {
    const md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true
    });
    
    // Convert markdown to HTML if value contains markdown
    // Check if value is already HTML (starts with < tag) or is markdown
    if (value && !value.trim().startsWith('<')) {
      return md.render(value);
    }
    return value;
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      Highlight.configure({
        multicolor: true
      })
    ],
    content: mdToHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-gray-900 dark:text-text-primary'
      }
    }
  });

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    
    const url = window.prompt('URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-bg-secondary">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        {/* Text styles */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Gras (Ctrl+B)"
          >
            <BoldIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Italique (Ctrl+I)"
          >
            <ItalicIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Strikethrough"
          >
            <StrikethroughIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('highlight') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Surligner"
          >
            <PaintBrushIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-text-secondary ${
                editor.isActive('heading', { level }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Bulleted list"
          >
            <ListBulletIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Numbered list"
          >
            <ListBulletIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
        </div>

        {/* Code */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Bloc de code"
          >
            <CodeBracketIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
        </div>

        {/* Link & Image */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('link') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Insert a link"
          >
            <LinkIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Insert an image"
          >
            <PhotoIcon className="w-4 h-4 text-gray-700 dark:text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;