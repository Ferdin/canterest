import HomeIcon from "../Icons/HomeIcon";
import BellIcon from "../Icons/BellIcon";
import BoardIcon from "../Icons/BoardIcon";
import CompassIcon from "../Icons/CompassIcon";
import MessageCircleIcon from "../Icons/MessageCircleIcon";
import SiteIcon from "../Icons/SiteIcon";
import SquarePlusIcon from "../Icons/SquarePlusIcon";
import GearIcon from "../Icons/GearIcon";

export default function SideNav() {
  return (
    <div className="min-h-screen sticky top-0 bg-white flex flex-col items-center border-r border-olive-300">
      <SiteIcon />
      <HomeIcon />
      <CompassIcon />
      <BoardIcon />
      <SquarePlusIcon />
      <BellIcon />
      <MessageCircleIcon />
      <div className="mt-auto">
        <GearIcon />
      </div>
    </div>
  );
}
