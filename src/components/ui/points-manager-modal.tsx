'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/lib/redux/hooks';
import { getStoredToken } from '@/lib/token-utils';

interface Coach {
  id: string;
  name: string;
  lastName: string;
  email: string;
  points: number;
}

interface EnterpriseOption {
  _id: string;
  name: string;
  points?: number;
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
  const user = useAppSelector(state => state.auth.user);
  const roleCode = user?.role?.code ?? '';
  const isAdmin = roleCode === '1';
  const isEnterprise = roleCode === '4';
  const enterpriseId = user?.enterprise?._id ?? null;

  // Admin: coach flow
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coach[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Admin: enterprise flow
  const [mode, setMode] = useState<'coach' | 'enterprise'>('coach');
  const [enterpriseSearchQuery, setEnterpriseSearchQuery] = useState('');
  const [enterpriseSearchResults, setEnterpriseSearchResults] = useState<EnterpriseOption[]>([]);
  const [isSearchingEnterprise, setIsSearchingEnterprise] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseOption | null>(null);
  const [enterprisePointsValue, setEnterprisePointsValue] = useState<number>(0);

  // Enterprise user: their points and coach list
  const [enterprisePoints, setEnterprisePoints] = useState<number>(0);
  const [enterpriseCoachSearch, setEnterpriseCoachSearch] = useState('');
  const [enterpriseCoachResults, setEnterpriseCoachResults] = useState<Coach[]>([]);
  const [isSearchingEnterpriseCoach, setIsSearchingEnterpriseCoach] = useState(false);
  const [selectedEnterpriseCoach, setSelectedEnterpriseCoach] = useState<Coach | null>(null);
  const [pointsToAssign, setPointsToAssign] = useState<number>(0);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCoach(null);
    setNewPoints(0);
    setEnterpriseSearchQuery('');
    setEnterpriseSearchResults([]);
    setSelectedEnterprise(null);
    setEnterprisePointsValue(0);
    setEnterpriseCoachSearch('');
    setEnterpriseCoachResults([]);
    setSelectedEnterpriseCoach(null);
    setPointsToAssign(0);
    onClose();
  };

  // Fetch enterprise points when modal opens as enterprise user
  useEffect(() => {
    if (!isOpen || !isEnterprise || !enterpriseId) return;
    const fetchPoints = async () => {
      try {
        const res = await fetch(
          `/api/enterprise/getBasicData?enterpriseId=${enterpriseId}`
        );
        const result = await res.json();
        if (result.success && result.data?.enterprisePoints !== undefined) {
          setEnterprisePoints(result.data.enterprisePoints);
        }
      } catch {
        setEnterprisePoints(0);
      }
    };
    fetchPoints();
  }, [isOpen, isEnterprise, enterpriseId]);

