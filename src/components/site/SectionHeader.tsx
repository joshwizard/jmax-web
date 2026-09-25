export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      )}
      <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
        {title}
      </h2>
      {description && <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>}
    </div>
  );
}
