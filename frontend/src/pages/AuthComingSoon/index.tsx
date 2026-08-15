import { Link } from "react-router-dom";

import { Card } from "@/components/ui";
import { AUTH_ROUTES } from "@/config/auth";

interface AuthComingSoonProps {
  title: string;
}

/** Stand-in for the auth screens that are not built yet. */
const AuthComingSoon = ({ title }: AuthComingSoonProps) => (
  <Card className="w-full max-w-[480px] px-8 py-10 text-center sm:px-10">
    <h2 className="text-xl font-bold text-heading">{title}</h2>
    <p className="mt-1.5 text-sm text-muted">
      This screen is not built yet — the auth layout is ready for it.
    </p>
    <Link
      to={AUTH_ROUTES.login}
      className="mt-6 inline-block text-sm font-semibold text-auth-panel underline underline-offset-2 hover:text-brand"
    >
      Back to log in
    </Link>
  </Card>
);

export default AuthComingSoon;
