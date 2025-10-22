'use client';

import { useState } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TicketCard() {
  const t = useTranslations('common.dashboard.ticketCard');

  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketPriority, setTicketPriority] = useState('medium');

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.reportTechnicalIssues')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.requestNewFeatures')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.receivePersonalizedSupport')}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              {t('createTicket')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('modal.title')}</DialogTitle>
              <DialogDescription>
                {t('modal.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket-type">{t('modal.ticketType')}</Label>
                <select
                  id="ticket-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('modal.selectType')}</option>
                  <option value="technical">{t('modal.types.technical')}</option>
                  <option value="billing">{t('modal.types.billing')}</option>
                  <option value="feature">{t('modal.types.feature')}</option>
                  <option value="other">{t('modal.types.other')}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-subject">{t('modal.subject')}</Label>
                <Input id="ticket-subject" placeholder={t('modal.subjectPlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-description">{t('modal.descriptionLabel')}</Label>
                <Textarea
                  id="ticket-description"
                  placeholder={t('modal.descriptionPlaceholder')}
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-priority">{t('modal.priority')}</Label>
                <select
                  id="ticket-priority"
                  value={ticketPriority}
                  onChange={e => setTicketPriority(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="low">{t('modal.priorities.low')}</option>
                  <option value="medium">{t('modal.priorities.medium')}</option>
                  <option value="high">{t('modal.priorities.high')}</option>
                  <option value="urgent">{t('modal.priorities.urgent')}</option>
                </select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => setShowTicketDialog(false)}
              >
                {t('modal.cancel')}
              </Button>
              <Button onClick={() => setShowTicketDialog(false)}>
                {t('modal.send')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
