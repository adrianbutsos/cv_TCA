"use client"

import { Button } from "@/components/ui/button"
import type { CVData } from "@/lib/cv-types"
import { CVTemplate, type TemplateType } from "../cv-templates"
import { FileText, Pencil, Save, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type { Language } from "@/lib/translations"
import { translateCVData } from "@/lib/cv-translator"

interface PreviewStepProps {
  data: CVData
  onEditSection?: (step: number) => void
}

const templates: { id: TemplateType; name: string }[] = [
  { id: "harvard", name: "Harvard" },
  { id: "modern", name: "Modern" },
  { id: "minimal", name: "Minimal" },
]

export function PreviewStep({ data, onEditSection }: PreviewStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("harvard")
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en")
  const [saving, setSaving] = useState(false)
  const [translatedData, setTranslatedData] = useState<CVData>(data)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const cvRef = useRef<HTMLDivElement>(null)

  // Translate data when language changes
  useEffect(() => {
    const performTranslation = async () => {
      if (selectedLanguage === 'en') {
        setTranslatedData(data)
        return
      }

      setIsTranslating(true)
      try {
        const translated = await translateCVData(data, selectedLanguage)
        setTranslatedData(translated)
      } catch (error) {
        console.error('[v0] Translation error:', error)
        setTranslatedData(data)
      } finally {
        setIsTranslating(false)
      }
    }

    performTranslation()
  }, [selectedLanguage, data])

  const handleSaveProgress = () => {
    setSaving(true)
    // Simulate save (UI only)
    setTimeout(() => {
      setSaving(false)
      alert("Progress saved! (Demo only)")
    }, 1000)
  }

  const handleExportPDF = () => {
    if (!cvRef.current) return
    setIsExporting(true)

    // Collect styles from the current page (same-origin only)
    const styleSheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n')
        } catch {
          return sheet.href ? `@import url('${sheet.href}');` : ''
        }
      })
      .join('\n')

    const cvHTML = cvRef.current.innerHTML
    const name = (data.personalInfo?.fullName || 'CV').replace(/\s+/g, '_')

    // Build the full HTML document to print
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${name}</title>
  <style>
    ${styleSheets}
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="p-8 bg-white text-black max-w-4xl mx-auto">${cvHTML}</div>
</body>
</html>`

    // Create a hidden iframe — never blocked by browsers (no popup)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.left = '-9999px'
    iframe.style.width = '210mm'
    iframe.style.height = '297mm'
    iframe.style.border = 'none'

    const doPrint = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (err) {
        console.error('[v0] print() error:', err)
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          setIsExporting(false)
        }, 1000)
      }
    }

    // Assign onload BEFORE appending to DOM to avoid race condition
    iframe.onload = doPrint

    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      document.body.removeChild(iframe)
      setIsExporting(false)
      return
    }

    iframeDoc.open()
    iframeDoc.write(html)
    iframeDoc.close()

    // Fallback: if onload never fires (some browsers skip it after write()),
    // trigger print after a short delay anyway
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        doPrint()
      }
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Preview Your CV</h2>
          <p className="text-muted-foreground mt-1">
            {"Review your CV and export when ready."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveProgress}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Progress"}
        </Button>
      </div>

      {/* Template Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Template:</span>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedTemplate === template.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">CV Language:</span>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(['en', 'es', 'de'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedLanguage === lang
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Deutsch'}
            </button>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      {/* CV Preview with Edit Buttons */}
      <div className="relative bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {isTranslating && (
          <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center gap-3 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">Translating CV...</span>
          </div>
        )}
        {/* Section Edit Buttons */}
        {onEditSection && (
          <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
            <EditButton label="Personal" onClick={() => onEditSection(1)} />
            <EditButton label="Education" onClick={() => onEditSection(2)} />
            <EditButton label="Experience" onClick={() => onEditSection(3)} />
            <EditButton label="Leadership" onClick={() => onEditSection(4)} />
            <EditButton label="Skills" onClick={() => onEditSection(5)} />
          </div>
        )}
        
        <div ref={cvRef}>
          <CVTemplate data={translatedData} template={selectedTemplate} language={selectedLanguage} />
        </div>
      </div>
    </div>
  )
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      className="h-7 text-xs gap-1 opacity-70 hover:opacity-100"
    >
      <Pencil className="h-3 w-3" />
      {label}
    </Button>
  )
}
