import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Card, Divider, Input, PasswordInput } from "@/components/ui";
import { AUTH_ROUTES } from "@/config/auth";
import { DEFAULT_ROUTE } from "@/config/navigation";
import { register } from "@/data/auth";
import { ApiError } from "@/lib/api";
import { isValidEmail, type FieldErrors } from "@/lib/validation";

interface RegisterForm {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: RegisterForm = {
  organizationName: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const validate = (form: RegisterForm): FieldErrors<RegisterForm> => {
  const errors: FieldErrors<RegisterForm> = {};

  if (!form.organizationName.trim())
    errors.organizationName = "Organization name is required.";

  if (!form.firstName.trim()) errors.firstName = "First name is required.";

  if (!form.email.trim()) errors.email = "Email address is required.";
  else if (!isValidEmail(form.email))
    errors.email = "Enter a valid email address.";

  /* Matches the backend's minimum, so a password that passes here is never
     bounced back by the server for its length. */
  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 6)
    errors.password = "Password must be at least 6 characters.";

  if (!form.confirmPassword)
    errors.confirmPassword = "Confirm your password.";
  else if (form.confirmPassword !== form.password)
    errors.confirmPassword = "Passwords do not match.";

  return errors;
};

const linkClass =
  "font-semibold text-auth-panel underline underline-offset-2 transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/30 focus-visible:outline-none rounded-sm";

/**
 * Signing up creates the organization and makes the signer-up its
 * Organization Admin — a new account has no tenant to join otherwise. The
 * backend does both in one transaction, so a failed signup leaves nothing
 * half-created.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const handleChange = useCallback((event: FormEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
    setFailure(null);
    setErrors((current) =>
      current[name as keyof RegisterForm]
        ? { ...current, [name]: undefined }
        : current,
    );
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validate(form);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setSubmitting(true);
      setFailure(null);
      try {
        /* Registering signs you straight in — the response carries the same
           token a login would, so there is no reason to ask again. */
        await register({
          organization_name: form.organizationName.trim(),
          email: form.email.trim(),
          password: form.password,
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim() || undefined,
        });
        navigate(DEFAULT_ROUTE, { replace: true });
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          /* A taken address is about one field, so it is shown on it. */
          setErrors((current) => ({ ...current, email: error.message }));
        } else {
          setFailure(
            error instanceof ApiError
              ? error.message
              : "Could not reach the server. Check your connection and try again.",
          );
        }
        setSubmitting(false);
      }
    },
    [form, navigate],
  );

  return (
    <Card className="w-full max-w-[480px] px-8 py-8 sm:px-10">
      <div className="text-center">
        <h2 className="text-xl font-bold text-heading">Create your account</h2>
        <p className="mt-1.5 text-sm text-muted">
          Set up your organization and become its first administrator.
        </p>
      </div>

      {failure && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-status-offline/30 bg-red-50 px-3 py-2 text-sm text-status-offline"
        >
          {failure}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          name="organizationName"
          label="Organization name"
          placeholder="Acme IT Solutions"
          autoComplete="organization"
          value={form.organizationName}
          onChange={handleChange}
          error={errors.organizationName}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="firstName"
            label="First name"
            placeholder="Jordan"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />

          <Input
            name="lastName"
            label="Last name"
            placeholder="Rivera"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
        </div>

        <Input
          name="email"
          type="email"
          label="Work email address"
          placeholder="you@company.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <PasswordInput
          name="password"
          label="Password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <PasswordInput
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="mt-2"
        >
          Create account
        </Button>
      </form>

      <Divider label="or" className="my-6" />

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to={AUTH_ROUTES.login} className={linkClass}>
          Log in
        </Link>
      </p>
    </Card>
  );
};

export default RegisterPage;
