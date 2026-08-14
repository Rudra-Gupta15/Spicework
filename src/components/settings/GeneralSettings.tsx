import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, UploadCloud } from "lucide-react";

import { Card, Field, Input, Select } from "@/components/ui";
import {
  ADMIN_INDUSTRY_OPTIONS,
  ADMIN_SITES,
  ORGANIZATION,
  primarySite,
  updateOrganization,
} from "@/data/admin";
import { GENERAL_SETTINGS, PRIMARY_THEME_COLOR } from "@/data/settings";

const FIELD_CLASS = "bg-canvas";

interface GeneralSettingsProps {
  /**
   * The page's header holds the Save button, so the form hands its commit
   * back through this ref rather than lifting every field up a level.
   */
  saveRef: RefObject<(() => void) | null>;
}

/** The General category: company profile, regional prefs and branding. */
export const GeneralSettings = ({ saveRef }: GeneralSettingsProps) => {
  /* Name and industry are the organization's own record — the same one the
     dashboard heading and every site read — so they are seeded from it and
     written back to it, not kept as a second copy. */
  const [name, setName] = useState(ORGANIZATION.name);
  const [industry, setIndustry] = useState(ORGANIZATION.industry);
  const [prefs, setPrefs] = useState(GENERAL_SETTINGS);
  const logoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveRef.current = () => {
      if (name.trim() === "") return;
      updateOrganization({
        name: name.trim(),
        industry,
        status: ORGANIZATION.status,
      });
    };
  });

  const setPref = (key: keyof typeof prefs) => (value: string) =>
    setPrefs((current) => ({ ...current, [key]: value }));

  const registered = primarySite();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">Company Info</h2>

          <div className="space-y-4">
            <Field label="Company Name" htmlFor="company-name">
              <Input
                id="company-name"
                className={FIELD_CLASS}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Select
                id="industry"
                size="lg"
                fullWidth
                className={FIELD_CLASS}
                options={ADMIN_INDUSTRY_OPTIONS}
                value={industry}
                onChange={setIndustry}
                aria-label="Industry"
              />
            </Field>
            <Field label="Company Size" htmlFor="company-size">
              <Input
                id="company-size"
                className={FIELD_CLASS}
                value={prefs.companySize}
                onChange={(e) => setPref("companySize")(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">
            Regional Settings
          </h2>

          <div className="space-y-4">
            <Field label="Timezone" htmlFor="timezone">
              <Input
                id="timezone"
                className={FIELD_CLASS}
                value={prefs.timezone}
                onChange={(e) => setPref("timezone")(e.target.value)}
              />
            </Field>
            <Field label="Date Format" htmlFor="date-format">
              <Input
                id="date-format"
                className={FIELD_CLASS}
                value={prefs.dateFormat}
                onChange={(e) => setPref("dateFormat")(e.target.value)}
              />
            </Field>
            <Field label="Language" htmlFor="language">
              <Input
                id="language"
                className={FIELD_CLASS}
                value={prefs.language}
                onChange={(e) => setPref("language")(e.target.value)}
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Locations are managed on their own screen — repeating the form
            here would give the same site two places to be edited. */}
        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">Locations</h2>
          <p className="mt-1 text-[13px] text-muted">
            {ORGANIZATION.name} operates from {ADMIN_SITES.length}{" "}
            {ADMIN_SITES.length === 1 ? "site" : "sites"}.
          </p>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
                Registered Address
              </dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-heading">
                {registered
                  ? `${registered.addressLine}, ${registered.location} ${registered.postalCode}`.trim()
                  : "Not set"}
              </dd>
            </div>
          </dl>

          <Link
            to="/dashboard/sites"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-600"
          >
            <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Manage sites
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </Card>

        <Card className="h-fit px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">Branding</h2>

          <p className="mb-1.5 text-[13px] font-semibold text-heading">
            Logo Upload
          </p>
          <button
            type="button"
            onClick={() => logoInput.current?.click()}
            className="grid w-full place-items-center rounded-lg border border-dashed border-field bg-canvas px-6 py-8 text-center transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:outline-none"
          >
            <UploadCloud
              className="h-6 w-6 text-muted"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span className="mt-2 text-sm font-semibold text-brand">
              Click to upload
            </span>
            <span className="mt-1 text-[13px] text-muted">
              PNG or JPG up to 5MB (Max 240x60px)
            </span>
          </button>
          <input
            ref={logoInput}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="sr-only"
            aria-label="Upload logo"
          />

          <p className="mt-5 mb-2 text-[13px] font-semibold text-heading">
            Primary Theme Color
          </p>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-10 w-10 shrink-0 rounded-lg"
              style={{ backgroundColor: PRIMARY_THEME_COLOR }}
            />
            <div>
              <p className="font-semibold text-heading">{PRIMARY_THEME_COLOR}</p>
              <p className="text-[13px] text-muted">Active action color</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
