import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button, Card, Field, Input, Select, Toggle } from "@/components/ui";
import {
  ADMIN_COUNTRY_OPTIONS,
  ADMIN_SITES,
  ADMIN_SITE_TYPE_OPTIONS,
  ADMIN_STATUS_VALUES,
  ADMIN_TIMEZONE_OPTIONS,
  ORGANIZATION,
  addSite,
  findSite,
  updateSite,
} from "@/data/admin";
import type { AdminSiteType, AdminStatus } from "@/types/admin";

const SITES_ROUTE = "/dashboard/sites";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Section heading inside the form card. */
const FormSection = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className="border-t border-line pt-5 first:border-0 first:pt-0">
    <h2 className="text-sm font-bold text-heading">{title}</h2>
    {hint && <p className="mt-0.5 text-[13px] text-muted">{hint}</p>}
    <div className="mt-4 space-y-5">{children}</div>
  </section>
);

/**
 * Adds a location to the organization, and edits it afterwards. The parent is
 * never asked for — there is one organization and every site belongs to it.
 */
const AdminSiteFormPage = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();

  const existing = useMemo(() => (siteId ? findSite(siteId) : undefined), [siteId]);

  /* The first location is the registered address, so there is nothing to
     choose until a second one exists. */
  const isFirstSite = useMemo(() => !existing && ADMIN_SITES.length === 0, [existing]);

  const [name, setName] = useState(() => existing?.name ?? "");
  const [siteType, setSiteType] = useState<AdminSiteType>(
    () => existing?.siteType ?? "Branch Office",
  );
  const [status, setStatus] = useState<AdminStatus>(
    () => existing?.status ?? "Active",
  );
  const [addressLine, setAddressLine] = useState(() => existing?.addressLine ?? "");
  const [city, setCity] = useState(() => existing?.city ?? "");
  const [state, setState] = useState(() => existing?.state ?? "");
  const [country, setCountry] = useState(() => existing?.country ?? "India");
  const [postalCode, setPostalCode] = useState(() => existing?.postalCode ?? "");
  const [timezone, setTimezone] = useState(
    () => existing?.timezone ?? ADMIN_TIMEZONE_OPTIONS[0],
  );
  const [contactName, setContactName] = useState(() => existing?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(
    () => existing?.contactEmail ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    () => existing?.contactPhone ?? "",
  );
  const [isPrimary, setIsPrimary] = useState(
    () => existing?.isPrimary ?? isFirstSite,
  );
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    name: name.trim() === "" ? "Give the site a name." : "",
    addressLine: addressLine.trim() === "" ? "Street address is required." : "",
    city: city.trim() === "" ? "City is required." : "",
    state: state.trim() === "" ? "State or region is required." : "",
    contactEmail:
      contactEmail.trim() !== "" && !EMAIL_PATTERN.test(contactEmail.trim())
        ? "Enter a valid email address."
        : "",
  };

  const isComplete = Object.values(errors).every((message) => message === "");

  const submit = useCallback(() => {
    if (!isComplete) {
      setShowErrors(true);
      return;
    }

    const draft = {
      name: name.trim(),
      siteType,
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      country,
      postalCode: postalCode.trim(),
      timezone,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      /* The first site is always the registered address, whatever the toggle
         reads — there is nothing else it could be. */
      isPrimary: isFirstSite ? true : isPrimary,
      status,
    };

    if (existing) updateSite(existing.id, draft);
    else addSite(draft);

    navigate(SITES_ROUTE, { replace: true });
  }, [
    isComplete,
    existing,
    name,
    siteType,
    addressLine,
    city,
    state,
    country,
    postalCode,
    timezone,
    contactName,
    contactEmail,
    contactPhone,
    isFirstSite,
    isPrimary,
    status,
    navigate,
  ]);

  /* Deep link to a site that is not in the current data set. */
  if (siteId && !existing) return <Navigate to={SITES_ROUTE} replace />;

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: "Sites", to: SITES_ROUTE },
          { label: existing ? existing.name : "New Site" },
        ]}
        title={existing ? "Edit Site" : "Add Site"}
        subtitle={
          existing
            ? `Location under ${ORGANIZATION.name}.`
            : `A new location for ${ORGANIZATION.name}${
                isFirstSite ? " — this becomes its registered address." : "."
              }`
        }
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
            onClick={() => navigate(SITES_ROUTE)}
          >
            Back
          </Button>
        }
      />

      <Card className="mt-6 px-6 py-6">
        <div className="space-y-6">
          <FormSection
            title="Site Details"
            hint="What this location is called and what it is used for."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field
                label="Site Name"
                htmlFor="site-name"
                required
                error={showErrors ? errors.name : undefined}
              >
                <Input
                  id="site-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Branch — Pune"
                  error={showErrors ? errors.name : undefined}
                />
              </Field>

              <Field label="Site Type" htmlFor="site-type" required>
                <Select
                  id="site-type"
                  size="lg"
                  fullWidth
                  options={ADMIN_SITE_TYPE_OPTIONS}
                  value={siteType}
                  onChange={(value) => setSiteType(value as AdminSiteType)}
                  aria-label="Site type"
                />
              </Field>

              <Field label="Status" htmlFor="site-status">
                <Select
                  id="site-status"
                  size="lg"
                  fullWidth
                  align="right"
                  options={ADMIN_STATUS_VALUES}
                  value={status}
                  onChange={(value) => setStatus(value as AdminStatus)}
                  aria-label="Status"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Address" hint="Where the location physically is.">
            <Field
              label="Street Address"
              htmlFor="site-address"
              required
              error={showErrors ? errors.addressLine : undefined}
            >
              <Input
                id="site-address"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
                placeholder="e.g., 14 Hinjewadi Phase II"
                error={showErrors ? errors.addressLine : undefined}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field
                label="City"
                htmlFor="site-city"
                required
                error={showErrors ? errors.city : undefined}
              >
                <Input
                  id="site-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="e.g., Pune"
                  error={showErrors ? errors.city : undefined}
                />
              </Field>

              <Field
                label="State / Region"
                htmlFor="site-state"
                required
                error={showErrors ? errors.state : undefined}
              >
                <Input
                  id="site-state"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  placeholder="e.g., Maharashtra"
                  error={showErrors ? errors.state : undefined}
                />
              </Field>

              <Field label="Country" htmlFor="site-country" required>
                <Select
                  id="site-country"
                  size="lg"
                  fullWidth
                  options={ADMIN_COUNTRY_OPTIONS}
                  value={country}
                  onChange={setCountry}
                  aria-label="Country"
                />
              </Field>

              <Field label="Postal Code" htmlFor="site-postal">
                <Input
                  id="site-postal"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="e.g., 411057"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Timezone" htmlFor="site-timezone" required>
                <Select
                  id="site-timezone"
                  size="lg"
                  fullWidth
                  options={ADMIN_TIMEZONE_OPTIONS}
                  value={timezone}
                  onChange={setTimezone}
                  aria-label="Timezone"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Site Contact"
            hint="Who to reach for anything happening at this location."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field label="Contact Name" htmlFor="site-contact-name">
                <Input
                  id="site-contact-name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="e.g., Priya Sharma"
                />
              </Field>

              <Field
                label="Contact Email"
                htmlFor="site-contact-email"
                error={showErrors ? errors.contactEmail : undefined}
              >
                <Input
                  id="site-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="e.g., priya.sharma@prevoyancesolutions.com"
                  error={showErrors ? errors.contactEmail : undefined}
                />
              </Field>

              <Field label="Contact Phone" htmlFor="site-contact-phone">
                <Input
                  id="site-contact-phone"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="e.g., +91 98765 43210"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Registered Address"
            hint="Only one location can hold this — turning it on moves it here."
          >
            <Toggle
              checked={isFirstSite ? true : isPrimary}
              onChange={setIsPrimary}
              disabled={isFirstSite}
              label={
                isFirstSite
                  ? "First site of the organization — set as its registered address"
                  : "Make this the organization's registered address"
              }
            />
          </FormSection>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
          <Button
            variant="outlinePrimary"
            size="lg"
            onClick={() => navigate(SITES_ROUTE)}
          >
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={submit}>
            {existing ? "Save Changes" : "Add Site"}
          </Button>
        </div>
      </Card>
    </>
  );
};

export default AdminSiteFormPage;
