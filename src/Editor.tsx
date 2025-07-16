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
    try {
      const json = JSON.parse(text)
      const keys = Object.keys(json)
      let html = ''

      if (keys.length > 0 && typeof json[keys[0]] === 'object') {
        const sections = json[keys[0]] as Record<string, string>
        for (const [title, body] of Object.entries(sections)) {
          html += `<p></p><div dir="rtl" style="text-align: right;">
  <h2>${title}</h2>
  <p>${body}</p>
</div>`

        }
      }

      if (keys.length > 1 && typeof json[keys[1]] === 'object') {
        const tableData = json[keys[1]] as Record<string, Record<string, string>>;
        const rows = Object.entries(tableData);

        if (rows.length > 0) {
          let headers = Object.keys(rows[0][1]);
          if (headers.length === 1) {
            headers = headers[0]
                .replace(/\r?\n/g, ' ')
                .split(/\s{2,}|,|\t+/)
                .map((h) => h.trim())
                .filter((h) => h);
          }

          html += `<div dir="rtl" style="direction: rtl; text-align: right;">`;
          html += `<table dir="rtl" style="border-collapse: collapse; width: auto; direction: rtl; text-align: right;">`;

          // Header row
          html += `<thead><tr><td style="white-space: nowrap; padding: 2px;">שורה</td>`;
          for (const h of headers) {
            html += `<td class="tight-cell">${h}</td>`;
          }
          html += `</tr></thead>`;

          // Body rows
          html += `<tbody>`;
          for (const [rowName, row] of rows) {
            html += `<tr><td style="white-space: nowrap; padding: 2px;">${rowName}</td>`;
            for (const h of headers) {
              html += `<td style="white-space: nowrap; padding: 2px;">${row[h] ?? ''}</td>`;
            }
            html += `</tr>`;
          }
          html += `</tbody></table></div>`;
        }
      }

      setValue(html)
    } catch {
      setValue(text)
    }
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
    const html = `<html><head><meta charset="utf-8"></head><body>${value}</body></html>`
    const blob = htmlDocx.asBlob(html)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'document.docx'
    link.click()
    URL.revokeObjectURL(link.href)
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
