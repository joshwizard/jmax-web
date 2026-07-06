import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy · Jmax Builders" }] }),
  component: () => (
    <>
      <h1 className="font-display text-2xl font-bold">Privacy Policy</h1>
      <p>Placeholder policy. We collect only the information needed to fulfil orders and provide support.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Contact details: name, email, phone (optional).</li>
        <li>Order details: items purchased, license tier, payment confirmation reference.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To deliver your purchase, issue receipts, and respond to support enquiries. We do not sell personal data.</p>
      <h2>Retention</h2>
      <p>Order records are retained for the period required by Kenyan tax law (placeholder).</p>
      <h2>Contact</h2>
      <p>For privacy questions, email jmaxbuildersltd@gmail.com.</p>
    </>
  ),
});
