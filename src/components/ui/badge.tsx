import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        active:
          'border-transparent bg-badge-active text-primary-foreground hover:bg-badge-active/80',
        inactive:
          'border-transparent bg-badge-inactive text-primary-foreground hover:bg-badge-inactive/80',
        pending:
          'border-transparent bg-badge-pending text-primary-foreground hover:bg-badge-pending/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'active',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
