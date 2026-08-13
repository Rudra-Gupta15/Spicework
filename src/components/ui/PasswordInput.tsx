import { useCallback, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "./Input";
import type { ControlSize } from "./controlSize";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Shared control height — matches Button and Select at the same size. */
  size?: ControlSize;
  label?: string;
  error?: string;
}

/** Password field with a show/hide toggle. */
export const PasswordInput = ({ ...props }: PasswordInputProps) => {
  const [isVisible, setVisible] = useState(false);
  const toggle = useCallback(() => setVisible((value) => !value), []);

  return (
    <Input
      type={isVisible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={toggle}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:text-heading focus-visible:ring-2 focus-visible:ring-auth-panel/30 focus-visible:outline-none"
        >
          {isVisible ? (
            <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />
          ) : (
            <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.8} />
          )}
        </button>
      }
      {...props}
    />
  );
};