  // Admin: search coaches
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
      const result = await response.json();
      setSearchResults(result.success ? result.data || [] : []);
    } catch {
      setSearchResults([]);
      toast.error(t('errors.searchCoaches'));
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 3) searchCoaches(searchQuery);
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Admin: search enterprises
  const searchEnterprises = async (query: string) => {
    if (query.length < 2) {
      setEnterpriseSearchResults([]);
      return;
    }
    setIsSearchingEnterprise(true);
    try {
      const response = await fetch(
        `/api/admin/enterprises?search=${encodeURIComponent(query)}`
      );
      const result = await response.json();
      setEnterpriseSearchResults(result.success ? result.data || [] : []);
    } catch {
      setEnterpriseSearchResults([]);
      toast.error(t('errors.searchEnterprises'));
    } finally {
      setIsSearchingEnterprise(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (enterpriseSearchQuery.length >= 2) searchEnterprises(enterpriseSearchQuery);
      else setEnterpriseSearchResults([]);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [enterpriseSearchQuery]);

  // Enterprise: search own coaches
  const searchEnterpriseCoaches = async (query: string) => {
    if (!enterpriseId) return;
    setIsSearchingEnterpriseCoach(true);
    try {
      const url = query.length >= 2
        ? `/api/enterprise/coaches?enterpriseId=${enterpriseId}&search=${encodeURIComponent(query)}`
        : `/api/enterprise/coaches?enterpriseId=${enterpriseId}`;
      const response = await fetch(url);
      const result = await response.json();
      setEnterpriseCoachResults(result.success ? result.data || [] : []);
    } catch {
      setEnterpriseCoachResults([]);
      toast.error(t('errors.searchCoaches'));
    } finally {
      setIsSearchingEnterpriseCoach(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !isEnterprise || !enterpriseId) return;
    const timeoutId = setTimeout(() => {
      searchEnterpriseCoaches(enterpriseCoachSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [enterpriseCoachSearch, isOpen, isEnterprise, enterpriseId]);

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
    setNewPoints(coach.points);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleEnterpriseSelect = (ent: EnterpriseOption) => {
    setSelectedEnterprise(ent);
    setEnterprisePointsValue(ent.points ?? 0);
    setEnterpriseSearchQuery('');
    setEnterpriseSearchResults([]);
  };

  const handleEnterpriseCoachSelect = (coach: Coach) => {
    setSelectedEnterpriseCoach(coach);
    setPointsToAssign(0);
    setEnterpriseCoachResults([]);
    setEnterpriseCoachSearch('');
  };

  const adjustPoints = (amount: number) => {
    setNewPoints(prev => Math.max(0, prev + amount));
  };

  const adjustEnterprisePoints = (amount: number) => {
    setEnterprisePointsValue(prev => Math.max(0, prev + amount));
  };

  const adjustPointsToAssign = (amount: number) => {
    setPointsToAssign(prev => Math.max(0, prev + amount));
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // Admin: update coach points
  const handleUpdateCoachPoints = async () => {
    if (!selectedCoach) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/coaches/${selectedCoach.id}/points`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ points: newPoints }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(t('success.pointsUpdated'));
        handleClose();
      } else {
        toast.error(result.error || t('errors.updatePoints'));
      }
    } catch {
      toast.error(t('errors.updatePoints'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Admin: update enterprise points
  const handleUpdateEnterprisePoints = async () => {
    if (!selectedEnterprise) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/enterprises/${selectedEnterprise._id}/points`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ points: enterprisePointsValue }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(t('success.pointsUpdated'));
        handleClose();
      } else {
        toast.error(result.error || t('errors.updatePoints'));
      }
    } catch {
      toast.error(t('errors.updatePoints'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Enterprise: transfer points to coach
  const handleTransferToCoach = async () => {
    if (!selectedEnterpriseCoach) return;
    if (pointsToAssign <= 0) {
      toast.error(t('enterprise.pointsToAssign'));
      return;
    }
    if (pointsToAssign > enterprisePoints) {
      toast.error(t('errors.insufficientPoints'));
      return;
    }
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/enterprise/coaches/${selectedEnterpriseCoach.id}/points`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ points: pointsToAssign }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(t('success.pointsUpdated'));
        setEnterprisePoints(prev => prev - pointsToAssign);
        setSelectedEnterpriseCoach(prev =>
          prev
            ? { ...prev, points: prev.points + pointsToAssign }
            : null
        );
        setPointsToAssign(0);
      } else {
        toast.error(result.error || t('errors.updatePoints'));
      }
    } catch {
      toast.error(t('errors.updatePoints'));
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAdminCoachFlow = () => (
    <>
      {!selectedCoach ? (
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
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t('search.searching')}</span>
            </div>
          )}
          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>{t('search.results')}</Label>
              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto gap-2">
                {searchResults.map(coach => (
                  <Card
                    key={coach.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleCoachSelect(coach)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
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
                        <Badge variant="outline" className="flex items-center gap-1">
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
          {!isSearching && searchQuery.length >= 3 && searchResults.length === 0 && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t('search.noResults')}
            </div>
          )}
        </div>
      ) : (
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
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {selectedCoach.points} {t('coach.currentPoints')}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>{t('coach.newPoints')}</Label>
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
                    type="number"
                    min={0}
                    value={newPoints}
                    onChange={e =>
                      setNewPoints(Math.max(0, parseInt(e.target.value) || 0))
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
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );

  const renderAdminEnterpriseFlow = () => (
    <>
      {!selectedEnterprise ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('enterprise.searchLabel')}</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('enterprise.searchPlaceholder')}
                value={enterpriseSearchQuery}
                onChange={e => setEnterpriseSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {isSearchingEnterprise && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t('search.searching')}</span>
            </div>
          )}
          {!isSearchingEnterprise && enterpriseSearchResults.length > 0 && (
            <div className="space-y-2">
              <Label>{t('search.results')}</Label>
              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto gap-2">
                {enterpriseSearchResults.map((ent: EnterpriseOption) => (
                  <Card
                    key={ent._id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleEnterpriseSelect(ent)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium">{ent.name}</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {ent.points ?? 0} {t('enterprise.currentPoints')}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {!isSearchingEnterprise &&
            enterpriseSearchQuery.length >= 2 &&
            enterpriseSearchResults.length === 0 && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                {t('search.noResults')}
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEnterprise.name}</h3>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {selectedEnterprise.points ?? 0} {t('enterprise.currentPoints')}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>{t('coach.newPoints')}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustEnterprisePoints(-1)}
                    disabled={enterprisePointsValue <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={enterprisePointsValue}
                    onChange={e =>
                      setEnterprisePointsValue(
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustEnterprisePoints(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );

  const renderEnterpriseFlow = () => (
    <>
      <div className="rounded-lg bg-muted/50 p-3 mb-4">
        <p className="text-sm font-medium">
          {t('enterprise.yourPoints')}: <span className="font-bold">{enterprisePoints}</span>
        </p>
      </div>
      {!selectedEnterpriseCoach ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('search.label')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={enterpriseCoachSearch}
                onChange={e => setEnterpriseCoachSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {isSearchingEnterpriseCoach && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t('search.searching')}</span>
            </div>
          )}
          {!isSearchingEnterpriseCoach && enterpriseCoachResults.length > 0 && (
            <div className="space-y-2">
              <Label>{t('search.results')}</Label>
              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto gap-2">
                {enterpriseCoachResults.map(coach => (
                  <Card
                    key={coach.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleEnterpriseCoachSelect(coach)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
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
                        <Badge variant="outline" className="flex items-center gap-1">
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
          {!isSearchingEnterpriseCoach &&
            enterpriseCoachResults.length === 0 &&
            (enterpriseCoachSearch.length >= 2 || enterpriseCoachSearch.length === 0) && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                {t('search.noResults')}
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedEnterpriseCoach?.name} {selectedEnterpriseCoach?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEnterpriseCoach?.email}
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {selectedEnterpriseCoach?.points ?? 0} {t('coach.currentPoints')}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>{t('enterprise.pointsToAssign')}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustPointsToAssign(-1)}
                    disabled={pointsToAssign <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    max={enterprisePoints}
                    value={pointsToAssign}
                    onChange={e =>
                      setPointsToAssign(
                        Math.max(0, Math.min(enterprisePoints, parseInt(e.target.value) || 0))
                      )
                    }
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustPointsToAssign(1)}
                    disabled={pointsToAssign >= enterprisePoints}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Máx. {enterprisePoints} {t('coach.points')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );

  const showAdminCoachConfirm =
    isAdmin && mode === 'coach' && selectedCoach && newPoints !== selectedCoach.points;
  const showAdminEnterpriseConfirm =
    isAdmin && mode === 'enterprise' && selectedEnterprise;
  const showEnterpriseConfirm =
    isEnterprise && selectedEnterpriseCoach && pointsToAssign > 0;

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
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

        {isAdmin && (
          <div className="flex gap-2 border-b pb-4">
            <Button
              variant={mode === 'coach' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('coach')}
            >
              {t('mode.coach')}
            </Button>
            <Button
              variant={mode === 'enterprise' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('enterprise')}
            >
              {t('mode.enterprise')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {isAdmin && mode === 'coach' && renderAdminCoachFlow()}
          {isAdmin && mode === 'enterprise' && renderAdminEnterpriseFlow()}
          {isEnterprise && renderEnterpriseFlow()}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            {t('buttons.cancel')}
          </Button>
          {showAdminCoachConfirm && (
            <Button
              onClick={handleUpdateCoachPoints}
              disabled={isUpdating}
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
          {showAdminEnterpriseConfirm && (
            <Button
              onClick={handleUpdateEnterprisePoints}
              disabled={isUpdating}
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
          {showEnterpriseConfirm && (
            <Button
              onClick={handleTransferToCoach}
              disabled={isUpdating || pointsToAssign > enterprisePoints}
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
