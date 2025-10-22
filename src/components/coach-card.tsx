'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@mui/material';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Building2, Calendar } from 'lucide-react';
import { sendMessage } from '@/utils/wpp-methods';
import { sendEmail } from '@/utils/sendEmail';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface CoachCardProps {
  id: string;
  name: string;
  lastName: string;
  email: string;
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
}

export function CoachCard({
  id,
  name,
  lastName,
  email,
  age,
  phone,
  bio,
  profilePicture,
  active,
  enterprise,
  createdAt,
}: CoachCardProps) {
  const t = useTranslations('common.dashboard.coachCard');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

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
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex flex-col justify-between">
          {bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          )}

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
          </div>
          <div className="flex gap-2 ">
            <Button
              variant="outlined"
              size="small"
              className="flex-1"
              onClick={handleSendMessage}
            >
              {t('sendMessage')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
