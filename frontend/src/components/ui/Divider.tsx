import { cn } from "@/lib/cn";

interface DividerProps {
  /** Optional text centred on the rule, e.g. "OR". */
  label?: string;
  className?: string;
}

export const Divider = ({ label, className }: DividerProps) => {
  if (!label) {
    return <hr className={cn("border-t border-line", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-line" />
      <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
};
