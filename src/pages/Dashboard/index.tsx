import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

import { AdminStatTile } from "@/components/dashboard/AdminStatTile";
import { ComplianceOverviewCard } from "@/components/dashboard/ComplianceOverviewCard";
import { DeviceStatusCard } from "@/components/dashboard/DeviceStatusCard";
import { RecentAuditsCard } from "@/components/dashboard/RecentAuditsCard";
import { Navbar } from "@/components/layout/Navbar";
import { Button, SkeletonTiles } from "@/components/ui";
import { ORGANIZATION } from "@/data/admin";
import { useDashboardTiles } from "@/data/dashboardApi";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { tiles, isLoading, error } = useDashboardTiles();

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
        {error && (
          <p className="text-[13px] text-status-offline">{error}</p>
        )}

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <SkeletonTiles count={4} className="h-[122px]" />
          ) : (
            tiles.map((tile) => <AdminStatTile key={tile.id} tile={tile} />)
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DeviceStatusCard />
          <ComplianceOverviewCard />
        </section>

        <RecentAuditsCard />
      </div>
    </>
  );
};

export default DashboardPage;
