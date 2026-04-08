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

    try {
      // Collect all stylesheets from the current page
      const styleSheets = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n')
          } catch {
            // Cross-origin stylesheets can't be read; use link tag instead
            if (sheet.href) return `@import url('${sheet.href}');`
            return ''
          }
        })
        .join('\n')

      const cvHTML = cvRef.current.innerHTML

      const printWindow = window.open('', '_blank', 'width=900,height=700')
      if (!printWindow) {
        alert('Please allow popups for this site to export PDF.')
        setIsExporting(false)
        return
      }

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${data.personalInfo?.fullName || 'CV'}</title>
  <style>
    ${styleSheets}
    /* Reset for print */
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: Georgia, 'Times New Roman', serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page {
      size: A4 portrait;
      margin: 10mm 15mm;
    }
    @media print {
      body { margin: 0; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="p-8 bg-white text-black max-w-4xl mx-auto">
    ${cvHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 500);
    };
  <\/script>
</body>
</html>`)

      printWindow.document.close()
    } catch (error) {
      console.error('[v0] PDF export error:', error)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
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
