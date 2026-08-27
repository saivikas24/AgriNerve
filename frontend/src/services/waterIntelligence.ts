export type WaterStatus =
  | "Good"
  | "Moderate"
  | "Low"
  | "Critical"
  | "Unavailable";

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

export interface WaterIntelligenceResult {
  status: WaterStatus;
  availability: string;
  irrigationNeed: string;
  source: string;
  reservoir: Reservoir | null;
}

export const WATER_API_BASE =
  "http://127.0.0.1:8000/api/v1/water";

export function getWaterStatus(
  storage: number | null,
): WaterStatus {
  if (storage === null) {
    return "Unavailable";
  }

  if (storage >= 60) {
    return "Good";
  }

  if (storage >= 40) {
    return "Moderate";
  }

  if (storage >= 20) {
    return "Low";
  }

  return "Critical";
}

export function getIrrigationNeed(
  status: WaterStatus,
): string {
  switch (status) {
    case "Good":
      return "Normal irrigation";

    case "Moderate":
      return "Planned irrigation";

    case "Low":
      return "Conserve water";

    case "Critical":
      return "Urgent water planning";

    default:
      return "Unable to determine";
  }
}

export function buildWaterIntelligence(
  reservoir: Reservoir | null,
): WaterIntelligenceResult {
  if (!reservoir) {
    return {
      status: "Unavailable",
      availability: "Unavailable",
      irrigationNeed: "Unable to determine",
      source: "No water data",
      reservoir: null,
    };
  }

  const status = getWaterStatus(
    reservoir.storage_percentage,
  );

  const availability =
    reservoir.storage_percentage !== null
      ? `${reservoir.storage_percentage}%`
      : "Unavailable";

  return {
    status,
    availability,
    irrigationNeed:
      getIrrigationNeed(status),
    source: reservoir.source,
    reservoir,
  };
}

export async function fetchDistricts(): Promise<
  string[]
> {
  const response = await fetch(
    `${WATER_API_BASE}/districts`,
  );

  if (!response.ok) {
    throw new Error(
      `District API returned ${response.status}`,
    );
  }

  return response.json();
}

export async function fetchMandals(
  district: string,
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set("district", district);

  const response = await fetch(
    `${WATER_API_BASE}/mandals?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Mandal API returned ${response.status}`,
    );
  }

  return response.json();
}

export async function fetchReservoirs(
  district: string,
  mandal: string,
): Promise<Reservoir[]> {
  const params = new URLSearchParams();

  params.set("district", district);
  params.set("mandal", mandal);

  const response = await fetch(
    `${WATER_API_BASE}/reservoirs?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Reservoir API returned ${response.status}`,
    );
  }

  return response.json();
}