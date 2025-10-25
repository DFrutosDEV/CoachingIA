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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react';
import { Goal } from '@/types';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('common.dashboard.aiGoalsGenerator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    provider: string;
    available: boolean;
    message: string;
    environment: string;
  } | null>(null);
  const [generatedGoals, setGeneratedGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados para configuración de IA
  const [voiceTone, setVoiceTone] = useState('supportive');
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');
  const [challengeTypes, setChallengeTypes] = useState('mixed');
  const [includeWeekends, setIncludeWeekends] = useState('no');
  const [pdaFile, setPdaFile] = useState<File | null>(null);
  const [isUploadingPda, setIsUploadingPda] = useState(false);

  // Detectar si estamos en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

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

  const handlePdaFileUpload = async (file: File) => {
    setIsUploadingPda(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('objectiveId', objectiveId);
      formData.append('profile', objectiveId); // Usar objectiveId como profile

      const response = await fetch('/api/pda', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPdaFile(file);
          return data.pdaId;
        } else {
          throw new Error(data.error || 'Error al cargar el archivo PDA');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar el archivo PDA');
      }
    } catch (error) {
      console.error('Error al cargar archivo PDA:', error);
      throw error;
    } finally {
      setIsUploadingPda(false);
    }
  };

  const generateGoals = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedGoals([]);

    try {
      let pdaFileId = null;

      // Si hay un archivo PDA, cargarlo primero
      if (pdaFile) {
        pdaFileId = await handlePdaFileUpload(pdaFile);
      }

      const response = await fetch('/api/ai/generate-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: objectiveId,
          numberOfGoals: 30, // Siempre enviar 30 objetivos
          aiConfig: {
            voiceTone,
            difficultyLevel,
            challengeTypes,
            includeWeekends: includeWeekends === 'yes',
            pdaFileId,
          },
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
          {/* Estado de IA - Solo mostrar en desarrollo */}
          {isDevelopment && aiStatus && (
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

          {/* Configuración de IA */}
          <div className="space-y-4">
            <h4 className="font-medium">Configuración de IA</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voiceTone">{t('form.aiConfig.voiceTone')}</Label>
                <Select value={voiceTone} onValueChange={setVoiceTone}>
                  <SelectTrigger className="hover:bg-accent">
                    <SelectValue placeholder={t('form.aiConfig.voiceTonePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="formal">{t('form.aiConfig.voiceToneOptions.formal')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="casual">{t('form.aiConfig.voiceToneOptions.casual')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="motivational">{t('form.aiConfig.voiceToneOptions.motivational')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="supportive">{t('form.aiConfig.voiceToneOptions.supportive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">{t('form.aiConfig.difficultyLevel')}</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger className="hover:bg-accent">
                    <SelectValue placeholder={t('form.aiConfig.difficultyLevelPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="beginner">{t('form.aiConfig.difficultyLevelOptions.beginner')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="intermediate">{t('form.aiConfig.difficultyLevelOptions.intermediate')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="advanced">{t('form.aiConfig.difficultyLevelOptions.advanced')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="expert">{t('form.aiConfig.difficultyLevelOptions.expert')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challengeTypes">{t('form.aiConfig.challengeTypes')}</Label>
                <Select value={challengeTypes} onValueChange={setChallengeTypes}>
                  <SelectTrigger className="hover:bg-accent">
                    <SelectValue placeholder={t('form.aiConfig.challengeTypesPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="physical">{t('form.aiConfig.challengeTypesOptions.physical')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="mental">{t('form.aiConfig.challengeTypesOptions.mental')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="emotional">{t('form.aiConfig.challengeTypesOptions.emotional')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="social">{t('form.aiConfig.challengeTypesOptions.social')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="mixed">{t('form.aiConfig.challengeTypesOptions.mixed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="includeWeekends">{t('form.aiConfig.includeWeekends')}</Label>
                <Select value={includeWeekends} onValueChange={setIncludeWeekends}>
                  <SelectTrigger className="hover:bg-accent">
                    <SelectValue placeholder={t('form.aiConfig.includeWeekendsPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="yes">{t('form.aiConfig.includeWeekendsOptions.yes')}</SelectItem>
                    <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="no">{t('form.aiConfig.includeWeekendsOptions.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdaFile">{t('form.aiConfig.pdaFile')}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="pdaFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdaFile(file);
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('pdaFile')?.click()}
                  disabled={isUploadingPda}
                  className="flex items-center gap-2"
                >
                  {isUploadingPda ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {pdaFile ? pdaFile.name : t('form.aiConfig.pdaFileButton')}
                </Button>
                {pdaFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPdaFile(null)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Botón de generación */}
          <Button
            onClick={generateGoals}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando 30 objetivos con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar 30 objetivos
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
          {/* {aiStatus && !aiStatus.available && (
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
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
