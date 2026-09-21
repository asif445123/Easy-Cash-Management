import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
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
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href="/demo"
          className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink transition-colors"
        >
          <FaArrowLeft size={11} />
          Demo dashboard
        </Link>
        <Link
          href="/register"
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Create real account
        </Link>
      </div>

      <DemoBanner />

      <h1 className="text-xl font-bold text-ink mb-1">{title}</h1>
      {description && <p className="text-sm text-ink/50 mb-5">{description}</p>}
      {!description && <div className="mb-5" />}

      {children}
    </div>
  );
}
