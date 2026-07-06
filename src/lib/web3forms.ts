const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function getAccessKey() {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    throw new Error("Web3Forms is not configured. Set VITE_WEB3FORMS_ACCESS_KEY.");
  }
  return key;
}

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
      access_key: getAccessKey(),
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
