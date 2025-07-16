import React, { useRef, useState } from 'react'
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import htmlDocx from 'html-docx-js-typescript';
import * as mammoth from 'mammoth/mammoth.browser'
import "./editor.css"

const Editor: React.FC = () => {
  const [value, setValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const jsonInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const quillRef = useRef<ReactQuill | null>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.name.endsWith('.txt')) {
      const text = await file.text()
      setValue(text)
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
      setValue(result.value)
    }
  }

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setValue(text)
  }

  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const quill = quillRef.current?.getEditor()
      const range = quill?.getSelection(true)
      if (quill && range) {
        quill.insertEmbed(range.index, 'image', reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const triggerImportJson = () => {
    jsonInputRef.current?.click()
  }

  const triggerInsertImage = () => {
    imageInputRef.current?.click()
  }

  const handleExport = async () => {
  };


  const toggleRTL = () => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    const root = quill.root
    if (root.getAttribute('dir') === 'rtl') {
      root.removeAttribute('dir')
      root.style.textAlign = ''
    } else {
      root.setAttribute('dir', 'rtl')
      root.style.textAlign = 'right'
    }
  }

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={triggerImport}>Import</button>
        <button onClick={triggerImportJson}>Import JSON</button>
        <button onClick={handleExport}>Export</button>
        <button onClick={triggerInsertImage}>Insert Image</button>
        <button onClick={toggleRTL}>RTL</button>
        <input
          type="file"
          accept=".txt,.docx"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImport}
        />
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          ref={jsonInputRef}
          onChange={handleImportJson}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={imageInputRef}
          onChange={handleInsertImage}
        />
      </div>
      <ReactQuill theme="snow" value={value} onChange={setValue} ref={quillRef} />
    </div>
  )
}

export default Editor
