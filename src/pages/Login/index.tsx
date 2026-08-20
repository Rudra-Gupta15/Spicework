import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Card, Divider, Input, PasswordInput } from "@/components/ui";
import { AUTH_ROUTES, DEMO_CREDENTIALS, SESSION_KEY } from "@/config/auth";
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
  /* Wrong credentials are a fact about the pair, not about either field, so
     the message sits above the form rather than under one of the inputs. */
  const [rejected, setRejected] = useState(false);

  /** One handler for every field — keyed off the input's `name`. */
  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const { name, value } = event.currentTarget;
      setForm((current) => ({ ...current, [name]: value }));
      setRejected(false);
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

      /* Compared case-insensitively on the address, exactly on the password —
         email is not case sensitive in practice and nobody expects it to be. */
      const matches =
        form.email.trim().toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() &&
        form.password === DEMO_CREDENTIALS.password;

      if (!matches) {
        setRejected(true);
        return;
      }

      setSubmitting(true);
      localStorage.setItem(SESSION_KEY, form.email.trim());
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

      {rejected && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-status-offline/30 bg-red-50 px-3 py-2 text-sm text-status-offline"
        >
          That email and password do not match an account.
        </p>
      )}

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
