const API_BASE_URL = 'https://foode.site/api';

export interface CustomerBroadcastPayload {
  title: string;
  message: string;
}

export interface CustomerBroadcastResult {
  success: boolean;
  message?: string;
  saved?: number;
  sent?: number;
  failed?: number;
}

/**
 * Expected backend endpoint:
 * POST /notifications/broadcast
 * Body: { title, message, audience: "customers" }
 *
 * The backend must independently enforce admin authorization. Hiding this
 * screen in the app is not an authorization control.
 */
export const sendCustomerBroadcast = async (
  token: string,
  payload: CustomerBroadcastPayload,
): Promise<CustomerBroadcastResult> => {
  if (!token) throw new Error('Authentication token is missing.');

  const response = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: payload.title.trim(),
      message: payload.message.trim(),
      audience: 'customers',
    }),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // A non-JSON backend error is handled below.
  }

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  if (response.status === 403) {
    throw new Error('Only an authorized FoodE admin can send broadcasts.');
  }
  if (response.status === 404) {
    throw new Error('Broadcast endpoint is not deployed yet. Add POST /api/notifications/broadcast to the backend first.');
  }
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Broadcast failed (${response.status}).`);
  }

  return data as CustomerBroadcastResult;
};

export default {sendCustomerBroadcast};
