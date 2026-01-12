'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button as MuiButton } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, Phone, Building2, Calendar, Coins, MoreVertical, Trash2, Unlink } from 'lucide-react';
import { sendMessage } from '@/utils/wpp-methods';
import { sendEmail } from '@/utils/sendEmail';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { toast } from 'sonner';
import { getStoredToken } from '@/lib/token-utils';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface CoachCardProps {
  id: string;
  name: string;
  lastName: string;
  email: string;
  points: number;
  age?: number;
  phone: string;
  bio: string;
  profilePicture?: string;
  active: boolean;
  enterprise?: {
    id: string;
    name: string;
    logo?: string;
  } | null;
  createdAt: string;
  onCoachUpdated?: () => void;
}

export function CoachCard({
  id,
  name,
  lastName,
  email,
  points,
  age,
  phone,
  bio,
  profilePicture,
  active,
  enterprise,
  createdAt,
  onCoachUpdated,
}: CoachCardProps) {
  const t = useTranslations('common.dashboard.coachCard');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    //! TODO: Implementar una solucion mas general llevando esta logica a un hook/archivo de utilidades.
    const localeMap = {
      'es': 'es-ES',
      'en': 'en-US',
      'it': 'it-IT'
    };

    return new Date(dateString).toLocaleDateString(localeMap[locale as keyof typeof localeMap] || 'es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSendMessage = () => {
    if (phone) {
      sendMessage({ phone });
    } else {
      sendEmail({ email });
    }
  };

  // Verificar si el usuario es admin y puede realizar acciones
  const canPerformActions = () => {
    if (!user || user.role?.name.toLowerCase() !== 'admin') {
      return false;
    }

    const adminEnterpriseId = user.enterprise?._id?.toString() || null;
    const coachEnterpriseId = enterprise?.id || null;

    // Admin sin empresa o admin con misma empresa
    return !adminEnterpriseId || adminEnterpriseId === coachEnterpriseId;
  };

  const handleDeleteCoach = async () => {
    try {
      setIsDeleting(true);
      const token = getStoredToken();

      if (!token) {
        toast.error(t('error.noToken'));
        return;
      }

      const response = await fetch(`/api/admin/coaches/${id}/delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error.deleteFailed'));
      }

      toast.success(t('success.deleted'));
      setDeleteModalOpen(false);
      onCoachUpdated?.();
    } catch (error) {
      console.error('Error deleting coach:', error);
      toast.error(error instanceof Error ? error.message : t('error.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnlinkEnterprise = async () => {
    try {
      setIsUnlinking(true);
      const token = getStoredToken();

      if (!token) {
        toast.error(t('error.noToken'));
        return;
      }

      const response = await fetch(`/api/admin/coaches/${id}/unlink-enterprise`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error.unlinkFailed'));
      }

      toast.success(t('success.unlinked'));
      setUnlinkModalOpen(false);
      onCoachUpdated?.();
    } catch (error) {
      console.error('Error unlinking coach:', error);
      toast.error(error instanceof Error ? error.message : t('error.unlinkFailed'));
    } finally {
      setIsUnlinking(false);
    }
  };

  const canPerform = canPerformActions();

  return (
    <div key={id}>
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  profilePicture ||
                  `https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&name=${encodeURIComponent(name + ' ' + lastName)}`
                }
                alt={`${name} ${lastName}`}
              />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(name, lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{`${name} ${lastName}`}</h3>
                <Badge variant={active ? 'active' : 'inactive'}>
                  {active ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>
              {age && (
                <p className="text-sm text-muted-foreground">{t('age', { age })}</p>
              )}
            </div>
            {canPerform && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="text"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">{t('openMenu')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="bg-background-hover"
                    onClick={() => setUnlinkModalOpen(true)}
                    disabled={!enterprise}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    {t('unlinkEnterprise')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="bg-background-hover"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('deleteCoach')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex flex-col justify-between">
          {bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          )}

          <div className="flex flex-col space-y-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{email}</span>
              </div>

              {phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{phone}</span>
                </div>
              )}

              {enterprise && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{enterprise.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{t('registered', { date: formatDate(createdAt) })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                <span>{t('points', { points: points ?? 'Sin puntos' })}</span>
              </div>
            </div>
            <div className="flex gap-2 ">
              <MuiButton
                variant="outlined"
                size="small"
                className="flex-1"
                onClick={handleSendMessage}
              >
                {t('sendMessage')}
              </MuiButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCoach}
        title={t('confirmDeleteTitle')}
        description={t('confirmDelete', { name: `${name} ${lastName}` })}
        confirmText={t('confirmDeleteButton')}
        cancelText={t('cancel')}
        isLoading={isDeleting}
        variant="destructive"
      />

      <ConfirmModal
        isOpen={unlinkModalOpen}
        onClose={() => setUnlinkModalOpen(false)}
        onConfirm={handleUnlinkEnterprise}
        title={t('confirmUnlinkTitle')}
        description={t('confirmUnlink', { name: `${name} ${lastName}`, enterprise: enterprise?.name || '' })}
        confirmText={t('confirmUnlinkButton')}
        cancelText={t('cancel')}
        isLoading={isUnlinking}
        variant="default"
      />
    </div>
  );
}
