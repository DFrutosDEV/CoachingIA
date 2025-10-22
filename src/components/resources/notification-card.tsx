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
// Usar input checkbox nativo en lugar de componente personalizado
import { Bell, ArrowRight, X } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { useTranslations } from 'next-intl';

import { toast } from 'sonner';

interface NotificationCardProps {
  userType: 'coach' | 'enterprise' | 'admin';
}

export function NotificationCard({ userType }: NotificationCardProps) {
  const t = useTranslations('common.dashboard.notificationCard');

  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  // Estados para el autocompletado de notificaciones
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<
    { id: string; name: string }[]
  >([]);
  const [showRecipientSuggestions, setShowRecipientSuggestions] =
    useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para los checkboxes de notificaciones masivas
  const [massNotificationChecks, setMassNotificationChecks] = useState({
    allClients: false, // Para coach: notificar a todos sus clientes
    allCoaches: false, // Para admin: notificar a todos los coaches
    allUsers: false, // Para admin: notificar a todos los usuarios
  });

  // Obtener usuario autenticado y datos del estado global
  const user = useAppSelector(state => state.auth.user);

  // Estados para el formulario de notificación
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
  });

  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Función para buscar usuarios en el endpoint
  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowRecipientSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/coach/search?search=${encodeURIComponent(query)}&coachId=${user?.profile?._id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Filtrar usuarios que ya están seleccionados
          const filteredUsers = (result.users || []).filter(
            (user: any) =>
              !selectedRecipients.some(recipient => recipient.id === user._id)
          );
          setSearchResults(filteredUsers);
          setShowRecipientSuggestions(true);
        } else {
          setSearchResults([]);
          setShowRecipientSuggestions(false);
        }
      }
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      setSearchResults([]);
      setShowRecipientSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  const debounceSearch = (() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => searchUsers(query), 300);
    };
  })();

  const handleRecipientInputChange = (value: string) => {
    setRecipientSearch(value);

    if (value.length >= 3) {
      debounceSearch(value);
    } else {
      setShowRecipientSuggestions(false);
      setSearchResults([]);
    }
  };

  const handleRecipientSelect = (user: any) => {
    const newRecipient = {
      id: user._id,
      name: `${user.name} ${user.lastName}`,
    };
    setSelectedRecipients(prev => [...prev, newRecipient]);
    setRecipientSearch('');
    setShowRecipientSuggestions(false);
    setSearchResults([]);
  };

  const handleRemoveRecipient = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.filter(recipient => recipient.id !== recipientId)
    );
  };

  const handleMassNotificationChange = (
    checkType: keyof typeof massNotificationChecks,
    checked: boolean
  ) => {
    setMassNotificationChecks(prev => ({
      ...prev,
      [checkType]: checked,
    }));

    // Si se activa un checkbox masivo, limpiar selecciones individuales
    if (checked) {
      setSelectedRecipients([]);
      setRecipientSearch('');
      setShowRecipientSuggestions(false);
      setSearchResults([]);
    }
  };

  const handleNotificationFormChange = (field: string, value: string) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendNotification = async () => {
    // Verificar que haya destinatarios seleccionados o checkboxes activos
    const hasIndividualRecipients = selectedRecipients.length > 0;
    const hasMassNotification = Object.values(massNotificationChecks).some(
      check => check
    );

    if (!hasIndividualRecipients && !hasMassNotification) {
      toast.error(t('errors.selectRecipients'));
      return;
    }

    if (!notificationForm.title || !notificationForm.message) {
      toast.error(t('errors.completeFields'));
      return;
    }

    if (!user?._id) {
      toast.error(t('errors.userNotIdentified'));
      return;
    }

    setIsSendingNotification(true);

    try {
      const requestBody: any = {
        title: notificationForm.title,
        description: notificationForm.message,
        profileId: user.profile?._id,
      };

      // Agregar destinatarios individuales si existen
      if (hasIndividualRecipients) {
        requestBody.recipients = selectedRecipients.map(r => r.id);
      }

      // Agregar configuración de notificaciones masivas
      if (hasMassNotification) {
        requestBody.massNotification = massNotificationChecks;
      }

      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setShowNotificationDialog(false);
        // Resetear formulario
        setNotificationForm({ title: '', message: '' });
        setRecipientSearch('');
        setSelectedRecipients([]);
        setShowRecipientSuggestions(false);
        setSearchResults([]);
        setMassNotificationChecks({
          allClients: false,
          allCoaches: false,
          allUsers: false,
        });
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error enviando notificación:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsSendingNotification(false);
    }
  };

  const resetForm = () => {
    setNotificationForm({ title: '', message: '' });
    setRecipientSearch('');
    setSelectedRecipients([]);
    setShowRecipientSuggestions(false);
    setSearchResults([]);
    setMassNotificationChecks({
      allClients: false,
      allCoaches: false,
      allUsers: false,
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
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
            <span>{t('features.sessionReminders')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.scheduleChanges')}</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{t('features.shareResources')}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog
          open={showNotificationDialog}
          onOpenChange={setShowNotificationDialog}
        >
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              {t('createNotification')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('modal.title')}</DialogTitle>
              <DialogDescription>
                {t('modal.description', {
                  userType: userType === 'coach' ? 'tus clientes' : 'usuarios del sistema'
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Checkboxes para notificaciones masivas */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('modal.massNotifications')}
                </Label>

                {/* Checkbox para coach: notificar a todos sus clientes */}
                {userType === 'coach' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allClients"
                      checked={massNotificationChecks.allClients}
                      onChange={e =>
                        handleMassNotificationChange(
                          'allClients',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-2 border-border"
                    />
                    <Label htmlFor="allClients" className="text-sm">
                      {t('modal.notifyAllClients')}
                    </Label>
                  </div>
                )}

                {/* Checkboxes para admin */}
                {userType === 'admin' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allCoaches"
                        checked={massNotificationChecks.allCoaches}
                        onChange={e =>
                          handleMassNotificationChange(
                            'allCoaches',
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-2 border-border"
                      />
                      <Label htmlFor="allCoaches" className="text-sm">
                        {t('modal.notifyAllCoaches')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allUsers"
                        checked={massNotificationChecks.allUsers}
                        onChange={e =>
                          handleMassNotificationChange(
                            'allUsers',
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-2 border-border"
                      />
                      <Label htmlFor="allUsers" className="text-sm">
                        {t('modal.notifyAllUsers')}
                      </Label>
                    </div>
                  </>
                )}
              </div>

              {/* Separador */}
              {!Object.values(massNotificationChecks).some(check => check) && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t('modal.orSelectIndividually')}
                      </span>
                    </div>
                  </div>

                  {/* Selección individual de destinatarios */}
                  <div className="grid gap-2 relative">
                    <Label htmlFor="recipient">{t('modal.recipients')}</Label>
                    <Input
                      id="recipient"
                      placeholder={t('modal.searchPlaceholder')}
                      value={recipientSearch}
                      onChange={e => handleRecipientInputChange(e.target.value)}
                      onFocus={() =>
                        recipientSearch.length >= 3 &&
                        setShowRecipientSuggestions(true)
                      }
                    />
                    {isSearching && (
                      <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 p-3">
                        <div className="text-sm text-muted-foreground">
                          {t('modal.searching')}
                        </div>
                      </div>
                    )}
                    {showRecipientSuggestions &&
                      searchResults.length > 0 &&
                      !isSearching && (
                        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                          {searchResults.map(searchUser => (
                            <div
                              key={searchUser._id}
                              className="px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 transition-colors"
                              onClick={() => handleRecipientSelect(searchUser)}
                            >
                              <div className="font-medium text-foreground">
                                {searchUser.name} {searchUser.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {searchUser.email}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    {recipientSearch.length >= 3 &&
                      searchResults.length === 0 &&
                      showRecipientSuggestions &&
                      !isSearching && (
                        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 p-3">
                          <div className="text-sm text-muted-foreground">
                            {t('modal.noUsersFound')}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Lista de destinatarios seleccionados */}
                  {selectedRecipients.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t('modal.selectedRecipients')}
                      </Label>
                      <div className="space-y-1">
                        {selectedRecipients.map(recipient => (
                          <div
                            key={recipient.id}
                            className="flex items-center justify-between p-2 bg-accent rounded-md"
                          >
                            <span className="text-sm">{recipient.name}</span>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() =>
                                handleRemoveRecipient(recipient.id)
                              }
                              className="h-6 w-6 p-0 min-w-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="title">{t('modal.titleLabel')}</Label>
                <Input
                  id="title"
                  placeholder={t('modal.titlePlaceholder')}
                  value={notificationForm.title}
                  onChange={e =>
                    handleNotificationFormChange('title', e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">{t('modal.messageLabel')}</Label>
                <Textarea
                  id="message"
                  placeholder={t('modal.messagePlaceholder')}
                  value={notificationForm.message}
                  onChange={e =>
                    handleNotificationFormChange('message', e.target.value)
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowNotificationDialog(false);
                  resetForm();
                }}
                disabled={isSendingNotification}
              >
                {t('modal.cancel')}
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={isSendingNotification}
              >
                {isSendingNotification ? t('modal.sending') : t('modal.send')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
