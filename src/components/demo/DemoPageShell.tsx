import DemoBanner from "./DemoBanner";

export default function DemoPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-16">
      <DemoBanner />

      <h1 className="text-xl font-bold text-ink mb-1">{title}</h1>
      {description && <p className="text-sm text-ink/50 mb-5">{description}</p>}
      {!description && <div className="mb-5" />}

      {children}
    </div>
  );
}
