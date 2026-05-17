import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  status,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; status?: string }) {
  const Comp = asChild ? Slot : "span";
  const normalizedStatus = (status || "").toLowerCase();
  const statusClassName = normalizedStatus
    ? cn(
        normalizedStatus === "approved" && "bg-green-100 text-green-800 border-green-200",
        normalizedStatus === "pending" && "bg-yellow-100 text-yellow-800 border-yellow-200",
        normalizedStatus === "rejected" && "bg-red-100 text-red-800 border-red-200",
        normalizedStatus === "partial" && "bg-orange-100 text-orange-800 border-orange-200",
        normalizedStatus === "cancelled" && "bg-gray-100 text-gray-800 border-gray-200",
        normalizedStatus === "available" && "bg-green-100 text-green-800 border-green-200",
        normalizedStatus === "booked" && "bg-blue-100 text-blue-800 border-blue-200",
        normalizedStatus === "unavailable" && "bg-gray-100 text-gray-800 border-gray-200",
      )
    : "";

  const statusLabel = normalizedStatus
    ? ({
        approved: "Approuvée",
        pending: "En attente",
        rejected: "Refusée",
        partial: "Partielle",
        cancelled: "Annulée",
        available: "Disponible",
        booked: "Réservée",
        unavailable: "Indisponible",
      }[normalizedStatus] || status)
    : null;

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), statusClassName, className)}
      {...props}
    >
      {children || statusLabel}
    </Comp>
  );
}

export { Badge, badgeVariants };
