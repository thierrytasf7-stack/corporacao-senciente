import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-hidden outline-none',
          className
        )}
        {...props}
      />
    );
  }
);
Modal.displayName = 'Modal';

export interface ModalOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ModalOverlay = React.forwardRef<HTMLDivElement, ModalOverlayProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
ModalOverlay.displayName = 'ModalOverlay';

export interface ModalContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full max-w-md mx-auto rounded-lg border bg-white p-6 shadow-xl dark:bg-gray-700 dark:border-gray-600',
          className
        )}
        {...props}
      />
    );
  }
);
ModalContent.displayName = 'ModalContent';

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex justify-between items-start mb-4',
          className
        )}
        {...props}
      />
    );
  }
);
ModalHeader.displayName = 'ModalHeader';

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          'text-lg font-semibold text-gray-900 dark:text-white',
          className
        )}
        {...props}
      />
    );
  }
);
ModalTitle.displayName = 'ModalTitle';

export interface ModalCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);
ModalClose.displayName = 'ModalClose';

export interface ModalBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mb-4',
          className
        )}
        {...props}
      />
    );
  }
);
ModalBody.displayName = 'ModalBody';

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col sm:flex-row sm:justify-end gap-2',
          className
        )}
        {...props}
      />
    );
  }
);
ModalFooter.displayName = 'ModalFooter';

export default Modal;