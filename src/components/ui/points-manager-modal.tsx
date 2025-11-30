'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  User,
  Mail,
  Coins,
  Plus,
  Minus,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Coach {
  id: string;
  name: string;
  lastName: string;
  email: string;
  points: number;
}

interface PointsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PointsManagerModal({
  isOpen,
  onClose,
}: PointsManagerModalProps) {
  const t = useTranslations('common.dashboard.pointsManager.modal');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coach[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para buscar coaches
  const searchCoaches = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/admin/coaches?search=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSearchResults(result.data || []);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error al buscar coaches:', error);
      setSearchResults([]);
      toast.error(t('errors.searchCoaches'));
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchCoaches(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Función para seleccionar un coach
  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
    setNewPoints(coach.points);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Función para actualizar puntos
  const handleUpdatePoints = async () => {
    if (!selectedCoach) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/coaches/${selectedCoach.id}/points`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ points: newPoints }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(t('success.pointsUpdated'));
          // Actualizar el coach seleccionado con los nuevos puntos
          setSelectedCoach(prev =>
            prev ? { ...prev, points: newPoints } : null
          );
          // Cerrar el modal
          handleClose();
        } else {
          toast.error(result.error || t('errors.updatePoints'));
        }
      } else {
        const error = await response.json();
        toast.error(error.error || t('errors.updatePoints'));
      }
    } catch (error) {
      console.error('Error al actualizar puntos:', error);
      toast.error(t('errors.updatePoints'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para cerrar el modal
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCoach(null);
    setNewPoints(0);
    onClose();
  };

  // Función para ajustar puntos
  const adjustPoints = (amount: number) => {
    const newValue = Math.max(0, newPoints + amount);
    setNewPoints(newValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Búsqueda de coaches */}
          {!selectedCoach && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">{t('search.label')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Resultados de búsqueda */}
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">{t('search.searching')}</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('search.results')}</Label>
                  <div className=" flex flex-col space-y-2 max-h-48 overflow-y-auto gap-2">
                    {searchResults.map(coach => (
                      <Card
                        key={coach.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleCoachSelect(coach)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3 flex-col">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {coach.name} {coach.lastName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {coach.email}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Coins className="h-3 w-3" />
                              {coach.points} {t('coach.points')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!isSearching &&
                searchQuery.length >= 3 &&
                searchResults.length === 0 && (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {t('search.noResults')}
                  </div>
                )}
            </div>
          )}

          {/* Gestión de puntos del coach seleccionado */}
          {selectedCoach && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedCoach.name} {selectedCoach.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCoach.email}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Coins className="h-3 w-3" />
                      {selectedCoach.points} {t('coach.currentPoints')}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPoints">{t('coach.newPoints')}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustPoints(-1)}
                          disabled={newPoints <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="newPoints"
                          type="number"
                          min="0"
                          value={newPoints}
                          onChange={e =>
                            setNewPoints(
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustPoints(1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Diferencia de puntos */}
                    {newPoints !== selectedCoach.points && (
                      <div
                        className={`p-3 rounded-lg ${newPoints > selectedCoach.points
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {newPoints > selectedCoach.points ? (
                            <Plus className="h-4 w-4 text-green-600" />
                          ) : (
                            <Minus className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${newPoints > selectedCoach.points
                              ? 'text-green-700'
                              : 'text-red-700'
                              }`}
                          >
                            {newPoints > selectedCoach.points ? '+' : ''}
                            {newPoints - selectedCoach.points} {t('coach.points')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            {t('buttons.cancel')}
          </Button>
          {selectedCoach && (
            <Button
              onClick={handleUpdatePoints}
              disabled={isUpdating || newPoints === selectedCoach.points}
              className="flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('buttons.updating')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {t('buttons.confirm')}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
