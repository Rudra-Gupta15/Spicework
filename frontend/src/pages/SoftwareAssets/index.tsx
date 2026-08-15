import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { AppsTable } from "@/components/software/AppsTable";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui";
import { TOTAL_SOFTWARE_APPS } from "@/data/software";
import { SOFTWARE_ASSETS } from "@/data/softwareAssets";

const SOFTWARE_ROUTE = "/inventory/software";

/** Estate-wide application list, opened from the "Total Software" tile. */
const SoftwareAssetsPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar
        title="Total Softwares Assets"
        subtitle="Track software applications, licenses, and installations across your network."
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(SOFTWARE_ROUTE)}
          >
            Back
          </Button>
        }
      />

      <div className="mt-6">
        <AppsTable
          apps={SOFTWARE_ASSETS}
          pageSize={25}
          totalItems={TOTAL_SOFTWARE_APPS}
        />
      </div>
    </>
  );
};

export default SoftwareAssetsPage;
