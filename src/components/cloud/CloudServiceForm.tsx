import { useCallback, useState, type ReactNode } from "react";

import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  Select,
  Textarea,
  Toggle,
} from "@/components/ui";
import { useDisclosure } from "@/hooks/useDisclosure";
import {
  BILLING_INTERVAL_OPTIONS,
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
  PROVIDER_OPTIONS,
  withValue,
} from "@/data/cloudForm";
import type {
  CloudServiceFormErrors,
  CloudServiceFormValues,
} from "@/types/cloud";

interface CloudServiceFormProps {
  /** Prefilled record when editing; blank values when registering. */
  initialValues: CloudServiceFormValues;
  submitLabel: string;
  onSubmit: (values: CloudServiceFormValues) => void;
  onCancel: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Numbered block with the divider the form uses between its groups. */
const FormSection = ({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) => (
  <section className="border-b border-line px-6 py-6">
    <h2 className="mb-5 text-[15px] font-bold text-heading">
      {step}. {title}
    </h2>
    {children}
  </section>
);

const validate = (
  values: CloudServiceFormValues,
): CloudServiceFormErrors => {
  const errors: CloudServiceFormErrors = {};

  if (!values.name.trim()) errors.name = "Service name is required.";
  if (!values.provider) errors.provider = "Select the cloud provider.";

  if (!values.adminContact.trim()) {
    errors.adminContact = "An administrative contact is required.";
  } else if (!EMAIL_PATTERN.test(values.adminContact.trim())) {
    errors.adminContact = "Enter a valid email address.";
  }

  for (const key of ["startDate", "expiryDate"] as const) {
    if (values[key] && !ISO_DATE_PATTERN.test(values[key])) {
      errors[key] = "Use the YYYY-MM-DD format.";
    }
  }

  if (
    values.startDate &&
    values.expiryDate &&
    !errors.startDate &&
    !errors.expiryDate &&
    values.expiryDate < values.startDate
  ) {
    errors.expiryDate = "Expiration must fall after the start date.";
  }

  return errors;
};

/**
 * Entry form for a cloud subscription — shared by the "add service" and
 * "edit configuration" screens, which only differ in their prefill.
 */
export const CloudServiceForm = ({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: CloudServiceFormProps) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CloudServiceFormErrors>({});
  const cancelPrompt = useDisclosure();

  const update = useCallback(
    (patch: Partial<CloudServiceFormValues>) => {
      setValues((current) => ({ ...current, ...patch }));
      /* Clear the messages for the fields being corrected. */
      setErrors((current) => {
        const next = { ...current };
        for (const key of Object.keys(patch) as (keyof CloudServiceFormValues)[]) {
          delete next[key];
        }
        return next;
      });
    },
    [],
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="overflow-hidden">
        <FormSection step={1} title="Service Information">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Service Name" htmlFor="service-name">
              <Input
                id="service-name"
                value={values.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="e.g. Zendesk Support Suite"
                error={errors.name}
              />
            </Field>

            <Field
              label="Cloud Provider"
              htmlFor="service-provider"
              error={errors.provider}
            >
              <Select
                id="service-provider"
                size="lg"
                fullWidth
                options={withValue(PROVIDER_OPTIONS, values.provider)}
                value={values.provider}
                onChange={(provider) => update({ provider })}
                placeholder="Select Provider (e.g. AWS, Microsoft, Custom)"
                error={Boolean(errors.provider)}
                aria-label="Cloud provider"
              />
            </Field>

            <Field label="Category" htmlFor="service-category">
              <Select
                id="service-category"
                size="lg"
                fullWidth
                options={withValue(CATEGORY_OPTIONS, values.category)}
                value={values.category}
                onChange={(category) => update({ category })}
                placeholder="Select Category"
                aria-label="Category"
              />
            </Field>

            <Field
              label="Service console Endpoint / URL"
              htmlFor="service-endpoint"
            >
              <Input
                id="service-endpoint"
                type="url"
                value={values.endpoint}
                onChange={(event) => update({ endpoint: event.target.value })}
                placeholder="e.g. https://spiceworks.zendesk.com"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step={2} title="Subscription Contract Details">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Subscription Plan Tier" htmlFor="service-plan">
              <Input
                id="service-plan"
                value={values.planTier}
                onChange={(event) => update({ planTier: event.target.value })}
                placeholder="e.g. Professional Enterprise SLA"
              />
            </Field>

            <Field label="Monthly Spend Share" htmlFor="service-spend">
              <Input
                id="service-spend"
                value={values.monthlySpend}
                onChange={(event) =>
                  update({ monthlySpend: event.target.value })
                }
                placeholder="e.g. $1,250"
              />
            </Field>

            <Field label="Billing Interval" htmlFor="service-billing">
              <Select
                id="service-billing"
                size="lg"
                fullWidth
                options={withValue(
                  BILLING_INTERVAL_OPTIONS,
                  values.billingInterval,
                )}
                value={values.billingInterval}
                onChange={(billingInterval) => update({ billingInterval })}
                placeholder="Select Billing Interval"
                aria-label="Billing interval"
              />
            </Field>

            <Field label="Contract Commencement Date" htmlFor="service-start">
              <Input
                id="service-start"
                value={values.startDate}
                onChange={(event) => update({ startDate: event.target.value })}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
                error={errors.startDate}
              />
            </Field>

            <Field label="Expiration Date" htmlFor="service-expiry">
              <Input
                id="service-expiry"
                value={values.expiryDate}
                onChange={(event) => update({ expiryDate: event.target.value })}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
                error={errors.expiryDate}
              />
            </Field>

            <Field label="Auto-Renew Contract">
              <Toggle
                checked={values.autoRenew}
                onChange={(autoRenew) => update({ autoRenew })}
                label="Renewal notification alert active"
                className="h-11"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step={3} title="Users & IT Operations Admin">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Primary Administrative Contact"
              htmlFor="service-admin"
            >
              <Input
                id="service-admin"
                type="email"
                value={values.adminContact}
                onChange={(event) =>
                  update({ adminContact: event.target.value })
                }
                placeholder="e.g. admin-team@spiceworks.com"
                error={errors.adminContact}
              />
            </Field>

            <Field label="Allocated Department Group" htmlFor="service-team">
              <Select
                id="service-team"
                size="lg"
                fullWidth
                options={withValue(DEPARTMENT_OPTIONS, values.department)}
                value={values.department}
                onChange={(department) => update({ department })}
                placeholder="Select Department"
                aria-label="Allocated department group"
              />
            </Field>

            <Field label="Maximum User Licenses" htmlFor="service-licenses">
              <Input
                id="service-licenses"
                type="number"
                min={0}
                value={values.maxLicenses}
                onChange={(event) =>
                  update({ maxLicenses: event.target.value })
                }
                placeholder="e.g. 150"
              />
            </Field>

            <Field
              label="Configuration Notes & Special Instructions"
              htmlFor="service-notes"
              className="md:col-span-2 lg:col-span-3"
            >
              <Textarea
                id="service-notes"
                value={values.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Add details regarding internal deployment, security groups or vendor accounts..."
              />
            </Field>
          </div>
        </FormSection>

        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5">
          <Button variant="outline" size="lg" onClick={cancelPrompt.open}>
            Cancel Entry
          </Button>
          <Button variant="brand" size="lg" type="submit">
            {submitLabel}
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={cancelPrompt.isOpen}
        title="Cancel Entry?"
        description="Are you sure you want to cancel? All unsaved changes will be lost."
        cancelLabel="No, Continue Editing"
        confirmLabel="Yes, Cancel Entry"
        onCancel={cancelPrompt.close}
        onConfirm={onCancel}
      />
    </form>
  );
};
