import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { LAUNCHERS, launcherFilename } from "@/data/agent";
import { citiesInOrder } from "@/data/admin";
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
  const cities = useMemo(() => citiesInOrder(), []);

  const [companyName, setCompanyName] = useState(initial.companyName);
  const [city, setCity] = useState(initial.city);
  const [site, setSite] = useState(initial.site);
  const [errors, setErrors] = useState<RegistrationErrors>({});

  const label =
    LAUNCHERS.find((entry) => entry.id === launcher)?.label ?? "Launcher";

  /* Only the offices in the chosen city — picking a city the machine is not
     in and a site that is would be a contradiction the form should not
     allow in the first place. */
  const sites = useMemo(
    () => cities.find((entry) => entry.city === city)?.siteNames ?? [],
    [cities, city],
  );

  const changeCity = (next: string) => {
    setCity(next);
    /* The old site almost certainly belongs to the old city. */
    setSite("");
    setErrors((current) => ({ ...current, city: undefined, site: undefined }));
  };

  const submit = () => {
    const next: RegistrationErrors = {};

    if (!companyName.trim()) next.companyName = "Enter the company name.";
    if (!city) next.city = "Pick the city this machine is in.";
    if (!site) next.site = "Pick the site this machine is at.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onDownload({ companyName: companyName.trim(), city, site });
  };

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
          error={errors.companyName}
        >
          <Input
            id="launcher-company"
            value={companyName}
            onChange={(event) => {
              setCompanyName(event.target.value);
              setErrors((current) => ({ ...current, companyName: undefined }));
            }}
            placeholder="e.g. Prevoyance IT Solutions"
            error={errors.companyName}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="launcher-city" required error={errors.city}>
            <Select
              id="launcher-city"
              size="lg"
              fullWidth
              options={cities.map((entry) => entry.city)}
              value={city}
              onChange={changeCity}
              placeholder="Select City..."
              aria-label="City"
              error={errors.city !== undefined}
            />
          </Field>

          <Field label="Site" htmlFor="launcher-site" required error={errors.site}>
            <Select
              id="launcher-site"
              size="lg"
              fullWidth
              align="right"
              options={sites}
              value={site}
              onChange={(next) => {
                setSite(next);
                setErrors((current) => ({ ...current, site: undefined }));
              }}
              placeholder={city ? "Select Site..." : "Pick a city first"}
              aria-label="Site"
              error={errors.site !== undefined}
            />
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
