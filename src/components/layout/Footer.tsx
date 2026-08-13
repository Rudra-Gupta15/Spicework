import { Link } from "react-router-dom";

import { APP_FOOTER } from "@/config/app";

export const Footer = () => (
  <footer className="mt-auto border-t border-line px-5 py-4 sm:px-8">
    <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
      <p>{APP_FOOTER.copyright}</p>

      <nav className="flex items-center gap-5">
        {APP_FOOTER.links.map((link) => (
          <Link key={link.id} to={link.path} className="hover:text-heading">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);
