import { Link } from "react-router-dom";

import { Avatar, Badge, SectionCard } from "@/components/ui";
import { RECENT_ACTIVITY } from "@/data/dashboard";

/** Latest changes across the estate. */
export const RecentActivityCard = () => (
  <SectionCard
    title="Recent Activity"
    action={
      <Link
        to="/log"
        className="text-sm font-semibold text-status-info hover:underline"
      >
        View All
      </Link>
    }
    flush
    bodyClassName="px-5 pb-5"
  >
    <ul className="divide-y divide-line">
      {RECENT_ACTIVITY.map((item) => (
        <li key={item.id} className="flex items-start gap-3 py-3.5">
          <Avatar name={item.actor} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-heading">
                {item.actor}
              </span>
              <Badge tone={item.tagTone}>{item.tag}</Badge>
              <span className="text-xs text-muted">{item.time}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  </SectionCard>
);
