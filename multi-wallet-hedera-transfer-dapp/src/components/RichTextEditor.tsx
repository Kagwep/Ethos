import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code,
  Link as LinkIcon,
  Paperclip,
} from 'lucide-react';
import { uploadToIPFS } from './Infura';

const MenuBar = ({ editor, onFileSelect }: { editor: any; onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl && linkText) {
      // Insert the link at current cursor position
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`)
        .run();
      
      setLinkUrl('');
      setLinkText('');
      setShowLinkInput(false);
    }
  };

  return (
    <div className="border-b border-gray-300 p-2">
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-100' : ''}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-100' : ''}`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-100' : ''}`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <label className="p-2 rounded hover:bg-gray-100 cursor-pointer" title="Attach File">
          <Paperclip className="w-4 h-4" />
          <input
            type="file"
            className="hidden"
            multiple
            onChange={onFileSelect}
          />
        </label>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
      
      {showLinkInput && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Link text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="flex-1 p-1 border rounded"
          />
          <input
            type="url"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 p-1 border rounded"
          />
          <button
            onClick={setLink}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

const RichTextEditor = ({ 
  content, 
  onChange,
}: { 
  content: string;
  onChange?: (html: string) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      })
    ],
    content: content || '<p>Write your review here...</p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] px-3 py-2'
      }
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const ipfsUrl = await uploadToIPFS(file);
        
        // Insert file link at cursor position
        editor?.chain().focus().insertContent([
          {
            type: 'text',
            text: `${file.name}`,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: ipfsUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                }
              }
            ]
          }
        ]).run();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }

    // Clear the input
    e.target.value = '';
  };

  return (
    <div>
      <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <MenuBar editor={editor} onFileSelect={handleFileSelect} />
        <EditorContent editor={editor} />
      </div>
      
      {isUploading && (
        <div className="mt-2 text-sm text-gray-600">
          Uploading files ...
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;