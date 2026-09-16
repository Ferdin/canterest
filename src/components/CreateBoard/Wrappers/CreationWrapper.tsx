import type { ReactNode } from "react";

interface CreationWrapperProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function CreationWrapper({ onClick, children }: CreationWrapperProps) {
  return (
    <div className="flex items-center px-4 py-4 gap-4 cursor-pointer hover:bg-olive-100 rounded-lg mx-2" onClick={onClick}>
      {children}
    </div>
  );
}
