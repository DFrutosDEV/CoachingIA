'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Target, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectiveId: string;
  clientId?: string;
  coachId?: string;
  onGoalCreated: () => void;
}

export function CreateGoalModal({
  isOpen,
  onClose,
  objectiveId,
  clientId,
  coachId,
  onGoalCreated,
}: CreateGoalModalProps) {
  const t = useTranslations('common.dashboard.createGoal');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [aforism, setAforism] = useState('');
  const [tiempoEstimado, setTiempoEstimado] = useState('');
  const [ejemplo, setEjemplo] = useState('');
  const [indicadorExito, setIndicadorExito] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!description.trim()) {
      toast.error(t('errors.descriptionRequired'));
      return;
    }

    if (!startDate.trim()) {
      toast.error(t('errors.startDateRequired'));
      return;
    }

    try {
      setSaving(true);

      // Convertir la fecha al formato ISO
      const dateParts = startDate.split('-');
      const selectedDate = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
        12,
        0,
        0
      );
      const dayOfMonth = selectedDate.getDate().toString();
      const dateISOString = selectedDate.toISOString();

      const goalData = {
        objectiveId,
        description: description.trim(),
        day: dayOfMonth,
        date: dateISOString,
        aforism: aforism.trim() || '',
        tiempoEstimado: tiempoEstimado.trim() || '',
        ejemplo: ejemplo.trim() || '',
        indicadorExito: indicadorExito.trim() || '',
      };

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errors.createGoal'));
      }

      const data = await response.json();
      if (data.success) {
        toast.success(t('success.goalCreated'));
        onGoalCreated();
        handleClose();
      } else {
        throw new Error(t('errors.createGoal'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error ? error.message : t('errors.createGoal')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setStartDate('');
    setAforism('');
    setTiempoEstimado('');
    setEjemplo('');
    setIndicadorExito('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descripción - Obligatorio */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('form.description')} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder={t('form.descriptionPlaceholder')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 {t('form.characters')}
            </p>
          </div>

          {/* Fecha de inicio - Obligatorio */}
          <div className="space-y-2">
            <Label htmlFor="startDate">
              {t('form.startDate')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('form.startDateHelper')}
            </p>
          </div>

          {/* Sección de campos opcionales - Colapsable */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {t('form.optionalFields')} {showOptionalFields ? t('form.hide') : t('form.show')}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${showOptionalFields ? 'rotate-180' : 'rotate-0'
                  }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${showOptionalFields
                ? 'max-h-[2000px] opacity-100'
                : 'max-h-0 opacity-0'
                }`}
            >
              <div
                className={`mt-4 space-y-4 transition-all duration-500 ease-in-out ${showOptionalFields
                  ? 'opacity-100 translate-y-0 delay-75'
                  : 'opacity-0 -translate-y-2'
                  }`}
              >
                {/* Aforismo - Opcional */}
                <div className="space-y-2">
                  <Label htmlFor="aforism">{t('form.aforism')}</Label>
                  <Input
                    id="aforism"
                    placeholder={t('form.aforismPlaceholder')}
                    value={aforism}
                    onChange={e => setAforism(e.target.value)}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground">
                    {aforism.length}/300 {t('form.characters')}
                  </p>
                </div>

                {/* Tiempo Estimado - Opcional */}
                <div className="space-y-2">
                  <Label htmlFor="tiempoEstimado">{t('form.tiempoEstimado')}</Label>
                  <Input
                    id="tiempoEstimado"
                    placeholder={t('form.tiempoEstimadoPlaceholder')}
                    value={tiempoEstimado}
                    onChange={e => setTiempoEstimado(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {tiempoEstimado.length}/100 {t('form.characters')}
                  </p>
                </div>

                {/* Ejemplo - Opcional */}
                <div className="space-y-2">
                  <Label htmlFor="ejemplo">{t('form.ejemplo')}</Label>
                  <Textarea
                    id="ejemplo"
                    placeholder={t('form.ejemploPlaceholder')}
                    value={ejemplo}
                    onChange={e => setEjemplo(e.target.value)}
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {ejemplo.length}/500 {t('form.characters')}
                  </p>
                </div>

                {/* Indicador de Éxito - Opcional */}
                <div className="space-y-2">
                  <Label htmlFor="indicadorExito">{t('form.indicadorExito')}</Label>
                  <Textarea
                    id="indicadorExito"
                    placeholder={t('form.indicadorExitoPlaceholder')}
                    value={indicadorExito}
                    onChange={e => setIndicadorExito(e.target.value)}
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {indicadorExito.length}/500 {t('form.characters')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              {t('buttons.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !description.trim() || !startDate.trim()}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('buttons.creating')}
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  {t('buttons.create')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

