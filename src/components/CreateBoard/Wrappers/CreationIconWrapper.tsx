import type { ReactNode } from "react";

interface CreationIconWrapperProps {
  children: ReactNode;
}

export default function CreationIconWrapper({
  children,
}: CreationIconWrapperProps) {
  return (
    <div className="flex items-center justify-center bg-olive-300 rounded-2xl">
      {children}
    </div>
  );
}
