import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms of Sale · Jmax Builders" }] }),
  component: () => (
    <>
      <h1 className="font-display text-2xl font-bold">Terms of Sale — Digital Goods</h1>
      <p>Last updated: placeholder. These terms govern the sale of digital products (architectural plan sets and Bills of Quantities) on the Jmax Builders marketplace.</p>

      <h2>1. Nature of the goods</h2>
      <p>All marketplace items are digital files delivered by download link. No physical goods are shipped.</p>

      <h2>2. Licensing</h2>
      <ul>
        <li><strong>Single-use license:</strong> each plan is licensed for one project on one site. Reuse on additional sites or projects requires a new license.</li>
        <li>Resale, sub-licensing, or redistribution of source files is prohibited under both tiers.</li>
      </ul>

      <h2>3. Buyer responsibility</h2>
      <p>The buyer is responsible for compliance with local building codes, planning approvals, and engagement of registered professionals where required.</p>

      <h2>4. Pricing & taxes</h2>
      <p>Prices are quoted in Kenyan Shillings (KES). Applicable VAT is shown at checkout (placeholder).</p>

      <h2>5. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, our liability is limited to the price paid for the affected item.</p>
    </>
  ),
});
