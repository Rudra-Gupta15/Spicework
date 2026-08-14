import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

import { AdminStatTile } from "@/components/dashboard/AdminStatTile";
import { RecentAuditsCard } from "@/components/dashboard/RecentAuditsCard";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui";
import { ORGANIZATION } from "@/data/admin";
import { adminStats } from "@/data/adminDashboard";

const DashboardPage = () => {
  const navigate = useNavigate();

  /* Recounted on every visit, so a site added or a user invited elsewhere
     shows up here without a reload. */
  const tiles = adminStats();

  return (
    <>
      {/* The heading is the organization itself — there is only one, and the
          person reading this works inside it rather than administering a set
          of tenants. The subtitle says what the page covers rather than
          repeating the numbers, which are the four tiles below. */}
      <Navbar
        title={ORGANIZATION.name}
        subtitle="Manage your sites, users and devices."
        actions={
          <Button
            variant="outline"
            leftIcon={<Building2 className="h-4 w-4" strokeWidth={2.2} />}
            onClick={() => navigate("/dashboard/organization")}
          >
            Organization Profile
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <AdminStatTile key={tile.id} tile={tile} />
          ))}
        </section>

        <RecentAuditsCard />
      </div>
    </>
  );
};

export default DashboardPage;
