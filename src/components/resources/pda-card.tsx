'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@mui/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface PdaData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export function PdaCard() {
  const [pdaData, setPdaData] = useState<PdaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { token } = useAuth();

  // Cargar datos del PDA al montar el componente
  useEffect(() => {
    fetchPdaData();
  }, []);

  const fetchPdaData = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/pda', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setPdaData(data.data);
      } else {
        setPdaData(null);
      }
    } catch (error) {
      console.error('Error al cargar PDA:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !token) return;

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('El archivo no puede ser mayor a 10MB');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pda', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setPdaData(data.data);
        setFile(null);
        setIsOpen(false);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/pda/download', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdaData?.fileName || 'pda.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Error al descargar el archivo');
      }
    } catch (error) {
      toast.error('Error al descargar el archivo');
    }
  };

  const handleDelete = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/pda', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setPdaData(null);
        setIsOpen(false);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al eliminar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Tu PDA</CardTitle>
          <CardDescription>
            Gestiona tu Análisis de Desarrollo Personal (PDA)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Visualiza tu PDA</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Descarga tu PDA</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Comparte tu PDA</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outlined" className="w-full">
                Visualiza tu PDA
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {pdaData ? 'Actualizar PDA' : 'Cargar PDA'}
                </DialogTitle>
                <DialogDescription>
                  {pdaData
                    ? 'Selecciona un nuevo archivo PDF para reemplazar tu PDA actual'
                    : 'Selecciona un archivo PDF para cargar tu PDA'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pda-file">Archivo PDF</Label>
                  <Input
                    id="pda-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {file && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Archivo seleccionado: {file.name} (
                        {formatFileSize(file.size)})
                      </p>
                      {file.size > 10 * 1024 * 1024 && (
                        <p className="text-red-500 font-medium">
                          ⚠️ El archivo es demasiado grande (máximo 10MB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleFileUpload}
                    disabled={
                      !file || loading || (file && file.size > 10 * 1024 * 1024)
                    }
                    className="flex-1"
                  >
                    {loading
                      ? 'Cargando...'
                      : pdaData
                        ? 'Actualizar'
                        : 'Cargar'}
                  </Button>

                  {pdaData && (
                    <Button
                      variant="outlined"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* <Card className="flex flex-col">
        <CardHeader className="pb-3">
          
          <CardDescription>
            Gestiona tu Análisis de Desarrollo Personal (PDA)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {pdaData ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">{pdaData.fileName}</p>
                <p className="text-muted-foreground">
                  {formatFileSize(pdaData.fileSize)} • {formatDate(pdaData.uploadedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsOpen(true)}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                No tienes un PDA cargado aún
              </p>
              <Button 
                onClick={() => setIsOpen(true)}
                size="sm"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar PDA
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

       */}
    </>
  );
}
