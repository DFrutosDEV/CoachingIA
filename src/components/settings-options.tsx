'use client';

import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setTheme as setReduxTheme } from '@/lib/redux/slices/sessionSlice';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { setPreferredLocale } from '@/utils/locale-storage';

interface SettingsFormProps {
  userType: 'client' | 'coach' | 'admin' | 'enterprise';
}

export function SettingsForm({ userType }: SettingsFormProps) {
  const t = useTranslations('common.dashboard.settings');
  const pathname = usePathname();
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const reduxTheme = useAppSelector(state => state.session.theme);
  const [selectedTheme, setSelectedTheme] = useState<string>('system');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Priorizar el tema de Redux si existe, sino usar next-themes
    const currentTheme = reduxTheme || theme || 'system';
    setSelectedTheme(currentTheme);

    // Sincronizar next-themes con Redux si hay diferencia
    if (reduxTheme && reduxTheme !== theme) {
      setTheme(reduxTheme);
    }

    // Obtener el idioma actual de la URL
    const currentLocale = pathname.split('/')[1] || 'es';
    setSelectedLanguage(currentLocale);
  }, [theme, reduxTheme, setTheme, pathname]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as 'light' | 'dark' | 'system';
    setSelectedTheme(newTheme);

    // Actualizar ambos: next-themes y Redux
    setTheme(newTheme);
    dispatch(setReduxTheme(newTheme));
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLanguage = event.target.value as 'es' | 'en' | 'it';
    setSelectedLanguage(newLanguage);

    // Guardar la preferencia en localStorage
    setPreferredLocale(newLanguage);

    // Navegar a la nueva URL con el idioma seleccionado
    const newPathname = pathname.replace(`/${pathname.split('/')[1]}`, `/${newLanguage}`);
    router.push(newPathname);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="grid gap-6">
      {/* Tarjeta de Tema */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">{t('theme.title')}</Typography>}
          subheader={
            <Typography variant="body2" color="text.secondary">
              {t('theme.description')}
            </Typography>
          }
        />
        <CardContent>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedTheme}
              name="theme-radio-group"
              onChange={handleThemeChange}
            >
              <FormControlLabel value="light" control={<Radio />} label={t('theme.light')} />
              <FormControlLabel value="dark" control={<Radio />} label={t('theme.dark')} />
              <FormControlLabel
                value="system"
                control={<Radio />}
                label={t('theme.system')}
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Tarjeta de Idioma */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">{t('language.title')}</Typography>}
          subheader={
            <Typography variant="body2" color="text.secondary">
              {t('language.description')}
            </Typography>
          }
        />
        <CardContent>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedLanguage}
              name="language-radio-group"
              onChange={handleLanguageChange}
            >
              <FormControlLabel value="es" control={<Radio />} label={t('language.es')} />
              <FormControlLabel value="en" control={<Radio />} label={t('language.en')} />
              <FormControlLabel value="it" control={<Radio />} label={t('language.it')} />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </div>
  );
}
