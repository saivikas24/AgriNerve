const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface CropCreate {
  crop_name: string;
  variety?: string;
  area_acres: number;
  sowing_date?: string;
  expected_harvest_date?: string;
  season?: string;
  status?: string;
}

export interface CropResponse {
  id: number;
  farm_id: number;
  crop_name: string;
  variety: string | null;
  area_acres: number;
  sowing_date: string | null;
  expected_harvest_date: string | null;
  season: string | null;
  status: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(
    "agrinerve_access_token",
  );

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

export async function getCrops(
  farmId: number,
): Promise<CropResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/farms/${farmId}/crops`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function createCrop(
  farmId: number,
  data: CropCreate,
): Promise<CropResponse> {
  const response = await fetch(
    `${API_BASE_URL}/farms/${farmId}/crops`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function updateCrop(
  farmId: number,
  cropId: number,
  data: Partial<CropCreate>,
): Promise<CropResponse> {
  const response = await fetch(
    `${API_BASE_URL}/farms/${farmId}/crops/${cropId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function deleteCrop(
  farmId: number,
  cropId: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/farms/${farmId}/crops/${cropId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}
