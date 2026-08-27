const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface FarmCreateData {
  farm_name: string;
  village?: string;
  district?: string;
  state: string;
  area_acres: number;
  soil_type?: string;
  irrigation_type?: string;
}

export interface FarmResponse {
  id: number;
  farmer_id: number;
  farm_name: string;
  village: string | null;
  district: string | null;
  state: string;
  area_acres: number;
  soil_type: string | null;
  irrigation_type: string | null;
  created_at: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("agrinerve_access_token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const result = await response.json();

    if (Array.isArray(result?.detail)) {
      return result.detail
        .map(
          (item: { msg?: string }) =>
            item.msg || "Validation error",
        )
        .join(", ");
    }

    return result?.detail || "Request failed.";
  } catch {
    return "Request failed. Please try again.";
  }
}

export async function getFarms(): Promise<FarmResponse[]> {
  const response = await fetch(`${API_BASE_URL}/farms`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function createFarm(
  data: FarmCreateData,
): Promise<FarmResponse> {
  const response = await fetch(`${API_BASE_URL}/farms`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function updateFarm(
  farmId: number,
  data: Partial<FarmCreateData>,
): Promise<FarmResponse> {
  const response = await fetch(
    `${API_BASE_URL}/farms/${farmId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}
