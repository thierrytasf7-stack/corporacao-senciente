import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardTitleProps } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

interface SummaryCardProps {
  title: string;
  value: number | string;
  description: string;
  variant?: CardTitleProps['variant'];
  color?: 'default' | 'destructive' | 'success';
  isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  description,
  variant = 'h3',
  color = 'default',
  isLoading = false,
}) => {
  const [hovered, setHovered] = useState(false);

  const formattedValue = typeof value === 'number'
    ? new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value)
    : value;

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`hover:shadow-lg transition-shadow duration-200 ${hovered ? 'shadow-md' : 'shadow-sm'}`}
    >
      <CardHeader className="flex items-center justify-between">
        <CardTitle as={variant} className="text-sm font-medium">
          {title}
        </CardTitle>
        {isLoading && (
          <div className="animate-pulse">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-baseline">
          <CardTitle as={variant} className="text-2xl font-bold">
            {formattedValue}
          </CardTitle>
          {color === 'success' && value > 0 && (
            <Badge className="ml-2 bg-green-500 text-green-900">
              +
              {new Intl.NumberFormat('en-US', {
                style: 'percent',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              }).format(value)}
            </Badge>
          )}
          {color === 'destructive' && value < 0 && (
            <Badge className="ml-2 bg-red-500 text-red-900">
              -
              {new Intl.NumberFormat('en-US', {
                style: 'percent',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              }).format(Math.abs(value))}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};