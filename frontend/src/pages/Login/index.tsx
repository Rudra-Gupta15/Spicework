import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Card, Divider, Input, PasswordInput } from "@/components/ui";
import { AUTH_ROUTES } from "@/config/auth";
import { DEFAULT_ROUTE } from "@/config/navigation";
import { isValidEmail, type FieldErrors } from "@/lib/validation";

interface LoginForm {
  email: string;
  password: string;
}

const INITIAL_FORM: LoginForm = { email: "", password: "" };

const validate = ({ email, password }: LoginForm): FieldErrors<LoginForm> => {
  const errors: FieldErrors<LoginForm> = {};

  if (!email.trim()) errors.email = "Email address is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";

  return errors;
};

const linkClass =
  "font-semibold text-auth-panel underline underline-offset-2 transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/30 focus-visible:outline-none rounded-sm";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const [isSubmitting, setSubmitting] = useState(false);

  /** One handler for every field — keyed off the input's `name`. */
  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const { name, value } = event.currentTarget;
      setForm((current) => ({ ...current, [name]: value }));
      setErrors((current) =>
        current[name as keyof LoginForm]
          ? { ...current, [name]: undefined }
          : current,
      );
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validate(form);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      // TODO: replace with the real auth call.
      setSubmitting(true);
      navigate(DEFAULT_ROUTE, { replace: true });
    },
    [form, navigate],
  );

  return (
    <Card className="w-full max-w-[480px] px-8 py-8 sm:px-10">
      <div className="text-center">
        <h2 className="text-xl font-bold text-heading">Log in to Spiceworks</h2>
        <p className="mt-1.5 text-sm text-muted">
          Sign in with your organization credentials or Okta SSO.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="Enter your email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <PasswordInput
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="mt-2"
        >
          Log in
        </Button>
      </form>

      <Divider label="or" className="my-6" />

      <div className="space-y-3 text-center text-sm">
        <Link to={AUTH_ROUTES.forgotPassword} className={`block ${linkClass}`}>
          Forgot your password?
        </Link>

        <p className="text-muted">
          New to Spiceworks?{" "}
          <Link to={AUTH_ROUTES.register} className={linkClass}>
            Create Account
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginPage;
