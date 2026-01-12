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
import { Loader2, Sparkles, AlertCircle, CheckCircle, Upload, Edit, Calendar, Clock, Lightbulb, CheckCircle2, Eye, X, Info } from 'lucide-react';
import { Goal } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useDateFormatter } from '@/utils/date-formatter';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FilePreviewModal } from './file-preview-modal';
import { Tooltip } from '@mui/material';

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
  const locale = useLocale();
  const { token } = useAuth();
  const { formatDate: formatDateWithLocale } = useDateFormatter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    provider: string;
    available: boolean;
    message: string;
    environment: string;
  } | null>(null);
  const [generatedGoals, setGeneratedGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Estados para configuración de IA
  const [voiceTone, setVoiceTone] = useState('supportive');
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');
  const [challengeTypes, setChallengeTypes] = useState('mixed');
  const [includeWeekends, setIncludeWeekends] = useState('no');
  const [pdaFile, setPdaFile] = useState<File | null>(null);
  const [isUploadingPda, setIsUploadingPda] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Detectar si estamos en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Verificar estado de AI al abrir el modal
  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/generate-goals?locale=' + locale);

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
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    setIsUploadingPda(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('objectiveId', objectiveId);
      formData.append('profile', objectiveId); // Usar objectiveId como profile

      const response = await fetch('/api/pda', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      const response = await fetch('/api/ai/generate-goals?locale=' + locale, {
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

  const handleEditGoal = (goalId: string, field: string, value: string | Date) => {
    setGeneratedGoals(prevGoals =>
      prevGoals.map(goal =>
        goal._id === goalId
          ? {
            ...goal,
            [field]: value,
            // Si se edita la fecha, actualizar también el campo day
            ...(field === 'date' && {
              day: new Date(value as string).getDate().toString()
            })
          }
          : goal
      )
    );
  };

  const handleToggleEdit = (goalId: string) => {
    setEditingGoalId(editingGoalId === goalId ? null : goalId);
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const handleToggleExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const handleAcceptGoals = () => {
    onGoalsGenerated(generatedGoals);
    onClose();
    setGeneratedGoals([]);
    setError(null);
    setEditingGoalId(null);
    setExpandedGoalId(null);
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
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generar Objetivos con IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
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
              <h4 className="font-medium mb-1">{t('mainObjective')}</h4>
              <p className="text-sm text-muted-foreground">{objectiveTitle}</p>
            </div>

            {/* Configuración de IA */}
            <div className="space-y-4">
              <h4 className="font-medium">{t('form.aiConfig.title')}</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2" htmlFor="voiceTone">{t('form.aiConfig.voiceTone')}</Label>
                    <Tooltip title={t('form.aiConfig.voiceToneTooltip')} arrow>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Tooltip>
                  </div>
                  <Select value={voiceTone} onValueChange={setVoiceTone}>
                    <SelectTrigger className="hover:bg-accent">
                      <SelectValue placeholder={t('form.aiConfig.voiceTonePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem className="bg-background-hover" value="formal">{t('form.aiConfig.voiceToneOptions.formal')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="casual">{t('form.aiConfig.voiceToneOptions.casual')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="motivational">{t('form.aiConfig.voiceToneOptions.motivational')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="supportive">{t('form.aiConfig.voiceToneOptions.supportive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2" htmlFor="difficultyLevel">{t('form.aiConfig.difficultyLevel')}</Label>
                    <Tooltip title={t('form.aiConfig.difficultyLevelTooltip')} arrow>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Tooltip>
                  </div>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectTrigger className="hover:bg-accent">
                      <SelectValue placeholder={t('form.aiConfig.difficultyLevelPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem className="bg-background-hover" value="beginner">{t('form.aiConfig.difficultyLevelOptions.beginner')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="intermediate">{t('form.aiConfig.difficultyLevelOptions.intermediate')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="advanced">{t('form.aiConfig.difficultyLevelOptions.advanced')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="expert">{t('form.aiConfig.difficultyLevelOptions.expert')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2" htmlFor="challengeTypes">{t('form.aiConfig.challengeTypes')}</Label>
                    <Tooltip title={t('form.aiConfig.challengeTypesTooltip')} arrow>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Tooltip>
                  </div>
                  <Select value={challengeTypes} onValueChange={setChallengeTypes}>
                    <SelectTrigger className="hover:bg-accent">
                      <SelectValue placeholder={t('form.aiConfig.challengeTypesPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {/* <SelectItem className="hover:bg-accent hover:text-accent-foreground" value="physical">{t('form.aiConfig.challengeTypesOptions.physical')}</SelectItem> */}
                      <SelectItem className="bg-background-hover" value="mental">{t('form.aiConfig.challengeTypesOptions.mental')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="emotional">{t('form.aiConfig.challengeTypesOptions.emotional')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="social">{t('form.aiConfig.challengeTypesOptions.social')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="mixed">{t('form.aiConfig.challengeTypesOptions.mixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2" htmlFor="includeWeekends">{t('form.aiConfig.includeWeekends')}</Label>
                    <Tooltip title={t('form.aiConfig.includeWeekendsTooltip')} arrow>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Tooltip>
                  </div>
                  <Select value={includeWeekends} onValueChange={setIncludeWeekends}>
                    <SelectTrigger className="hover:bg-accent">
                      <SelectValue placeholder={t('form.aiConfig.includeWeekendsPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem className="bg-background-hover" value="yes">{t('form.aiConfig.includeWeekendsOptions.yes')}</SelectItem>
                      <SelectItem className="bg-background-hover" value="no">{t('form.aiConfig.includeWeekendsOptions.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2" htmlFor="pdaFile">{t('form.aiConfig.pdaFile')}</Label>
                  <Tooltip title={t('form.aiConfig.pdaFileTooltip')} arrow>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="pdaFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPdaFile(file);
                        setIsPreviewOpen(true);
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
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreviewOpen(true)}
                        title="Ver preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPdaFile(null)}
                        title="Eliminar archivo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
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
                  {t('buttons.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('buttons.generate')}
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
                <h4 className="font-medium">{t('success.goalsGenerated')} ({generatedGoals.length})</h4>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {generatedGoals.map((goal, index) => {
                    const isEditing = editingGoalId === goal._id;
                    const isExpanded = expandedGoalId === goal._id || isEditing;

                    return (
                      <div key={goal._id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Número y Descripción */}
                            <div className="flex items-start gap-2 mb-2">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {index + 1}
                              </Badge>
                              {isEditing ? (
                                <Textarea
                                  value={goal.description || ''}
                                  onChange={(e) => handleEditGoal(goal._id, 'description', e.target.value)}
                                  className="min-h-[60px] text-sm"
                                  placeholder="Descripción del objetivo"
                                />
                              ) : (
                                <p className="text-sm font-medium flex-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>

                            {/* Fecha - Siempre visible */}
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={goal.date ? new Date(goal.date).toISOString().split('T')[0] : ''}
                                  onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    newDate.setHours(12, 0, 0, 0);
                                    handleEditGoal(goal._id, 'date', newDate.toISOString());
                                  }}
                                  className="text-xs h-8"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {goal.date ? formatDateWithLocale(new Date(goal.date), 'short') : 'Sin fecha'}
                                </span>
                              )}
                            </div>

                            {/* Campos opcionales - Expandibles */}
                            {isExpanded && (
                              <div className="space-y-2 mt-3 pt-3 border-t">
                                {/* Aforismo */}
                                {(goal.aforism || isEditing) && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                                      <Label className="text-xs font-medium">Aforismo</Label>
                                    </div>
                                    {isEditing ? (
                                      <Input
                                        value={goal.aforism || ''}
                                        onChange={(e) => handleEditGoal(goal._id, 'aforism', e.target.value)}
                                        placeholder="Aforismo motivacional"
                                        className="text-xs h-8"
                                        maxLength={300}
                                      />
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic pl-4">
                                        "{goal.aforism}"
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Tiempo Estimado */}
                                {(goal.tiempoEstimado || isEditing) && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <Label className="text-xs font-medium">Tiempo Estimado</Label>
                                    </div>
                                    {isEditing ? (
                                      <Input
                                        value={goal.tiempoEstimado || ''}
                                        onChange={(e) => handleEditGoal(goal._id, 'tiempoEstimado', e.target.value)}
                                        placeholder="Ej: 30 minutos"
                                        className="text-xs h-8"
                                        maxLength={100}
                                      />
                                    ) : (
                                      <p className="text-xs text-muted-foreground pl-4">
                                        {goal.tiempoEstimado}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Ejemplo */}
                                {(goal.ejemplo || isEditing) && (
                                  <div className="space-y-1">
                                    <Label className="text-xs font-medium">Ejemplo</Label>
                                    {isEditing ? (
                                      <Textarea
                                        value={goal.ejemplo || ''}
                                        onChange={(e) => handleEditGoal(goal._id, 'ejemplo', e.target.value)}
                                        placeholder="Ejemplo práctico"
                                        className="text-xs min-h-[60px]"
                                        maxLength={500}
                                      />
                                    ) : (
                                      <p className="text-xs text-muted-foreground pl-2">
                                        {goal.ejemplo}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Indicador de Éxito */}
                                {(goal.indicadorExito || isEditing) && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                                      <Label className="text-xs font-medium">Indicador de Éxito</Label>
                                    </div>
                                    {isEditing ? (
                                      <Textarea
                                        value={goal.indicadorExito || ''}
                                        onChange={(e) => handleEditGoal(goal._id, 'indicadorExito', e.target.value)}
                                        placeholder="Criterio de éxito medible"
                                        className="text-xs min-h-[60px]"
                                        maxLength={500}
                                      />
                                    ) : (
                                      <p className="text-xs text-muted-foreground pl-4">
                                        {goal.indicadorExito}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Botón para expandir/colapsar */}
                            {!isEditing && (
                              <button
                                onClick={() => handleToggleExpand(goal._id)}
                                className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3" />
                                    Ocultar detalles
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3" />
                                    Ver detalles
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Botón de editar */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleEdit(goal._id)}
                            className="shrink-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Botones de guardar/cancelar cuando está editando */}
                        {isEditing && (
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGoalId(null)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setEditingGoalId(null)}
                              className="flex-1"
                            >
                              Guardar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAcceptGoals} className="flex-1">
                    {t('buttons.accept')}
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedGoals([])}>
                    {t('buttons.regenerate')}
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

      <FilePreviewModal
        file={pdaFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}
