import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Form, FormControl, FormField, Input, Label, Select, Button, Checkbox, Badge, Alert, AlertDescription } from "@/components/ui";
import { strategyStore } from "@/stores/strategyStore";

const StrategySchema = z.object({
  name: z.string().min(1, "Strategy name is required").max(100, "Strategy name must be 100 characters or less"),
  type: z.string().min(1, "Strategy type is required"),
  parameters: z.string().min(1, "Parameters are required"),
  active: z.boolean(),
});

type StrategyFormData = z.infer<typeof StrategySchema>;

export function StrategyConfig() {
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<StrategyFormData>({
    resolver: zodResolver(StrategySchema),
    defaultValues: {
      name: "",
      type: "",
      parameters: "{}",
      active: true,
    },
  });

  const onSubmit = async (data: StrategyFormData) => {
    setIsSaving(true);
    setTestResult(null);
    setTestError(null);

    try {
      const parsedParams = JSON.parse(data.parameters);
      await strategyStore.saveStrategy({
        ...data,
        parameters: parsedParams,
      });
      
      setTestResult({
        success: true,
        message: `Strategy "${data.name}" saved successfully!`,
      });
    } catch (error) {
      setTestError("Failed to save strategy: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestStrategy = async (data: StrategyFormData) => {
    setTestResult(null);
    setTestError(null);

    try {
      const parsedParams = JSON.parse(data.parameters);
      const testResult = await strategyStore.testStrategy({
        ...data,
        parameters: parsedParams,
      });
      
      setTestResult({
        success: true,
        message: `Strategy test passed: ${testResult.message}`,
      });
    } catch (error) {
      setTestError("Strategy test failed: " + (error as Error).message);
    }
  };

  const handleCancel = () => {
    reset();
    setTestResult(null);
    setTestError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto w-full">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Strategy Configuration</CardTitle>
            <CardDescription>
              Configure betting strategies with custom parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {testResult && (
              <Alert className={`bg-${testResult.success ? "green" : "red"}-400`}>
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
            {testError && (
              <Alert className="bg-red-400">
                <AlertDescription>{testError}</AlertDescription>
              </Alert>
            )}
            <Form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormField>
                <FormControl>
                  <Label htmlFor="name">Strategy Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter strategy name"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </FormControl>
              </FormField>

              <FormField>
                <FormControl>
                  <Label htmlFor="type">Strategy Type</Label>
                  <Select
                    id="type"
                    placeholder="Select strategy type"
                    {...register("type")}
                    className={errors.type ? "border-red-500" : ""}
                  >
                    <option value="martingale">Martingale</option>
                    <option value="fibonacci">Fibonacci</option>
                    <option value="d'alembert">D'Alembert</option>
                    <option value="custom">Custom</option>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                  )}
                </FormControl>
              </FormField>

              <FormField>
                <FormControl>
                  <Label htmlFor="parameters">Parameters (JSON)</Label>
                  <Input
                    id="parameters"
                    placeholder='{"baseBet": 10, "maxBets": 10}'
                    {...register("parameters")}
                    className={errors.parameters ? "border-red-500" : ""}
                  />
                  {errors.parameters && (
                    <p className="text-sm text-red-600 mt-1">{errors.parameters.message}</p>
                  )}
                </FormControl>
              </FormField>

              <FormField>
                <FormControl>
                  <Label htmlFor="active">Active</Label>
                  <Checkbox
                    id="active"
                    {...register("active")}
                  />
                </FormControl>
              </FormField>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={!isValid || isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Saving..." : "Save Strategy"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit(handleTestStrategy)({
                    name: "Test Strategy",
                    type: "custom",
                    parameters: "{}",
                    active: true,
                  } as StrategyFormData)}
                  className="flex-1"
                >
                  Test Strategy
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}