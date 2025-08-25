"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Button } from './button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Quote,
  Link,
  Unlink,
  Image,
  FileText
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const linkButtonRef = useRef<HTMLButtonElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [linkDialogPosition, setLinkDialogPosition] = useState({ top: 0, left: 0 })
  const [, forceUpdate] = useState({})

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  // Force re-render to update button states
  useEffect(() => {
    const handleSelectionChange = () => {
      forceUpdate({})
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (isLinkDialogOpen) {
        const target = event.target as Element
        if (!target.closest('.link-dialog') && !target.closest('[data-link-button]')) {
          setIsLinkDialogOpen(false)
          setLinkUrl("")
          setLinkText("")
        }
      }
    }
    
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isLinkDialogOpen])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateValue()
  }

  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    updateValue()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      execCommand('insertLineBreak')
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      document.execCommand('insertHTML', false, linkHtml)
      setLinkUrl("")
      setLinkText("")
      setIsLinkDialogOpen(false)
      editorRef.current?.focus()
      updateValue()
    }
  }

  const removeLink = () => {
    execCommand('unlink')
  }

  const isActive = (command: string) => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      return document.queryCommandState(command)
    }
    return false
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const imageHtml = `<img src="${data.url}" alt="${file.name}" style="max-width: 100%; height: auto;" />`
        document.execCommand('insertHTML', false, imageHtml)
        updateValue()
      } else {
        alert('Błąd podczas wysyłania obrazu')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Błąd podczas wysyłania obrazu')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'file')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const fileHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer" class="file-link">
          📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)
        </a>`
        document.execCommand('insertHTML', false, fileHtml)
        updateValue()
      } else {
        alert('Błąd podczas wysyłania pliku')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Błąd podczas wysyłania pliku')
    } finally {
      setIsUploading(false)
    }
  }

  const openImageDialog = () => {
    imageInputRef.current?.click()
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openLinkDialog = () => {
    if (linkButtonRef.current) {
      const rect = linkButtonRef.current.getBoundingClientRect()
      setLinkDialogPosition({
        top: rect.bottom + 5,
        left: rect.left
      })
    }
    setIsLinkDialogOpen(true)
  }

  return (
    <div className={`border border-gray-300 rounded-none ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Pogrubienie"
        >
          <Bold size={16} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Kursywa"
        >
          <Italic size={16} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Podkreślenie"
        >
          <Underline size={16} />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyLeft')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('justifyLeft') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Wyrównaj do lewej"
        >
          <AlignLeft size={16} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyCenter')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('justifyCenter') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Wyśrodkuj"
        >
          <AlignCenter size={16} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyRight')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('justifyRight') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Wyrównaj do prawej"
        >
          <AlignRight size={16} />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('insertUnorderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Lista wypunktowana"
        >
          <List size={16} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          className={`h-8 w-8 p-0 rounded-none ${isActive('insertOrderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Lista numerowana"
        >
          <ListOrdered size={16} />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          className="h-8 w-8 p-0 rounded-none"
          title="Cytat"
        >
          <Quote size={16} />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          ref={linkButtonRef}
          data-link-button
          onClick={openLinkDialog}
          className="h-8 w-8 p-0 rounded-none"
          title="Dodaj link"
        >
          <Link size={16} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeLink}
          className="h-8 w-8 p-0 rounded-none"
          title="Usuń link"
        >
          <Unlink size={16} />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openImageDialog}
          disabled={isUploading}
          className="h-8 w-8 p-0 rounded-none"
          title="Dodaj obraz"
        >
          <Image size={16} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openFileDialog}
          disabled={isUploading}
          className="h-8 w-8 p-0 rounded-none"
          title="Dodaj plik"
        >
          <FileText size={16} />
        </Button>

        {isUploading && (
          <div className="flex items-center gap-2 ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs text-gray-600">Wysyłanie...</span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateValue}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-3 focus:outline-none text-sm"
        style={{ 
          fontFamily: 'inherit',
          lineHeight: '1.5'
        }}
        data-placeholder={placeholder}
      />

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
          }
          e.target.value = ''
        }}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileUpload(file)
          }
          e.target.value = ''
        }}
        className="hidden"
      />

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div 
          className="absolute z-50 bg-white border border-gray-300 rounded-none p-4 shadow-lg link-dialog"
          style={{
            top: `${linkDialogPosition.top}px`,
            left: `${linkDialogPosition.left}px`
          }}
        >
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Tekst linku..."
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-none text-sm"
            />
            <input
              type="url"
              placeholder="URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertLink()
                } else if (e.key === 'Escape') {
                  setIsLinkDialogOpen(false)
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={insertLink}
                disabled={!linkUrl || !linkText}
                className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-sm"
              >
                Dodaj
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsLinkDialogOpen(false)
                  setLinkUrl("")
                  setLinkText("")
                }}
                className="rounded-none text-sm"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
