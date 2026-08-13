import { Boxes } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";

interface PagePlaceholderProps {
  /** Page name, used in the placeholder copy. */
  name: string;
}

/** Temporary body for routes whose content is not built yet. */
export const PagePlaceholder = ({ name }: PagePlaceholderProps) => (
  <>
    <Navbar />
    <section className="mt-6 grid place-items-center rounded-xl border border-line bg-surface px-6 py-20 shadow-card">
      <Boxes className="h-10 w-10 text-navy-300" strokeWidth={1.5} />
      <h2 className="mt-4 text-lg font-semibold text-heading">{name}</h2>
      <p className="mt-1 text-sm text-muted">
        This screen is not built yet — the layout is ready for its content.
      </p>
    </section>
  </>
);
