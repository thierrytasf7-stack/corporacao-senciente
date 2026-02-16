import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStrategyStore } from '@/stores/strategyStore';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

interface StrategyFormData {
  name: string;
  riskLevel: number;
  maxPositions: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

export function StrategyConfig() {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<StrategyFormData>();
  const { strategy, setStrategy } = useStrategyStore();

  const onSubmit = async (data: StrategyFormData) => {
    setIsSaving(true);
    try {
      setStrategy(data);
      reset();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <Text className="text-2xl font-semibold mb-6" variant="title">
        Strategy Configuration
      </Text>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Stack spacing="2" className="space-y-2">
          <Label htmlFor="name" className="block">
            Strategy Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter strategy name"
            {...register('name', { 
              required: 'Strategy name is required',
              minLength: { value: 3, message: 'Name must be at least 3 characters' },
              maxLength: { value: 50, message: 'Name must be at most 50 characters' }
            })}
          />
          {errors.name && <Text className="text-sm text-red-500" variant="label">{errors.name.message}</Text>}
        </Stack>

        <Stack spacing="2" className="space-y-2">
          <Label htmlFor="riskLevel" className="block">
            Risk Level (1-10)
          </Label>
          <Slider
            id="riskLevel"
            min={1}
            max={10}
            defaultValue={5}
            {...register('riskLevel', { 
              required: 'Risk level is required',
              min: { value: 1, message: 'Risk level must be between 1 and 10' },
              max: { value: 10, message: 'Risk level must be between 1 and 10' }
            })}
          />
          {errors.riskLevel && <Text className="text-sm text-red-500" variant="label">{errors.riskLevel.message}</Text>}
        </Stack>

        <Stack spacing="2" className="space-y-2">
          <Label htmlFor="maxPositions" className="block">
            Max Positions
          </Label>
          <Select
            id="maxPositions"
            placeholder="Select max positions"
            {...register('maxPositions', { 
              required: 'Max positions is required',
              valueAsNumber: true
            })}
          >
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </Select>
          {errors.maxPositions && <Text className="text-sm text-red-500" variant="label">{errors.maxPositions.message}</Text>}
        </Stack>

        <Stack spacing="2" className="space-y-2">
          <Label htmlFor="stopLossPercent" className="block">
            Stop Loss %
          </Label>
          <Input
            id="stopLossPercent"
            type="number"
            placeholder="Enter stop loss %"
            step="0.1"
            min="0"
            max="100"
            {...register('stopLossPercent', { 
              required: 'Stop loss % is required',
              min: { value: 0, message: 'Must be between 0 and 100' },
              max: { value: 100, message: 'Must be between 0 and 100' }
            })}
          />
          {errors.stopLossPercent && <Text className="text-sm text-red-500" variant="label">{errors.stopLossPercent.message}</Text>}
        </Stack>

        <Stack spacing="2" className="space-y-2">
          <Label htmlFor="takeProfitPercent" className="block">
            Take Profit %
          </Label>
          <Input
            id="takeProfitPercent"
            type="number"
            placeholder="Enter take profit %"
            step="0.1"
            min="0"
            max="100"
            {...register('takeProfitPercent', { 
              required: 'Take profit % is required',
              min: { value: 0, message: 'Must be between 0 and 100' },
              max: { value: 100, message: 'Must be between 0 and 100' }
            })}
          />
          {errors.takeProfitPercent && <Text className="text-sm text-red-500" variant="label">{errors.takeProfitPercent.message}</Text>}
        </Stack>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" disabled={isSaving} className="w-32">
            {isSaving ? 'Saving...' : 'Save Strategy'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export type { StrategyFormData };