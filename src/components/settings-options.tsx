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

interface SettingsFormProps {
  userType: 'client' | 'coach' | 'admin' | 'enterprise';
}

export function SettingsForm({ userType }: SettingsFormProps) {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const reduxTheme = useAppSelector(state => state.session.theme);
  const [selectedTheme, setSelectedTheme] = useState<string>('system');
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
  }, [theme, reduxTheme, setTheme]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as 'light' | 'dark' | 'system';
    setSelectedTheme(newTheme);

    // Actualizar ambos: next-themes y Redux
    setTheme(newTheme);
    dispatch(setReduxTheme(newTheme));
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h6">Tema</Typography>}
        subheader={
          <Typography variant="body2" color="text.secondary">
            Selecciona el tema visual de la aplicación.
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
            <FormControlLabel value="light" control={<Radio />} label="Claro" />
            <FormControlLabel value="dark" control={<Radio />} label="Oscuro" />
            <FormControlLabel
              value="system"
              control={<Radio />}
              label="Sistema"
            />
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
}
