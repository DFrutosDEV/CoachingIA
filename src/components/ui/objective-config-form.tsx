'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardMinus, CheckCircle, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigQuestion {
  _id: string;
  title: string;
  isObligatory: boolean;
}

interface ConfigFileItem {
  question: string;
  answer: string;
}

interface ObjectiveConfigFormProps {
  objectiveId: string;
  isReadOnly?: boolean;
  handleConfigFormCompleted?: (isCompleted: boolean) => void;
}

export function ObjectiveConfigForm({
  objectiveId,
  isReadOnly = false,
  handleConfigFormCompleted,
}: ObjectiveConfigFormProps) {
  const [configQuestions, setConfigQuestions] = useState<ConfigQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configFile, setConfigFile] = useState<ConfigFileItem[]>([]);
  const [hasConfigFile, setHasConfigFile] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'view'>('form');

  // Cargar preguntas de configuración
  const loadConfigQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config-forms');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfigQuestions(data.data);
          setAnswers(new Array(data.data.length).fill(''));
        }
      }
    } catch (error) {
      console.error('Error al cargar preguntas de configuración:', error);
      toast.error('Error al cargar las preguntas de configuración');
    } finally {
      setLoading(false);
    }
  };

  // Cargar respuestas existentes del formulario
  const loadExistingConfig = async () => {
    try {
      const response = await fetch(`/api/objectives/${objectiveId}/config`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfigFile(data.data.configFile);
          setHasConfigFile(data.data.hasConfigFile);

          if (data.data.hasConfigFile) {
            setActiveTab('view');
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración existente:', error);
    }
  };

  useEffect(() => {
    loadConfigQuestions();
    loadExistingConfig();
  }, [objectiveId]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Validar que todas las preguntas obligatorias estén respondidas
    const requiredQuestions = configQuestions.filter(q => q.isObligatory);
    const missingAnswers = requiredQuestions.some((_, index) => {
      const questionIndex = configQuestions.findIndex(
        q => q._id === requiredQuestions[index]._id
      );
      return !answers[questionIndex] || answers[questionIndex].trim() === '';
    });

    if (missingAnswers) {
      toast.error('Por favor responde todas las preguntas obligatorias');
      return;
    }

    try {
      setSaving(true);

      const configFileData = configQuestions.map((question, index) => ({
        question: question.title,
        answer: answers[index] || '',
      }));

      const response = await fetch(`/api/objectives/${objectiveId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configFile: configFileData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el formulario');
      }

      const data = await response.json();
      setConfigFile(configFileData);
      setHasConfigFile(true);
      setActiveTab('view');
      toast.success('Formulario de configuración guardado correctamente');
      handleConfigFormCompleted?.(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al guardar el formulario'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Cargando formulario...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardMinus className="h-5 w-5" />
            Formulario de Configuración
          </CardTitle>
          {hasConfigFile && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasConfigFile ? (
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'form' | 'view')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Ver Respuestas
              </TabsTrigger>
              <TabsTrigger
                value="form"
                className="flex items-center gap-1"
                disabled
              >
                <Edit className="h-4 w-4" />
                Editar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4 mt-4">
              <div className="space-y-4">
                {configFile.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="mb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Pregunta {index + 1}
                      </Label>
                      <p className="text-sm mt-1">{item.question}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Respuesta
                      </Label>
                      <p className="text-sm mt-1 bg-muted p-2 rounded">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="form" className="mt-4">
              <div className="text-center py-8">
                <ClipboardMinus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  El formulario ya ha sido completado y no se puede modificar
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {configQuestions.map((question, index) => (
              <div key={question._id} className="space-y-2">
                <Label className="text-sm font-medium">
                  {question.title}
                  {question.isObligatory && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={answers[index] || ''}
                  onChange={e => handleAnswerChange(index, e.target.value)}
                  className="min-h-[80px]"
                  disabled={isReadOnly}
                />
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={saving || isReadOnly}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Guardar Formulario
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
