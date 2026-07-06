import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/refunds")({
  head: () => ({ meta: [{ title: "Refund Policy · Jmax Builders" }] }),
  component: () => (
    <>
      <h1 className="font-display text-2xl font-bold">Refund Policy — Digital Products</h1>
      <p>Because plans and BOQs are digital intellectual property, our refund policy is conservative but fair. Placeholder text — please review with counsel before launch.</p>

      <h2>Eligible for refund</h2>
      <ul>
        <li>The wrong file was delivered and we cannot supply the correct one within 5 business days.</li>
        <li>The file is corrupt or unreadable and we cannot resolve it on request.</li>
        <li>A demonstrable, material error in the drawings or BOQ (e.g. an entire trade missing) that we cannot correct within 10 business days.</li>
      </ul>

      <h2>Not eligible for refund</h2>
      <ul>
        <li>The file has been downloaded and the buyer changes their mind.</li>
        <li>The buyer's local authority requires a different design or stamped drawings.</li>
        <li>Indicative BOQ rates differ from current market prices.</li>
      </ul>

      <h2>How to request</h2>
      <p>Email jmaxbuildersltd@gmail.com with your order ID and a clear description of the issue within 14 days of purchase.</p>
    </>
  ),
});
