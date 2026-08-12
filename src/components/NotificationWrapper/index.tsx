import type { ReactNode } from "react";

interface NotificationWrapperProps {
  children: ReactNode;
}

export default function NotificationWrapper({
  children,
}: NotificationWrapperProps) {
  return <div className="flex flex-col py-4">{children}</div>;
}
