import type { ReactNode } from "react";

interface IconsWrapperProps {
  children: ReactNode;
}

export default function IconsWrapper({ children }: IconsWrapperProps) {
  return (
    <div className="flex h-16 w-20 place-content-center items-center">
      {" "}
      {children}
    </div>
  );
}
