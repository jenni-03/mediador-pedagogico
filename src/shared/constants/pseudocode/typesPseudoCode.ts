export type PlanStep = { lineLabel: string; hold: number }

export type OperationCode = {
  lines: string[];
  labels: Record<string, number>;
  errorPlans?: Record<string, PlanStep[]>;
};
