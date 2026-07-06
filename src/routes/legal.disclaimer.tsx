import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/disclaimer")({
  head: () => ({ meta: [{ title: "Plans & BOQ Disclaimer · Jmax Builders" }] }),
  component: () => (
    <>
      <h1 className="font-display text-2xl font-bold">Plans & BOQ Disclaimer</h1>
      <p>Read before purchase. This disclaimer summarises important limits on the use of marketplace plans and BOQs.</p>

      <h2>Plans are not a substitute for stamped drawings</h2>
      <p>Marketplace plan sets are buildable working drawings. They are <strong>not</strong> a substitute for drawings stamped by a registered architect, structural engineer, or MEP professional, where local law requires it for permitting or construction.</p>

      <h2>Buyer responsible for local codes</h2>
      <p>The buyer is solely responsible for verifying that the design complies with local building codes, plot ratios, setbacks, fire and accessibility standards, and any planning conditions in their jurisdiction.</p>

      <h2>BOQ measurements & rates</h2>
      <ul>
        <li>Quantities reflect the drawings as supplied at the date of issue.</li>
        <li>Rates are <strong>indicative</strong> and must be reconfirmed against current market quotations.</li>
        <li>Items shown as <em>provisional sums</em> require further definition before contract.</li>
      </ul>

      <h2>Jurisdictional limits</h2>
      <p>Designs are prepared with Kenyan construction practice in mind. Use outside Kenya may require redesign for local climate, materials and codes (placeholder note — confirm with a local professional).</p>
    </>
  ),
});
