import type { ReactNode } from "react";

interface MainNavWrapperProps {
  children: ReactNode;
}
export default function MainNavWrapper({ children }: MainNavWrapperProps) {
  return (
    <div className="px-2 py-4 flex w-full bg-white filter shadow-sm sticky">
      {children}
    </div>
  );
}
