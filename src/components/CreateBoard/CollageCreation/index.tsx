import { SquareLibrary } from "lucide-react";
import CreationIconWrapper from "../Wrappers/CreationIconWrapper";
import CreationWrapper from "../Wrappers/CreationWrapper";
import CreationColWrapper from "../Wrappers/CreationColWrapper";

export default function CollageCreation() {
  return (
    <CreationWrapper>
      <CreationIconWrapper>
        <SquareLibrary className="w-16 h-16 px-4" />
      </CreationIconWrapper>
      <CreationColWrapper>
        <h4 className="text-lg font-normal">Collage</h4>
        <p className="text-sm text-gray-500">
          Mix and match to build your own vision and create something new
        </p>
      </CreationColWrapper>
    </CreationWrapper>
  );
}
