import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { LAUNCHERS, launcherFilename } from "@/data/agent";
import {
  citiesOf,
  sitesInCity,
  useOrganizations,
  useOrganizationSites,
} from "@/data/organizations";
import type { FieldErrors } from "@/lib/validation";
import type { LauncherId, LauncherRegistration } from "@/types/agent";

interface LauncherDetailsModalProps {
  /** Which format was clicked — names the dialog and the download button. */
  launcher: LauncherId;
  /** Whatever was entered last time, so a second download need not retype. */
  initial: LauncherRegistration;
  onClose: () => void;
  onDownload: (registration: LauncherRegistration) => void;
}

type RegistrationErrors = FieldErrors<LauncherRegistration>;

/**
 * Stands between clicking a launcher and getting the file. The audit report
 * a launcher produces arrives keyed only by its client id, so the machine it
 * came from has to be identified here — while somebody is still in front of
 * the screen to say where it is.
 *
 * City and Site are picked from the organization's own places rather than
 * typed, the same way the invite dialog places a person: a report filed
 * against a site nothing else knows about could never be reconciled.
 */
export const LauncherDetailsModal = ({
  launcher,
  initial,
  onClose,
  onDownload,
}: LauncherDetailsModalProps) => {
  const { organizations, isLoading: loadingOrgs, error: orgError } = useOrganizations();

  const [companyName, setCompanyName] = useState(initial.companyName);
  const [city, setCity] = useState(initial.city);
  const [site, setSite] = useState(initial.site);
  const [errors, setErrors] = useState<RegistrationErrors>({});

  const label =
    LAUNCHERS.find((entry) => entry.id === launcher)?.label ?? "Launcher";

  /* The backend files an incoming audit against a company by matching this
     name against the organizations table, so it has to be one of those names
     exactly — a near miss ("Prevoyance IT Solutions" for "Prevoyance
     Solutions") stores the machine unattributed. Hence a picker, not a text
     box. City and Site then come from that company's own registered sites. */
  const companyOptions = useMemo(
    () => organizations.map((entry) => entry.name),
    [organizations],
  );

  const organizationId = useMemo(
    () => organizations.find((entry) => entry.name === companyName)?.id,
    [organizations, companyName],
  );

  /* Drop a pre-filled company that is not a real organization. The dialog opens
     seeded from the signed-in account's name, which is a placeholder constant
     ("Prevoyance IT Solutions") rather than a tenant read from the database
     ("Prevoyance Solutions"). Left in place it looks like a valid choice, and
     the machine uploads unattributed — forcing a pick is the only way the name
     can be trusted to match. */
  useEffect(() => {
    if (organizations.length === 0) return;
    setCompanyName((current) =>
      organizations.some((entry) => entry.name === current) ? current : "",
    );
  }, [organizations]);

  const { sites: orgSites } = useOrganizationSites(organizationId);

  const cities = useMemo(() => citiesOf(orgSites), [orgSites]);

  /* Only the offices in the chosen city — picking a city the machine is not
     in and a site that is would be a contradiction the form should not
     allow in the first place. */
  const sites = useMemo(() => sitesInCity(orgSites, city), [orgSites, city]);

  const changeCompany = (next: string) => {
    setCompanyName(next);
    /* Deliberately keeps City and Site. They can be filled in any order, and
       wiping them on a company change would throw away typing that is usually
       still correct — the company is often picked last, once the person has
       already written down where the machine sits. */
    setErrors((current) => ({ ...current, companyName: undefined }));
  };

  /* Fallback suggestions: every site the company has, for when the typed city
     is a new one and so matches none of them. */
  const knownSiteNames = useMemo(
    () => [...new Set(orgSites.map((entry) => entry.name))].sort((a, b) => a.localeCompare(b)),
    [orgSites],
  );

  const changeCity = (next: string) => {
    setCity(next);
    /* Deliberately does not clear Site: this is a free-text field now, and
       wiping the site on every keystroke would fight anyone correcting a typo. */
    setErrors((current) => ({ ...current, city: undefined }));
  };

  const submit = () => {
    const next: RegistrationErrors = {};

    if (!companyName.trim()) next.companyName = "Pick the company this machine belongs to.";
    if (!city) next.city = "Pick the city this machine is in.";
    if (!site) next.site = "Pick the site this machine is at.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onDownload({ companyName: companyName.trim(), city, site });
  };

  const companyPlaceholder = loadingOrgs
    ? "Loading companies..."
    : companyOptions.length === 0
      ? "No companies registered yet"
      : "Select Company...";

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Before you download"
      description={`${label} — tell us which machine this is for, so the audit it sends back can be filed against the right place.`}
      variant="plain"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="brand"
            leftIcon={<Download className="h-4 w-4" strokeWidth={2.2} />}
            onClick={submit}
          >
            Download {launcherFilename(launcher)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Company Name"
          htmlFor="launcher-company"
          required
          error={errors.companyName ?? orgError}
        >
          <Select
            id="launcher-company"
            size="lg"
            fullWidth
            options={companyOptions}
            value={companyName}
            onChange={changeCompany}
            placeholder={companyPlaceholder}
            aria-label="Company Name"
            error={errors.companyName !== undefined}
          />
        </Field>

        {/* Always typeable, and fillable in any order. Suggestions appear once a
            company is chosen — most companies have no sites on record yet, so a
            pick-only control would be a dead end; a typed office is registered
            under the company on download and offered to whoever sets up the next
            machine there. Nothing is gated on the company being chosen first:
            the fields are independent to fill, and only the submit needs all
            three. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="launcher-city" required error={errors.city}>
            <Input
              id="launcher-city"
              size="lg"
              list="launcher-city-options"
              value={city}
              onChange={(event) => changeCity(event.target.value)}
              placeholder="e.g. Nagpur"
              aria-label="City"
              error={errors.city}
            />
            <datalist id="launcher-city-options">
              {cities.map((entry) => (
                <option key={entry} value={entry} />
              ))}
            </datalist>
          </Field>

          <Field label="Site" htmlFor="launcher-site" required error={errors.site}>
            <Input
              id="launcher-site"
              size="lg"
              list="launcher-site-options"
              value={site}
              onChange={(event) => {
                setSite(event.target.value);
                setErrors((current) => ({ ...current, site: undefined }));
              }}
              placeholder="e.g. Head Office"
              aria-label="Site"
              error={errors.site}
            />
            <datalist id="launcher-site-options">
              {(sites.length > 0 ? sites : knownSiteNames).map((entry) => (
                <option key={entry} value={entry} />
              ))}
            </datalist>
          </Field>
        </div>

        <p className="text-[13px] text-muted">
          The file downloads as soon as you confirm. Double-click it on the
          machine you named — no terminal needed.
        </p>
      </div>
    </Modal>
  );
};
