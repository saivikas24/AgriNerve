import type { WaterStatus } from "../types/water";

export function getWaterStatus(
  storage: number | null,
): WaterStatus {
  if (storage === null) {
    return "Critical";
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
  storage: number | null,
): string {
  if (storage === null) {
    return "Unknown";
  }

  if (storage >= 60) {
    return "Low";
  }

  if (storage >= 40) {
    return "Moderate";
  }

  if (storage >= 20) {
    return "High";
  }

  return "Very high";
}
