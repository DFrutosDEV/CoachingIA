'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { User, Edit, Save, Camera, X, Trash2, Lock, Building2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { updateUser } from '@/lib/redux/slices/authSlice';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

//! TODO: Optimizar el archivo de perfil de usuario.
export default function ProfilePage() {
  const t = useTranslations('text.profile');
  const params = useParams();
  const userType = params.userType as
    | 'client'
    | 'coach'
    | 'admin'
    | 'enterprise';
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    age: user?.profile?.age || '',
    phoneCountryCode: '',
    // phoneArea: '',
    phoneNumber: '',
    bio: user?.profile?.bio || '',
    address: user?.profile?.address || '',
  });

  // Estados para configuración de empresa
  const [enterpriseData, setEnterpriseData] = useState({
    name: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    socialMedia: [] as string[],
  });
  const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(false);
  const [isSavingEnterprise, setIsSavingEnterprise] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [socialMediaInput, setSocialMediaInput] = useState('');

  // Función para parsear el teléfono existente en sus componentes
  const parsePhone = (phone: string) => {
    if (!phone) return { countryCode: '', area: '', number: '' };

    // Remover espacios y caracteres especiales
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Si empieza con + (formato internacional)
    if (cleanPhone.startsWith('+')) {
      // Buscar el código de país (1-3 dígitos)
      let countryCode = '';
      let remainingNumber = '';

      // Códigos de país más comunes
      //TODO: MOVER A UN ARCHIVO DE CONFIGURACIÓN.
      const countryCodes = [
        '1',
        '7',
        '20',
        '27',
        '30',
        '31',
        '32',
        '33',
        '34',
        '36',
        '39',
        '40',
        '41',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',
        '49',
        '51',
        '52',
        '53',
        '54',
        '55',
        '56',
        '57',
        '58',
        '60',
        '61',
        '62',
        '63',
        '64',
        '65',
        '66',
        '81',
        '82',
        '84',
        '86',
        '90',
        '91',
        '92',
        '93',
        '94',
        '95',
        '98',
        '971',
        '972',
        '973',
        '974',
        '975',
        '976',
        '977',
        '994',
        '995',
        '996',
        '998',
        '999',
      ];

      // Intentar encontrar el código de país
      for (const code of countryCodes) {
        if (cleanPhone.startsWith('+' + code)) {
          countryCode = code;
          remainingNumber = cleanPhone.substring(code.length + 1);
          break;
        }
      }

      if (countryCode && remainingNumber.length >= 7) {
        // Para números con 7+ dígitos, dividir en área y número (combinando prefijo)
        if (remainingNumber.length >= 10) {
          return {
            countryCode,
            area: remainingNumber.substring(0, 2),
            number: remainingNumber.substring(2), // Combinar prefijo + número
          };
        } else {
          // Para números más cortos, solo área y número
          return {
            countryCode,
            area: remainingNumber.substring(
              0,
              Math.floor(remainingNumber.length / 2)
            ),
            number: remainingNumber.substring(
              Math.floor(remainingNumber.length / 2)
            ),
          };
        }
      }
    }

    // Si no empieza con + pero tiene 10+ dígitos, asumir que es nacional
    if (cleanPhone.length >= 10) {
      return {
        countryCode: '',
        area: cleanPhone.substring(0, 2),
        number: cleanPhone.substring(2), // Combinar prefijo + número
      };
    }

    // Si no coincide con ningún formato, devolver como está
    return { countryCode: '', area: '', number: cleanPhone };
  };

  useEffect(() => {
    if (user) {
      const phoneParts = parsePhone(user.profile?.phone || '');
      setFormData({
        name: user.profile?.name || '',
        lastName: user.profile?.lastName || '',
        email: user.email || '',
        age: user.profile?.age || '',
        phoneCountryCode: phoneParts.countryCode,
        // phoneArea: phoneParts.area,
        phoneNumber: phoneParts.number,
        bio: user.profile?.bio || '',
        address: user.profile?.address || '',
      });
    }
  }, [user]);

  // Cargar datos de la empresa
  const fetchEnterpriseData = useCallback(async () => {
    if (!user?.enterprise?._id) return;

    try {
      setIsLoadingEnterprise(true);
      const response = await fetch(`/api/enterprise/update?enterpriseId=${user.enterprise._id}`);
      const data = await response.json();

      if (data.success) {
        setEnterpriseData(data.data);
        setLogoPreview(data.data.logo || '');
      } else {
        toast.error(data.error || t('enterpriseSettings.errors.loadingError'));
      }
    } catch (error) {
      console.error('Error fetching enterprise data:', error);
      toast.error(t('enterpriseSettings.errors.connectionError'));
    } finally {
      setIsLoadingEnterprise(false);
    }
  }, [user?.enterprise?._id, t]);

  // Cargar datos de empresa al montar el componente
  useEffect(() => {
    if (user?.enterprise?._id) {
      fetchEnterpriseData();
    }
  }, [user?.enterprise?._id, fetchEnterpriseData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validar que solo se ingresen números en los campos de teléfono
    if (
      name === 'phoneCountryCode' ||
      // name === 'phoneArea' ||
      name === 'phoneNumber'
    ) {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCancel = () => {
    if (user) {
      const phoneParts = parsePhone(user.profile?.phone || '');
      setFormData({
        name: user.profile?.name || '',
        lastName: user.profile?.lastName || '',
        email: user.email || '',
        age: user.profile?.age || '',
        phoneCountryCode: phoneParts.countryCode,
        // phoneArea: phoneParts.area,
        phoneNumber: phoneParts.number,
        bio: user.profile?.bio || '',
        address: user.profile?.address || '',
      });
    }
    setIsEditing(false);
    setSelectedImage(null);
    setPreviewImage('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(t('errors.imageTooLarge'));
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('errors.invalidImageType'));
        return;
      }

      setSelectedImage(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearProfilePicture = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', user._id);
      formDataToSend.append('name', user.profile?.name || '');
      formDataToSend.append('lastName', user.profile?.lastName || '');
      formDataToSend.append('age', user.profile?.age?.toString() || '');
      formDataToSend.append('phone', user.profile?.phone || '');
      formDataToSend.append('bio', user.profile?.bio || '');
      formDataToSend.append('clearProfilePicture', 'true');

      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el estado del usuario
        dispatch(
          updateUser({
            email: user.email,
            profile: {
              ...user.profile,
              profilePicture: '',
            },
          })
        );

        toast.success(t('success.profilePictureDeleted'));
      } else {
        toast.error(result.error || t('errors.profilePictureDeleteError'));
      }
    } catch (error) {
      console.error('Error al eliminar foto de perfil:', error);
      toast.error(t('errors.profilePictureDeleteError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validar que las contraseñas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.passwordsDoNotMatch'));
      return;
    }

    // Validar longitud mínima
    if (passwordData.newPassword.length < 6) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('success.passwordChanged'));
        setShowPasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.error || t('errors.passwordChangeError'));
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(t('errors.passwordChangeError'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Funciones para manejar configuración de empresa
  const handleEnterpriseInputChange = (field: string, value: string) => {
    setEnterpriseData(prev => ({ ...prev, [field]: value }));
  };

  const handleEnterpriseLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setEnterpriseData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocialMedia = () => {
    if (socialMediaInput.trim()) {
      setEnterpriseData(prev => ({
        ...prev,
        socialMedia: [...prev.socialMedia, socialMediaInput.trim()]
      }));
      setSocialMediaInput('');
    }
  };

  const removeSocialMedia = (index: number) => {
    setEnterpriseData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleSaveEnterprise = async () => {
    if (!user?.enterprise?._id) return;

    try {
      setIsSavingEnterprise(true);
      const response = await fetch('/api/enterprise/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enterpriseId: user.enterprise._id,
          name: enterpriseData.name,
          logo: enterpriseData.logo,
          address: enterpriseData.address,
          phone: enterpriseData.phone,
          email: enterpriseData.email,
          website: enterpriseData.website,
          socialMedia: enterpriseData.socialMedia,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('enterpriseSettings.success.enterpriseUpdated'));
        setEnterpriseData(data.data);
      } else {
        toast.error(data.error || t('enterpriseSettings.errors.updateError'));
      }
    } catch (error) {
      console.error('Error saving enterprise data:', error);
      toast.error(t('enterpriseSettings.errors.connectionError'));
    } finally {
      setIsSavingEnterprise(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validar campos obligatorios del teléfono
    const countryCode = formData.phoneCountryCode.replace(/\s/g, '');
    // const area = formData.phoneArea.replace(/\s/g, '');
    const number = formData.phoneNumber.replace(/\s/g, '');

    if (
      !countryCode ||
      !number ||
      !formData.name ||
      !formData.lastName
    ) {
      toast.error(t('errors.allFieldsRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // Concatenar los campos del teléfono en formato E.164
      let fullPhone = '';
      if (countryCode && number) {
        fullPhone = `+${countryCode}${number}`;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('userId', user._id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('age', formData.age.toString());
      formDataToSend.append('phone', fullPhone);
      formDataToSend.append('bio', formData.bio);
      // formDataToSend.append('address', formData.address)

      if (selectedImage) {
        formDataToSend.append('profilePicture', selectedImage);
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el estado del usuario con los nuevos datos del perfil
        dispatch(
          updateUser({
            email: formData.email,
            profile: {
              ...user.profile,
              name: formData.name,
              lastName: formData.lastName,
              age: formData.age ? parseInt(formData.age.toString()) : undefined,
              phone: fullPhone,
              bio: formData.bio,
              // address: formData.address,
              profilePicture:
                result.data.profilePicture || user.profile?.profilePicture,
            },
          })
        );

        toast.success(t('success.profileUpdated'));
        setIsEditing(false);
        setSelectedImage(null);
        setPreviewImage('');
      } else {
        toast.error(result.error || t('errors.profileUpdateError'));
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error(t('errors.profileUpdateError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t('loading')}</p>
      </div>
    );
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType={userType} className="h-full" />
      </div>
      <DashboardSidebar
        userType={userType}
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader
          userType={userType}
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? t('buttons.saving') : t('buttons.save')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      {t('buttons.cancel')}
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {t('buttons.editProfile')}
                    </Button>
                    <Dialog
                      open={showPasswordDialog}
                      onOpenChange={setShowPasswordDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Lock className="h-4 w-4" />
                          {t('buttons.changePassword')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{t('passwordDialog.title')}</DialogTitle>
                          <DialogDescription>
                            {t('passwordDialog.description')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="currentPassword">
                              {t('passwordDialog.currentPassword')}
                            </Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={e =>
                                setPasswordData(prev => ({
                                  ...prev,
                                  currentPassword: e.target.value,
                                }))
                              }
                              placeholder={t('passwordDialog.currentPasswordPlaceholder')}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="newPassword">
                              {t('passwordDialog.newPassword')}
                            </Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={e =>
                                setPasswordData(prev => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              placeholder={t('passwordDialog.newPasswordPlaceholder')}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">
                              {t('passwordDialog.confirmPassword')}
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={e =>
                                setPasswordData(prev => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              placeholder={t('passwordDialog.confirmPasswordPlaceholder')}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordDialog(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                            }}
                            disabled={isChangingPassword}
                          >
                            {t('buttons.cancel')}
                          </Button>
                          <Button
                            onClick={handleChangePassword}
                            disabled={
                              isChangingPassword ||
                              !passwordData.currentPassword ||
                              !passwordData.newPassword ||
                              !passwordData.confirmPassword
                            }
                          >
                            {isChangingPassword
                              ? t('buttons.changing')
                              : t('buttons.changePasswordButton')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {/* Información Personal */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('personalInfo.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('personalInfo.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {t('personalInfo.fields.name')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          {t('personalInfo.fields.lastName')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">{t('personalInfo.fields.age')}</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          min="0"
                          max="120"
                          value={formData.age}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                          placeholder={t('personalInfo.fields.age')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('personalInfo.fields.email')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true}
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {t('personalInfo.fields.phone')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <Input
                            id="phoneCountryCode"
                            name="phoneCountryCode"
                            value={formData.phoneCountryCode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-muted' : ''}
                            placeholder="54"
                            maxLength={3}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('personalInfo.phoneComponents.country')} <span className="text-red-500">*</span>
                          </p>
                        </div>
                        {/* <div className="flex flex-col gap-1">
                          <Input
                            id="phoneArea"
                            name="phoneArea"
                            value={formData.phoneArea}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-muted' : ''}
                            placeholder="11"
                            maxLength={2}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('personalInfo.phoneComponents.area')} <span className="text-red-500">*</span>
                          </p>
                        </div> */}
                        <div className="flex flex-col gap-1">
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-muted' : ''}
                            placeholder="40317700"
                            maxLength={10}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('personalInfo.phoneComponents.number')} <span className="text-red-500">*</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('personalInfo.phoneFormat')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">{t('personalInfo.fields.bio')}</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-muted' : ''}
                        placeholder={t('personalInfo.bioPlaceholder')}
                        rows={4}
                      />
                    </div>

                    {/* <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        placeholder="Agregar dirección"
                      />
                    </div> */}
                  </CardContent>
                </Card>

                {/* Configuración de Empresa - Solo para admins con empresa */}
                {userType === 'enterprise' && user?.enterprise?._id && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {t('enterpriseSettings.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('enterpriseSettings.subtitle')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoadingEnterprise ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-sm text-muted-foreground">{t('enterpriseSettings.loading')}</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="enterpriseName">{t('enterpriseSettings.fields.name')}</Label>
                              <Input
                                id="enterpriseName"
                                value={enterpriseData.name}
                                onChange={(e) => handleEnterpriseInputChange('name', e.target.value)}
                                placeholder={t('enterpriseSettings.placeholders.name')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="enterpriseEmail">{t('enterpriseSettings.fields.email')}</Label>
                              <Input
                                id="enterpriseEmail"
                                type="email"
                                value={enterpriseData.email}
                                onChange={(e) => handleEnterpriseInputChange('email', e.target.value)}
                                placeholder={t('enterpriseSettings.placeholders.email')}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="enterprisePhone">{t('enterpriseSettings.fields.phone')}</Label>
                              <Input
                                id="enterprisePhone"
                                value={enterpriseData.phone}
                                onChange={(e) => handleEnterpriseInputChange('phone', e.target.value)}
                                placeholder={t('enterpriseSettings.placeholders.phone')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="enterpriseWebsite">{t('enterpriseSettings.fields.website')}</Label>
                              <Input
                                id="enterpriseWebsite"
                                value={enterpriseData.website}
                                onChange={(e) => handleEnterpriseInputChange('website', e.target.value)}
                                placeholder={t('enterpriseSettings.placeholders.website')}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="enterpriseAddress">{t('enterpriseSettings.fields.address')}</Label>
                            <Textarea
                              id="enterpriseAddress"
                              value={enterpriseData.address}
                              onChange={(e) => handleEnterpriseInputChange('address', e.target.value)}
                              placeholder={t('enterpriseSettings.placeholders.address')}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="enterpriseLogo">{t('enterpriseSettings.fields.logo')}</Label>
                            <Input
                              id="enterpriseLogo"
                              type="file"
                              accept="image/*"
                              onChange={handleEnterpriseLogoChange}
                              className="cursor-pointer"
                            />

                            {logoPreview && (
                              <div className="mt-2 p-4 border rounded-lg">
                                <Label>{t('enterpriseSettings.logoPreview')}</Label>
                                <div className="mt-2">
                                  <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="max-h-32 max-w-32 object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>{t('enterpriseSettings.fields.socialMedia')}</Label>
                            <div className="flex gap-2">
                              <Input
                                value={socialMediaInput}
                                onChange={(e) => setSocialMediaInput(e.target.value)}
                                placeholder={t('enterpriseSettings.placeholders.socialMedia')}
                                onKeyPress={(e) => e.key === 'Enter' && addSocialMedia()}
                              />
                              <Button onClick={addSocialMedia} type="button">
                                {t('enterpriseSettings.addSocialMedia')}
                              </Button>
                            </div>

                            {enterpriseData.socialMedia.length > 0 && (
                              <div className="space-y-2">
                                <Label>{t('enterpriseSettings.socialMediaAdded')}</Label>
                                <div className="space-y-2">
                                  {enterpriseData.socialMedia.map((social, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                                      <span className="text-sm">{social}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeSocialMedia(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={handleSaveEnterprise}
                              disabled={isSavingEnterprise}
                              className="flex items-center gap-2"
                            >
                              <Save className="h-4 w-4" />
                              {isSavingEnterprise ? t('enterpriseSettings.saving') : t('enterpriseSettings.saveChanges')}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Panel lateral con información adicional */}
              <div className="space-y-6">
                {/* Foto de perfil */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('profilePicture.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Preview de foto de perfil"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : user.profile?.profilePicture ? (
                          <img
                            src={user.profile.profilePicture}
                            alt="Foto de perfil"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2 flex gap-1">
                          <Button
                            size="sm"
                            className="rounded-full w-8 h-8 p-0"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          {selectedImage && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full w-8 h-8 p-0"
                              onClick={() => {
                                setSelectedImage(null);
                                setPreviewImage('');
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {isEditing && (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {t('profilePicture.formats')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('profilePicture.maxSize')}
                        </p>
                        {user.profile?.profilePicture && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearProfilePicture}
                            disabled={isLoading}
                            className="w-full gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('profilePicture.clearPhoto')}
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="text-center">
                      <p className="font-medium">
                        {user.profile?.name || ''}{' '}
                        {user.profile?.lastName || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
