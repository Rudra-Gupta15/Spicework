import { useCallback, useState } from "react";

interface Disclosure {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/** Open/closed state for menus, modals and popovers. */
export const useDisclosure = (initial = false): Disclosure => {
  const [isOpen, setOpen] = useState(initial);

  return {
    isOpen,
    open: useCallback(() => setOpen(true), []),
    close: useCallback(() => setOpen(false), []),
    toggle: useCallback(() => setOpen((value) => !value), []),
  };
};
