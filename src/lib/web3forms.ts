const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Web3Forms access keys are safe to expose client-side (see web3forms.com docs).
// Env var overrides for other environments; fallback keeps production working if Vercel env was added after build.
const WEB3FORMS_ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "afbab1c7-a60d-4132-a7e3-6083959bc287";

export type BindingQuotePayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export async function submitBindingQuoteRequest(payload: BindingQuotePayload) {
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: "Binding quote / consultation request — Jmax Builders",
      from_name: "Jmax Builders Website",
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "Not provided",
      message: payload.message,
      botcheck: false,
    }),
  });

  const result = (await response.json()) as { success?: boolean; message?: string };
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not send your request. Please try again.");
  }

  return result;
}
