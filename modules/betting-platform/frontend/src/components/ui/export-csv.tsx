import React from 'react';
import { Button } from '@/components/ui/button';

export const ExportCSVButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <Button variant="outline" className="bg-white hover:bg-gray-50" {...props}>
      {children}
    </Button>
  );
};