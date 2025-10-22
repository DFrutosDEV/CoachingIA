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
import { UserPlus, ArrowRight } from 'lucide-react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function AddUserCard() {
  const t = useTranslations('common.dashboard.addUserCard');
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [profile, setProfile] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.lastName || !formData.email || !profile) {
      toast.error(t('errors.completeFields'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          profile: profile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('success.userCreated'));
        setFormData({ name: '', lastName: '', email: '' });
        setShowCoachDialog(false);
      } else {
        toast.error(data.error || t('errors.createUser'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errors.createUser'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
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
            <span>{t('features.createProfiles')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.startScheduling')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.scheduleWithClients')}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              {t('addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('modal.title')}</DialogTitle>
              <DialogDescription>
                {t('modal.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">
                    {t('modal.fields.name')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first-name"
                    placeholder={t('modal.fields.name')}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">
                    {t('modal.fields.lastName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last-name"
                    placeholder={t('modal.fields.lastName')}
                    value={formData.lastName}
                    onChange={e =>
                      handleInputChange('lastName', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  {t('modal.fields.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('modal.fields.emailPlaceholder')}
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                />
              </div>
              {/* <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+34 600 000 000" />
              </div> */}
              <div>
                <Label htmlFor="profile">
                  {t('modal.fields.profile')} <span className="text-red-500">*</span>
                </Label>
                <Select value={profile || ''} onValueChange={setProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('modal.fields.profilePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="bg-background-hover" value="1">
                      {t('modal.profiles.admin')}
                    </SelectItem>
                    <SelectItem className="bg-background-hover" value="2">
                      {t('modal.profiles.coach')}
                    </SelectItem>
                    <SelectItem className="bg-background-hover" value="3">
                      {t('modal.profiles.client')}
                    </SelectItem>
                    <SelectItem className="bg-background-hover" value="4">
                      {t('modal.profiles.enterprise')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => setShowCoachDialog(false)}
                disabled={isLoading}
              >
                {t('modal.buttons.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? t('modal.buttons.creating') : t('modal.buttons.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
