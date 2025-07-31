"use client"

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@mui/material";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Users, Building2, Calendar, MoreVertical, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoachCardProps {
  id: string;
  userId: string;
  name: string;
  lastName: string;
  email: string;
  age?: number;
  phone: string;
  bio: string;
  profilePicture?: string;
  active: boolean;
  firstLogin: boolean;
  clientsCount: number;
  enterprise?: {
    id: string;
    name: string;
    logo?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  onDeactivate?: (coachId: string) => void;
}

export function CoachCard({ 
  id,
  userId,
  name,
  lastName, 
  email, 
  age,
  phone, 
  bio,
  profilePicture,
  active,
  firstLogin,
  clientsCount,
  enterprise,
  createdAt,
  updatedAt,
  onDeactivate
}: CoachCardProps) {
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      
      const response = await fetch(`/api/admin/coaches/${id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Llamar al callback para actualizar la lista
        if (onDeactivate) {
          onDeactivate(id);
        }
        setIsDeactivateDialogOpen(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Error al dar de baja al coach'}`);
      }
    } catch (error) {
      console.error('Error al dar de baja:', error);
      alert('Error al dar de baja al coach');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleOpenDialog = () => {
    setIsDeactivateDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const handleCloseDialog = () => {
    setIsDeactivateDialogOpen(false);
  };

  // Resetear estado cuando el diálogo se cierra
  useEffect(() => {
    if (!isDeactivateDialogOpen) {
      setIsDeactivating(false);
    }
  }, [isDeactivateDialogOpen]);

  // Resetear dropdown cuando el diálogo se cierra
  useEffect(() => {
    if (!isDeactivateDialogOpen) {
      setIsDropdownOpen(false);
    }
  }, [isDeactivateDialogOpen]);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={profilePicture || `https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&name=${encodeURIComponent(name + ' ' + lastName)}`} 
                alt={`${name} ${lastName}`} 
              />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(name, lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{`${name} ${lastName}`}</h3>
                <Badge variant={active ? "active" : "inactive"}>
                  {active ? "Activo" : "Inactivo"}
                </Badge>
                {firstLogin && (
                  <Badge variant="outline" className="text-xs">
                    Nuevo
                  </Badge>
                )}
              </div>
              {age && <p className="text-sm text-muted-foreground">{age} años</p>}
            </div>
            <DropdownMenu open={isDropdownOpen} onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}>
              <DropdownMenuTrigger asChild>
                <Button variant="text" size="small" className="h-8 w-8 p-0 min-w-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border">
                <DropdownMenuItem onClick={handleOpenDialog} className="hover:bg-accent hover:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Dar de baja
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bio}
            </p>
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
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{clientsCount} cliente{clientsCount !== 1 ? 's' : ''}</span>
            </div>
            
            {enterprise && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{enterprise.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Registrado: {formatDate(createdAt)}</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outlined" size="small" className="flex-1">
              Enviar Mensaje
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeactivateDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Dar de baja al coach?</DialogTitle>
            <DialogDescription>
              Esta acción marcará al coach "{name} {lastName}" como inactivo y no podrá acceder a la plataforma. 
              Esta acción se puede revertir más tarde desde el panel de administración.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outlined" 
              onClick={handleCloseDialog}
              disabled={isDeactivating}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDeactivate}
              disabled={isDeactivating}
            >
              {isDeactivating ? 'Dando de baja...' : 'Dar de baja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
