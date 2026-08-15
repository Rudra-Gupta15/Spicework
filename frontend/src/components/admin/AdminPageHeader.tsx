import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** One step in the trail; the last crumb is the current page and has no link. */
export interface AdminCrumb {
  label: string;
  to?: string;
}

interface AdminPageHeaderProps {
  crumbs: AdminCrumb[];
  title: string;
  subtitle?: ReactNode;
  /** Right-aligned slot for page-level actions. */
  actions?: ReactNode;
}

/**
 * Header for the screens that sit below a list — an organization, one of its
 * sites, or the form that creates either. The trail is what tells you which
 * account and organization you are working inside, so it is not optional.
 */
export const AdminPageHeader = ({
  crumbs,
  title,
  subtitle,
  actions,
}: AdminPageHeaderProps) => (
  <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
    <div className="min-w-0 flex-1 basis-64">
      <nav aria-label="Breadcrumb" className="text-[13px] font-medium text-heading">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`}>
            {index > 0 && <span className="mx-1.5 text-muted">&gt;</span>}

            {crumb.to ? (
              <Link to={crumb.to} className="transition-colors hover:text-brand">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="mt-1 text-[22px] leading-tight font-bold break-words text-heading sm:text-[26px]">
        {title}
      </h1>

      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>

    {actions && (
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        {actions}
      </div>
    )}
  </header>
);
