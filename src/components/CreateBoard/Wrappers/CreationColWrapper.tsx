import type { ReactNode } from "react";

interface CreationColWrapperProps {
  children: ReactNode;
}

export default function CreationColWrapper({
  children,
}: CreationColWrapperProps) {
  return <div className="flex flex-col">{children}</div>;
}
