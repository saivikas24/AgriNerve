const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  village?: string;
  district?: string;
  state: string;
  consent: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface OTPResponse {
  message: string;
  development_otp?: string;
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

export async function registerFarmer(
  data: RegisterData,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function sendEmailOTP(): Promise<OTPResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/send-email-otp`,
    {
      method: "POST",
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

export async function verifyEmailOTP(
  otp: string,
): Promise<{ message: string; email_verified: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-email-otp`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        otp,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function sendMobileOTP(): Promise<OTPResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/send-mobile-otp`,
    {
      method: "POST",
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

export async function verifyMobileOTP(
  otp: string,
): Promise<{ message: string; mobile_verified: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-mobile-otp`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        otp,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}
