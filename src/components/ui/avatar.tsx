import * as React from "react"
import { cn } from "@/utils/cn"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt = "", ...props }, ref) => {
  // Imagen por defecto cuando no hay src o es una cadena vacía
  const defaultImage = "https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&name=User";
  const imageSrc = src && typeof src === 'string' && src.trim() !== "" ? src : defaultImage;
  
  return (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={imageSrc}
      alt={alt}
      {...props}
    />
  );
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback } 