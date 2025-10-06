'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Goal } from '@/types';

interface AIGoalsGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  objectiveId: string;
  objectiveTitle: string;
  onGoalsGenerated: (goals: Goal[]) => void;
}

export function AIGoalsGenerator({
  isOpen,
  onClose,
  objectiveId,
  objectiveTitle,
  onGoalsGenerated,
}: AIGoalsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [numberOfGoals, setNumberOfGoals] = useState(5);
  const [aiStatus, setAiStatus] = useState<{
    provider: string;
    available: boolean;
    message: string;
    environment: string;
  } | null>(null);
  const [generatedGoals, setGeneratedGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Verificar estado de AI al abrir el modal
  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/generate-goals');
      const data = await response.json();

      setAiStatus({
        provider: data.provider || 'AI Service',
        available: data.available || false,
        message: data.message || 'Estado desconocido',
        environment: data.environment || 'unknown',
      });
    } catch (error) {
      setAiStatus({
        provider: 'AI Service',
        available: false,
        message: 'Error de conexión',
        environment: 'unknown',
      });
    }
  };

  const generateGoals = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedGoals([]);

    try {
      const response = await fetch('/api/ai/generate-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: objectiveId,
          numberOfGoals,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error generando objetivos');
      }

      setGeneratedGoals(data.goals);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptGoals = () => {
    onGoalsGenerated(generatedGoals);
    onClose();
    setGeneratedGoals([]);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    setGeneratedGoals([]);
    setError(null);
    setAiStatus(null);
  };

  // Verificar AI cuando se abre el modal
  if (isOpen && !aiStatus) {
    checkAIStatus();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generar Objetivos con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado de Gemini */}
          {aiStatus && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg border">
                {aiStatus.available ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{aiStatus.provider}</p>
                  <p className="text-xs text-muted-foreground">
                    {aiStatus.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entorno: {aiStatus.environment}
                  </p>
                </div>
                <Badge variant={aiStatus.available ? 'active' : 'inactive'}>
                  {aiStatus.available ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
            </div>
          )}

          {/* Información del objetivo */}
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-1">Objetivo Principal</h4>
            <p className="text-sm text-muted-foreground">{objectiveTitle}</p>
          </div>

          {/* Configuración */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Número de objetivos a generar
            </label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map(num => (
                <Button
                  key={num}
                  variant={numberOfGoals === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNumberOfGoals(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Botón de generación */}
          <Button
            onClick={generateGoals}
            disabled={!aiStatus?.available || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando objetivos con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar {numberOfGoals} objetivos
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Objetivos generados */}
          {generatedGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Objetivos Generados</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {generatedGoals.map((goal, index) => (
                  <div key={goal._id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {goal.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Día: {goal.day}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAcceptGoals} className="flex-1">
                  Aceptar Objetivos
                </Button>
                <Button variant="outline" onClick={() => setGeneratedGoals([])}>
                  Regenerar
                </Button>
              </div>
            </div>
          )}

          {/* Instrucciones de configuración */}
          {aiStatus && !aiStatus.available && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <h4 className="font-medium text-amber-800 mb-2">Configurar IA</h4>
              <ol className="text-sm text-amber-700 space-y-1">
                <li>
                  1. Configura la variable{' '}
                  <code className="bg-amber-100 px-1 rounded">AI_PROVIDER</code>{' '}
                  en tu archivo{' '}
                  <code className="bg-amber-100 px-1 rounded">.env.local</code>:
                </li>
                <li>
                  • Para Google Gemini:{' '}
                  <code className="bg-amber-100 px-1 rounded">
                    AI_PROVIDER=google
                  </code>{' '}
                  y{' '}
                  <code className="bg-amber-100 px-1 rounded">
                    GOOGLE_AI_API_KEY=tu_api_key
                  </code>
                </li>
                <li>
                  • Para DeepSeek:{' '}
                  <code className="bg-amber-100 px-1 rounded">
                    AI_PROVIDER=deepseek
                  </code>{' '}
                  y{' '}
                  <code className="bg-amber-100 px-1 rounded">
                    DEEPSEEK_API_KEY=tu_api_key
                  </code>
                </li>
                <li>2. Reinicia la aplicación</li>
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
