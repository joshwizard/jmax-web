const CONTACT_FORM_EMAIL =
  import.meta.env.VITE_CONTACT_FORM_EMAIL || "jmaxbuildersltd@gmail.com";

const FORM_SUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_FORM_EMAIL}`;

export type BindingQuotePayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export async function submitBindingQuoteRequest(payload: BindingQuotePayload) {
  const response = await fetch(FORM_SUBMIT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Binding quote / consultation request — Jmax Builders",
      _template: "table",
      _captcha: "false",
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "Not provided",
      message: payload.message,
    }),
  });

  const result = (await response.json()) as { success?: string | boolean; message?: string };
  const ok = result.success === true || result.success === "true";
  if (!response.ok || !ok) {
    throw new Error(result.message || "Could not send your request. Please try again.");
  }

  return result;
}
