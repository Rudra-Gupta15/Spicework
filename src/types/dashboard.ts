import type { Tone } from "./ui";

/** One slice of a donut / one legend row. */
export interface Segment {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface OsBreakdownRow extends Segment {
  share: string;
}

/** One bar in the activity chart. */
export interface BarPoint {
  label: string;
  value: number;
}

export interface DeviceAudit {
  id: string;
  device: string;
  ip: string;
  os: string;
  auditedOn: string;
  score: number;
  status: "Pass" | "Fail";
}

export interface ActivityItem {
  id: string;
  actor: string;
  tag: string;
  tagTone: Tone;
  time: string;
  description: string;
}
