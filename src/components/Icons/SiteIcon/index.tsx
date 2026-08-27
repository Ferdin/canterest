import { GraduationCap } from "lucide-react";

interface SiteIconProps {
  className ?: string;
}

export default function SiteIcon({className = ""} : SiteIconProps ) {
  return (
    <div className={`flex h-20 w-20 place-content-center items-center cursor-pointer ${className}`}>
      <GraduationCap className="h-10 w-10" />
    </div>
  );
}
