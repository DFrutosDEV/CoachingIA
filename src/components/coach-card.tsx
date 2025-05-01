import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface CoachCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  service: string;
  profilePictureUrl?: string; // Opcional
}

export function CoachCard({ 
  firstName,
  lastName, 
  email, 
  phoneNumber, 
  service, 
  profilePictureUrl 
}: CoachCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center text-center gap-2">
      {profilePictureUrl ? (
        <Image 
          src={profilePictureUrl}
          alt={`Foto de ${firstName} ${lastName}`}
          width={80}
          height={80}
          className="rounded-full"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <span>Sin foto</span>
        </div>
      )}
      <h2 className="font-semibold text-lg">{`${firstName} ${lastName}`}</h2>
      <Badge variant="outline">{service}</Badge>
      <p className="text-sm">{email}</p>
      <p className="text-sm">{phoneNumber}</p>
    </div>
  );
}
