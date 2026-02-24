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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card as UICard, CardContent as UICardContent } from '@/components/ui/card';
import { UserPlus, ArrowRight, Search, Building2, Loader2, X } from 'lucide-react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/lib/redux/hooks';

interface EnterpriseOption {
  _id: string;
  name: string;
}

export function AddUserCard() {
  const t = useTranslations('common.dashboard.addUserCard');
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [profile, setProfile] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    enterpriseName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const userCode = user?.role?.code;

  // Asignar coach a empresa (solo Admin, perfil Coach)
  const [enterpriseSearchQuery, setEnterpriseSearchQuery] = useState('');
  const [enterpriseSearchResults, setEnterpriseSearchResults] = useState<EnterpriseOption[]>([]);
  const [isSearchingEnterprise, setIsSearchingEnterprise] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseOption | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Búsqueda de empresas (debounce) para asignar coach a empresa
  useEffect(() => {
    if (enterpriseSearchQuery.trim().length < 2) {
      setEnterpriseSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearchingEnterprise(true);
      try {
        const res = await fetch(
          `/api/admin/enterprises?search=${encodeURIComponent(enterpriseSearchQuery.trim())}`
        );
        const result = await res.json();
        setEnterpriseSearchResults(result.success ? result.data || [] : []);
      } catch {
        setEnterpriseSearchResults([]);
      } finally {
        setIsSearchingEnterprise(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [enterpriseSearchQuery]);

  useEffect(() => {
    if (profile !== '2') setSelectedEnterprise(null);
  }, [profile]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.lastName || !formData.email || !profile) {
      toast.error(t('errors.completeFields'));
      return;
    }

    if (profile === '4' && !formData.enterpriseName.trim()) {
      toast.error(t('errors.enterpriseNameRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // Se formatea el nombre y apellido para que empiecen por mayúscula
      const formattedName = formData.name.charAt(0).toUpperCase() + formData.name.slice(1).toLowerCase();
      const formattedLastName = formData.lastName.charAt(0).toUpperCase() + formData.lastName.slice(1).toLowerCase();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formattedName,
          lastName: formattedLastName,
          email: formData.email,
          profile: profile,
          enterpriseId:
            profile === '2'
              ? selectedEnterprise?._id ?? undefined
              : profile === '4'
                ? undefined
                : undefined,
          ...(profile === '4' && {
            enterpriseName: formData.enterpriseName.trim(),
          }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('success.userCreated'));
        setFormData({ name: '', lastName: '', email: '', enterpriseName: '' });
        setSelectedEnterprise(null);
        setEnterpriseSearchQuery('');
        setEnterpriseSearchResults([]);
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
                    <SelectValue placeholder={t('modal.fields.profilePlaceholder')}></SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="bg-background-hover" value="2">
                      {t('modal.profiles.coach')}
                    </SelectItem>
                    <SelectItem className="bg-background-hover" value="3">
                      {t('modal.profiles.client')}
                    </SelectItem>
                    {userCode === '1' &&
                      <>
                        <SelectItem className="bg-background-hover" value="1">
                          {t('modal.profiles.admin')}
                        </SelectItem>
                        <SelectItem className="bg-background-hover" value="4">
                          {t('modal.profiles.enterprise')}
                        </SelectItem>
                      </>}
                  </SelectContent>
                </Select>
              </div>
              {profile === '4' && (
                <div className="grid gap-2">
                  <Label htmlFor="enterprise-name">
                    {t('modal.fields.enterpriseName')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="enterprise-name"
                    placeholder={t('modal.fields.enterpriseNamePlaceholder')}
                    value={formData.enterpriseName}
                    onChange={e =>
                      handleInputChange('enterpriseName', e.target.value)
                    }
                  />
                </div>
              )}
              {profile === '2' && userCode === '1' && (
                <div className="grid gap-2">
                  <Label>{t('modal.fields.assignToEnterprise')}</Label>
                  {selectedEnterprise ? (
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {selectedEnterprise.name}
                      </span>
                      <Button
                        type="button"
                        variant="text"
                        size="small"
                        onClick={() => {
                          setSelectedEnterprise(null);
                          setEnterpriseSearchQuery('');
                          setEnterpriseSearchResults([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('modal.fields.enterpriseSearchPlaceholder')}
                          value={enterpriseSearchQuery}
                          onChange={e => setEnterpriseSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {isSearchingEnterprise && (
                        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('modal.fields.searching')}
                        </div>
                      )}
                      {!isSearchingEnterprise && enterpriseSearchResults.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                          {enterpriseSearchResults.map((ent: EnterpriseOption) => (
                            <UICard
                              key={ent._id}
                              className="cursor-pointer hover:bg-accent transition-colors"
                              onClick={() => {
                                setSelectedEnterprise(ent);
                                setEnterpriseSearchQuery('');
                                setEnterpriseSearchResults([]);
                              }}
                            >
                              <UICardContent className="p-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {ent.name}
                              </UICardContent>
                            </UICard>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
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
