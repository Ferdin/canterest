import { Pin } from "lucide-react";
import CreationWrapper from "../Wrappers/CreationWrapper";
import CreationIconWrapper from "../Wrappers/CreationIconWrapper";
import CreationColWrapper from "../Wrappers/CreationColWrapper";
import { Link } from "react-router-dom";

export default function PinCreation() {
  return (
    <CreationWrapper>
      <Link to="/pin-creation-tool" className="flex items-center w-full gap-4">
        <CreationIconWrapper>
          <Pin className="w-16 h-16 px-4" />
        </CreationIconWrapper>
        <CreationColWrapper>
          <h4 className="text-lg font-normal">Pin</h4>
          <p className="text-sm text-gray-500">
            Post your photos or videos and add links, sticker, effects and more
          </p>
        </CreationColWrapper>
      </Link>
    </CreationWrapper>
  );
}
