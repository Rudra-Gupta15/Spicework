import { Link } from "react-router-dom";

import { DEFAULT_ROUTE } from "@/config/navigation";

const NotFoundPage = () => (
  <section className="grid place-items-center rounded-xl border border-line bg-surface px-6 py-20 shadow-card">
    <p className="text-5xl font-bold text-navy-300">404</p>
    <h2 className="mt-3 text-lg font-semibold text-heading">Page not found</h2>
    <p className="mt-1 text-sm text-muted">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link
      to={DEFAULT_ROUTE}
      className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
    >
      Back to Hardware
    </Link>
  </section>
);

export default NotFoundPage;
