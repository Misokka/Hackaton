import { buildApiUrl } from "../api";

async function parseApiError(response: Response) {
  const data = await response.json().catch(() => null);
  const message = Array.isArray(data?.message)
    ? data.message.join(" ")
    : data?.message ?? "Le service de paiement est momentanément indisponible.";

  return message;
}

async function paymentFetch<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<T>;
}

export function createStripeCheckoutSession(accessToken: string, subscriptionRequestId: string) {
  return paymentFetch<{ sessionId: string; url: string | null }>(accessToken, "/api/payments/stripe/checkout-session", {
    method: "POST",
    body: JSON.stringify({ subscriptionRequestId }),
  });
}

export function confirmStripeCheckoutSession(accessToken: string, sessionId: string) {
  return paymentFetch<{ id: string; status: string; paymentConfirmedAt: string | null; stripeCheckoutSessionId: string | null }>(
    accessToken,
    "/api/payments/stripe/confirm-session",
    {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    },
  );
}

export function cancelStripeCheckoutSession(
  accessToken: string,
  payload: { subscriptionRequestId?: string; sessionId?: string },
) {
  return paymentFetch<{ id: string; status: string }>(accessToken, "/api/payments/stripe/cancel-session", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
