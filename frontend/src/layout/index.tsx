import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

/**
 * App shell: fixed sidebar + sticky header + scrollable content area.
 * Each page renders its own <Navbar /> so it can set the title, subtitle
 * and header actions it needs.
 */
const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  /* Lock body scroll while the mobile sidebar is open. */
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  /* Esc closes the mobile sidebar. */
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-screen flex-col lg:pl-sidebar">
        <Header onMenuClick={openSidebar} />

        <main className="flex-1 px-5 py-7 sm:px-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
