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
import { Target, ArrowRight, User, Mail, Phone, Calendar } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { isValidEmail } from '@/utils/validatesInputs';

interface NewObjectiveCardProps {
  userType: 'coach' | 'admin' | 'enterprise';
}

interface ExistingClient {
  _id: string;
  clientId: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
}

export function NewObjectiveCard({ userType }: NewObjectiveCardProps) {
  const t = useTranslations('common.dashboard.newObjectiveCard');

  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showExistingUserDialog, setShowExistingUserDialog] = useState(false);
  const [existingClient, setExistingClient] = useState<ExistingClient | null>(
    null
  );
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Estados para el formulario de cliente
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    focus: '',
    startDate: '',
    startTime: '',
    coachId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldsEnabled, setFieldsEnabled] = useState(false);

  // Obtener usuario autenticado y datos del estado global
  const user = useAppSelector(state => state.auth.user);

  const handleClientFormChange = (field: string, value: string) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para verificar si existe un usuario por email
  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 3) return;

    // Si el email no es valido, mostrar un toast de error
    if (!isValidEmail(email)) {
      toast.error(t('errors.validEmail'));
      return;
    }

    setIsCheckingEmail(true);
    // Agregar timeout de 1.5 segundos
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const response = await fetch(
        `/api/users/check-email?email=${encodeURIComponent(email)}`
      );
      const result = await response.json();

      if (result.success && result.exists) {
        setExistingClient(result.user);
        setShowExistingUserDialog(true);
        // No habilitar campos si existe el usuario
        setFieldsEnabled(false);
      } else if (!result.success && result.exists) {
        // Email existe pero no es cliente
        toast.error(result.message);
        setExistingClient(null);
        setFieldsEnabled(false);
      } else {
        // Email no existe, habilitar campos para crear nuevo cliente
        setFieldsEnabled(true);
        setExistingClient(null);
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      toast.error(t('errors.checkEmail'));
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Función para verificar si el cliente tiene un objetivo activo
  const checkActiveObjective = async (clientId: string) => {
    try {
      const response = await fetch(
        `/api/objective/check-active?clientId=${clientId}`
      );
      const result = await response.json();

      if (result.success && result.hasActiveObjective) {
        toast.error(t('errors.activeObjective'));
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error verificando objetivo activo:', error);
      toast.error(t('errors.checkActiveObjective'));
      return false;
    }
  };

  // Función para manejar cambios en el campo email
  const handleEmailChange = (value: string) => {
    handleClientFormChange('email', value);

    // Si el email está vacío, deshabilitar campos
    if (!value) {
      setFieldsEnabled(false);
      setExistingClient(null);
      return;
    }

    // Verificar email después de un delay para evitar muchas requests
    const timeoutId = setTimeout(() => {
      checkEmailExists(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Función para confirmar usuario existente
  const handleConfirmExistingUser = () => {
    if (existingClient) {
      setClientForm(prev => ({
        ...prev,
        firstName: existingClient.name,
        lastName: existingClient.lastName,
        email: existingClient.email,
        phone: existingClient.phone || '',
        focus: '',
        startDate: '',
        startTime: '',
        coachId: '',
      }));
      // Los campos quedan deshabilitados para solo lectura
      setFieldsEnabled(false);
      setShowExistingUserDialog(false);
      toast.success(t('success.clientDataLoaded'));
    }
  };

  // Función para rechazar usuario existente
  const handleRejectExistingUser = () => {
    setShowExistingUserDialog(false);
    setExistingClient(null);
    setFieldsEnabled(false);
    // Limpiar solo el email para que pueda ingresar uno nuevo
    handleClientFormChange('email', '');
    toast.info(t('success.differentEmail'));
  };

  const handleCreateClient = async () => {
    if (
      !clientForm.firstName ||
      !clientForm.lastName ||
      !clientForm.email ||
      !clientForm.focus ||
      !clientForm.startDate ||
      !clientForm.startTime
    ) {
      toast.error(t('errors.completeFields'));
      return;
    }

    //! UNA VEZ QUE SE HAGA EL MIDDLEWARE DE AUTH, SE DEBE REMOVER ESTA VALIDACIÓN
    if (!user?._id) {
      toast.error(t('errors.userNotIdentified'));
      return;
    }

    // Si es un usuario existente, verificar que no tenga un objetivo activo
    if (existingClient?.clientId) {
      const canCreateObjective = await checkActiveObjective(
        existingClient.clientId
      );
      if (!canCreateObjective) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Si es admin o enterprise y se especificó un coach, usar ese
      let coachIdToUse = user?.profile?._id;
      if (
        (userType === 'admin' || userType === 'enterprise') &&
        clientForm.coachId
      ) {
        coachIdToUse = clientForm.coachId;
      }

      const response = await fetch('/api/objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone, // Enviar zona horaria en header
        },
        body: JSON.stringify({
          firstName: clientForm.firstName,
          lastName: clientForm.lastName,
          email: clientForm.email,
          phone: clientForm.phone,
          focus: clientForm.focus,
          startDate: clientForm.startDate,
          startTime: clientForm.startTime,
          coachId: coachIdToUse,
          clientId: existingClient?.clientId, // Si existe un usuario, se usa su ID
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('success.clientCreated'));
        setShowClientDialog(false);
        // Resetear formulario
        setClientForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          focus: '',
          startDate: '',
          startTime: '',
          coachId: '',
        });
        setFieldsEnabled(false);
        setExistingClient(null);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Target className="h-6 w-6 text-primary" />
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
            <span>{t('features.createObjective')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.setInitialGoals')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.scheduleFirstSessions')}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              {t('addObjective')}
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
              <div className="grid gap-2">
                <Label htmlFor="email">{t('modal.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('modal.emailPlaceholder')}
                    value={clientForm.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isCheckingEmail && (
                  <small className="text-sm text-muted-foreground">
                    {t('modal.checkingEmail')}
                  </small>
                )}
                {existingClient && (
                  <small className="text-sm text-green-600 font-medium">
                    {t('modal.existingClient')}
                  </small>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">{t('modal.firstName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="first-name"
                      placeholder={t('modal.firstName')}
                      value={clientForm.firstName}
                      onChange={e =>
                        handleClientFormChange('firstName', e.target.value)
                      }
                      disabled={!fieldsEnabled}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">{t('modal.lastName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="last-name"
                      placeholder={t('modal.lastName')}
                      value={clientForm.lastName}
                      onChange={e =>
                        handleClientFormChange('lastName', e.target.value)
                      }
                      disabled={!fieldsEnabled}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="+34 600 000 000"
                    value={clientForm.phone}
                    onChange={(e) => handleClientFormChange('phone', e.target.value)}
                    disabled={!fieldsEnabled}
                    className="pl-10"
                  />
                </div>
              </div> */}

              <div className="grid gap-2">
                <Label htmlFor="focus">{t('modal.focus')}</Label>
                <Input
                  id="focus"
                  placeholder={t('modal.focusPlaceholder')}
                  value={clientForm.focus}
                  onChange={e =>
                    handleClientFormChange('focus', e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">{t('modal.startDate')}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start-date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={clientForm.startDate}
                      onChange={e =>
                        handleClientFormChange('startDate', e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-time">{t('modal.startTime')}</Label>
                  <Input
                    id="start-time"
                    type="time"
                    min="08:00"
                    max="18:00"
                    value={clientForm.startTime}
                    onChange={e =>
                      handleClientFormChange('startTime', e.target.value)
                    }
                  />
                </div>
              </div>

              {userType === 'admin' && (
                <div className="grid gap-2">
                  <Label htmlFor="coach">{t('modal.assignedCoach')}</Label>
                  <Input
                    id="coach"
                    placeholder={t('modal.coachPlaceholder')}
                    value={clientForm.coachId}
                    onChange={e =>
                      handleClientFormChange('coachId', e.target.value)
                    }
                  />
                  <small className="text-sm text-muted-foreground">
                    {t('modal.coachHelper')}
                  </small>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowClientDialog(false);
                  setFieldsEnabled(false);
                  setExistingClient(null);
                  setClientForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    focus: '',
                    startDate: '',
                    startTime: '',
                    coachId: '',
                  });
                }}
                disabled={isSubmitting}
              >
                {t('modal.cancel')}
              </Button>
              <Button
                onClick={handleCreateClient}
                disabled={isSubmitting || (!fieldsEnabled && !existingClient)}
              >
                {isSubmitting ? t('modal.creating') : t('modal.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación para usuario existente */}
        <Dialog
          open={showExistingUserDialog}
          onOpenChange={setShowExistingUserDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('existingUserModal.title')}</DialogTitle>
              <DialogDescription>
                {t('existingUserModal.description', { email: existingClient?.email || '' })}
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span>
                  <strong>
                    {existingClient?.name} {existingClient?.lastName}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" />
                <span>{existingClient?.email}</span>
              </div>
              {existingClient?.phone && (
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>{existingClient.phone}</span>
                </div>
              )}
              {existingClient?.age && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{existingClient.age} {t('existingUserModal.years')}</span>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outlined" onClick={handleRejectExistingUser}>
                {t('existingUserModal.noOtherUser')}
              </Button>
              <Button onClick={handleConfirmExistingUser}>
                {t('existingUserModal.yesThisUser')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
