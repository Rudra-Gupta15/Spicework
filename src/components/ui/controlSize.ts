/**
 * One height scale for every interactive control — inputs, selects and
 * buttons. Anything that can sit next to something else in a row must use
 * these, so a filter bar or form row always lines up.
 */
export type ControlSize = "sm" | "md" | "lg";

/** Height + matching type size. Padding stays per-component. */
export const CONTROL_SIZES: Record<ControlSize, string> = {
  sm: "h-9 text-[13px]", // 36px — filter bars, table actions
  md: "h-10 text-sm", // 40px — dense forms
  lg: "h-11 text-[15px]", // 44px — auth and primary forms
};
