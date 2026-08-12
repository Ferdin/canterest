import { Pin } from "lucide-react";

export default function PinCreation() {
  return (
    <>
      <div className="flex items-center px-6 gap-6">
        <div className="flex items-center justify-center bg-olive-300 rounded-2xl">
          <Pin className="w-16 h-16 px-4" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-lg font-medium">Pin</h4>
          <p className="text-sm">
            Post your photos or videos and add links, sticker, effects and more
          </p>
        </div>
      </div>
    </>
  );
}
