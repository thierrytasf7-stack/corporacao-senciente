import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | false | undefined | null | any[])[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}