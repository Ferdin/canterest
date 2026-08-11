import type { ReactNode } from "react";

interface IconsWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function IconsWrapper({
  children,
  className = "",
}: IconsWrapperProps) {
  return (
    <div
      className={`flex h-16 w-20 place-content-center items-center ${className}`}
    >
      {" "}
      {children}
    </div>
  );
}
