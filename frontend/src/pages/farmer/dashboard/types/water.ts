export interface Reservoir {
  id: number;
  source_id: number | null;

  district: string;
  mandal: string;
  reservoir: string;
  river: string | null;

  present_level_m: number | null;
  present_level_ft: number | null;

  present_capacity_mcum: number | null;
  present_capacity_tmc: number | null;

  frl_m: number | null;
  frl_ft: number | null;

  gross_capacity_mcum: number | null;
  gross_capacity_tmc: number | null;

  storage_percentage: number | null;

  updated_at: string | null;
  source: string;
  fetched_at: string;
}

export type WaterStatus =
  | "Good"
  | "Moderate"
  | "Low"
  | "Critical";
