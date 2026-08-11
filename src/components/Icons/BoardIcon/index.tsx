import { WalletCards } from "lucide-react";
import IconsWrapper from "../IconsWrapper";

export default function BoardIcon() {
  return (
    <IconsWrapper>
      <WalletCards className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer" />
    </IconsWrapper>
  );
}
