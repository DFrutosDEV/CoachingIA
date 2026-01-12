'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface FilePreviewModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
}: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  useEffect(() => {
    if (file && isOpen) {
      // Obtener el tipo de archivo
      const type = file.type || '';
      setFileType(type);

      // Solo crear URL para PDFs (iframe funciona bien)
      if (type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Limpiar URL cuando se cierre el modal
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
      setFileType(null);
    }
  }, [file, isOpen]);

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!file) return null;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isWord = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b flex flex-row justify-between items-center">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold">{file.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {isPdf && previewUrl ? (
            <div className="w-full h-full min-h-[500px]">
              <iframe
                src={previewUrl}
                className="w-full h-[500px] border rounded-md"
                title="Preview del archivo PDF"
              />
            </div>
          ) : isWord ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Vista previa no disponible
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Los archivos de Word (.doc, .docx) no se pueden previsualizar en el navegador.
                Por favor, descarga el archivo para verlo.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-md text-sm">
                <p className="font-medium mb-2">Información del archivo:</p>
                <p className="text-muted-foreground">Nombre: {file.name}</p>
                <p className="text-muted-foreground">Tamaño: {formatFileSize(file.size)}</p>
                <p className="text-muted-foreground">Tipo: {file.type || 'application/msword'}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tipo de archivo no compatible
              </h3>
              <p className="text-muted-foreground mb-4">
                No se puede previsualizar este tipo de archivo.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-md text-sm">
                <p className="font-medium mb-2">Información del archivo:</p>
                <p className="text-muted-foreground">Nombre: {file.name}</p>
                <p className="text-muted-foreground">Tamaño: {formatFileSize(file.size)}</p>
                <p className="text-muted-foreground">Tipo: {file.type || 'desconocido'}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
