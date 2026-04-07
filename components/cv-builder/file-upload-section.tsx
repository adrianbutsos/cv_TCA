'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { parseFile, getSupportedFormatsText } from '@/lib/file-parser';
import { extractAllData, ExtractedData, getConfidenceScore } from '@/lib/text-extractors';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface FileUploadSectionProps {
  onDataExtracted: (data: ExtractedData) => void;
}

export function FileUploadSection({ onDataExtracted }: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    setUploadedFileName(file.name);

    try {
      console.log('[v0] Starting file parsing:', file.name);
      
      // Parse the file to extract text
      const extractedText = await parseFile(file);
      console.log('[v0] File parsed successfully, extracting data...');

      // Extract structured data from the text
      const data = extractAllData(extractedText);
      setExtractedData(data);
      setShowPreview(true);

      console.log('[v0] Data extracted:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      setExtractedData(null);
      setUploadedFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      setShowPreview(false);
      setExtractedData(null);
      setUploadedFileName(null);
    }
  };

  const handleDiscard = () => {
    setShowPreview(false);
    setExtractedData(null);
    setUploadedFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confidenceScore = extractedData ? getConfidenceScore(extractedData) : 0;

  return (
    <>
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Importar Información</CardTitle>
          <CardDescription>
            Carga tu CV, diploma, certificado u otro documento. Extraeremos automáticamente tu información de contacto y datos personales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={'.pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.gif,.bmp'}
              className="hidden"
              disabled={isLoading}
            />

            <div className="space-y-3">
              {isLoading ? (
                <>
                  <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                  <p className="text-sm font-medium">Procesando archivo...</p>
                  <p className="text-xs text-muted-foreground">{uploadedFileName}</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Arrastra tu archivo aquí o{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:underline font-semibold"
                      >
                        haz clic para seleccionar
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos soportados: {getSupportedFormatsText()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Error al procesar</p>
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-destructive hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Success Message */}
          {uploadedFileName && !isLoading && !error && (
            <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Archivo procesado correctamente
                </p>
                <p className="text-xs text-green-800 dark:text-green-200">{uploadedFileName}</p>
              </div>
            </div>
          )}

          {/* Info Message */}
          <p className="text-xs text-muted-foreground">
            💡 Los archivos se procesan localmente en tu navegador. No se guardan ni se envían a servidores.
          </p>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <AlertDialogTitle>Vista previa de datos extraídos</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 py-4">
              {/* Confidence Score */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground mb-1">
                    Confianza de datos
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        confidenceScore > 70
                          ? 'bg-green-500'
                          : confidenceScore > 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${confidenceScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {confidenceScore}% - {confidenceScore > 70 ? 'Alta' : confidenceScore > 40 ? 'Media' : 'Baja'}
                  </p>
                </div>
              </div>

              {/* Extracted Data Preview */}
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                {extractedData?.name && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre</label>
                    <p className="text-sm font-medium">{extractedData.name}</p>
                  </div>
                )}

                {extractedData?.email && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                    <p className="text-sm">{extractedData.email}</p>
                  </div>
                )}

                {extractedData?.phone && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Teléfono</label>
                    <p className="text-sm">{extractedData.phone}</p>
                  </div>
                )}

                {extractedData?.location && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Ubicación</label>
                    <p className="text-sm">{extractedData.location}</p>
                  </div>
                )}

                {extractedData?.title && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Puesto</label>
                    <p className="text-sm">{extractedData.title}</p>
                  </div>
                )}

                {extractedData?.linkedIn && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">LinkedIn</label>
                    <p className="text-sm truncate hover:text-clip">
                      <a href={extractedData.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {extractedData.linkedIn}
                      </a>
                    </p>
                  </div>
                )}

                {extractedData?.website && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Sitio Web</label>
                    <p className="text-sm truncate hover:text-clip">
                      <a href={extractedData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {extractedData.website}
                      </a>
                    </p>
                  </div>
                )}

                {extractedData?.bio && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Resumen Profesional</label>
                    <p className="text-sm line-clamp-3">{extractedData.bio}</p>
                  </div>
                )}

                {!extractedData?.name &&
                  !extractedData?.email &&
                  !extractedData?.phone && (
                    <p className="text-xs text-muted-foreground italic">
                      No se encontraron datos estructurados. Verifica el archivo e intenta nuevamente.
                    </p>
                  )}
              </div>

              <p className="text-xs text-muted-foreground">
                Puedes ajustar estos valores en los campos de abajo después de aplicarlos.
              </p>
            </div>
          </AlertDialogDescription>

          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={handleDiscard}>
              Descartar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyData}>
              Aplicar Datos
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
