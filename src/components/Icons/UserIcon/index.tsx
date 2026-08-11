import { User } from "lucide-react";

export default function UserIcon() {
  return (
    <div className="flex items-center justify-center p-2 rounded-full bg-olive-100 hover:ring-4 hover:ring-olive-300">
      <User className="h-6 w-6 text-olive-700" />
    </div>
  );
}
