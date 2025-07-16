import React, { useRef, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import htmlDocx from 'html-docx-js/dist/html-docx'
import * as mammoth from 'mammoth/mammoth.browser'
import "./editor.css"

const Editor: React.FC = () => {
  const [value, setValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const handleExport = () => {
    const html = `<html><head></head><body>${value}</body></html>`
    const blob = htmlDocx.asBlob(html)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'document.docx'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={triggerImport}>Import</button>
        <button onClick={handleExport}>Export</button>
        <input
          type="file"
          accept=".txt,.docx"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImport}
        />
      </div>
      <ReactQuill theme="snow" value={value} onChange={setValue} />
    </div>
  )
}

export default Editor
