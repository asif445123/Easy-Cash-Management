"use client";

export default function DemoTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === active ? "bg-primary text-white" : "border border-ink/15 text-ink/70 hover:bg-ink/5"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
