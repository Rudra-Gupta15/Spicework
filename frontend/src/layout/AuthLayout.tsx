import { Outlet } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import { AUTH_PANEL } from "@/config/auth";

/**
 * Split-screen shell for the auth screens (login, forgot password, …).
 * The marketing panel is hidden below `lg`, where the form takes the
 * full width.
 */
const AuthLayout = () => (
  <div className="flex min-h-screen bg-canvas">
    {/* Left — marketing panel */}
    <aside className="hidden w-1/2 flex-col justify-between bg-auth-panel p-12 lg:flex xl:p-14">
      <Logo />

      <div className="max-w-xl">
        <span className="inline-block rounded-full bg-navy-500/70 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-white uppercase">
          {AUTH_PANEL.badge}
        </span>

        <h1 className="mt-6 text-[40px] leading-[1.15] font-bold text-white">
          {AUTH_PANEL.heading}
        </h1>

        <p className="mt-5 text-[15px] leading-relaxed text-navy-200">
          {AUTH_PANEL.description}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm text-navy-200">
        <span>{AUTH_PANEL.footer.copyright}</span>
        <span>{AUTH_PANEL.footer.note}</span>
      </div>
    </aside>

    {/* Right — form area */}
    <main className="flex w-full flex-col items-center justify-center px-5 py-12 lg:w-1/2">
      <Logo size="lg" variant="dark" className="mb-8" />
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;
