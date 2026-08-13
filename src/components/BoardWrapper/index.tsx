import type { ReactNode } from "react";

interface BoardWrapperProps {
  children: ReactNode;
}

export default function BoardWrapper({ children }: BoardWrapperProps) {
  return <div className="flex flex-col py-4">{children}</div>;
}
