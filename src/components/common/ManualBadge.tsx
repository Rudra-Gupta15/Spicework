/**
 * Small circled "M", raised like a mathematical exponent (x²) — marks a
 * name a person typed in by hand, as opposed to one read off an agent's
 * scan. Sits right after the name it marks, the same way a superscript
 * attaches to the character before it, rather than competing with the name
 * for the reader's eye the way a full-size badge would.
 */
export const ManualBadge = () => (
  <sup
    title="Manually entered"
    aria-label="Manually entered"
    className="ml-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full border border-brand-600 text-[7px] font-bold leading-none text-brand-600"
  >
    M
  </sup>
);
