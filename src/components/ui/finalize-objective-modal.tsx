'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface FinalizeObjectiveModalProps {
  objectiveId: string;
  objectiveTitle: string;
  onObjectiveFinalized?: () => void;
}

export function FinalizeObjectiveModal({
  objectiveId,
  objectiveTitle,
  onObjectiveFinalized,
}: FinalizeObjectiveModalProps) {
  const t = useTranslations('common.dashboard.finalizeObjective');
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalizeObjective = async () => {
    if (!feedback.trim()) {
      toast.error(t('errors.feedbackRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/objective/finalize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          feedback: feedback.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('success.objectiveFinalized'));
        setIsOpen(false);
        setFeedback('');
        onObjectiveFinalized?.();
      } else {
        toast.error(t('errors.errorWithMessage', { error: result.error }));
      }
    } catch (error) {
      console.error('Error finalizando objetivo:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir propagación del evento
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="outlined"
        color="success"
        startIcon={<CheckCircle />}
        size="small"
        onClick={handleButtonClick}
      >
        {t('button')}
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>
            {t('modal.description')}{' '}
            <strong>"{objectiveTitle}"</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feedback">{t('modal.fields.feedback')}</Label>
            <Textarea
              id="feedback"
              placeholder={t('modal.fields.feedbackPlaceholder')}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={6}
              maxLength={500}
            />
            <small className="text-sm text-muted-foreground">
              {t('modal.fields.characterCount', { count: feedback.length })}
            </small>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              setIsOpen(false);
              setFeedback('');
            }}
            disabled={isSubmitting}
          >
            {t('modal.buttons.cancel')}
          </Button>
          <Button
            onClick={handleFinalizeObjective}
            disabled={isSubmitting || !feedback.trim()}
            startIcon={
              isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle />
              )
            }
          >
            {isSubmitting ? t('modal.buttons.finalizing') : t('modal.buttons.finalize')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
