import {
  Dialog as Root,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import clsx from "clsx";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  trigger: ReactNode;
  children: ReactNode;
}

export function Dialog({ open, trigger, children }: DialogProps) {
  return (
    <Root open={open}>
      <DialogTitle></DialogTitle>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay
          className="fixed inset-0 bg-Dark_Tier0/10 backdrop-blur-xs z-dialog"
          onClick={(e) => e.preventDefault()}
        />
        <DialogDescription></DialogDescription>
        <DialogContent
          className={clsx(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "overflow-auto transition-default",
            "bg-Dark_Tier0 p-2 rounded-2xl shadow-lg z-dialog_content outline-none",
            "md:p-6"
          )}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {children}
        </DialogContent>
      </DialogPortal>
    </Root>
  );
}
