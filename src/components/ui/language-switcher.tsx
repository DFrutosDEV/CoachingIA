'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setPreferredLocale } from '@/utils/locale-storage';
import { useTranslations } from 'next-intl';

const languages = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'it', flag: '🇮🇹' },
];

export function LanguageSwitcher() {
  const t = useTranslations('common.dashboard.languageSwitcher');
  const pathname = usePathname();
  const router = useRouter();

  // Obtener el locale actual de la ruta
  const currentLocale = pathname.split('/')[1] || 'es';

  const changeLanguage = (newLocale: string) => {
    // Guardar la preferencia en localStorage de manera segura
    setPreferredLocale(newLocale);

    // Reemplazar el locale en la URL
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Languages className="h-4 w-4" />}
          sx={{ minWidth: '120px' }}
        >
          {currentLanguage.flag} {t(`languages.${currentLanguage.code}`)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={currentLocale === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {t(`languages.${language.code}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

