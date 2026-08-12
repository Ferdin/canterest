import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setActiveMenu } from "../../features/ui/uiSlice";

export default function ExpandBoard() {
  const dispatch = useDispatch();
  return (
    <div className="min-h-screen sticky top-0 bg-white">
      <div className="flex justify-between items-center px-6 py-6 w-full">
        <h2>Title</h2>
        <X
          className="cursor-pointer"
          onClick={() => dispatch(setActiveMenu(null))}
        />
      </div>
    </div>
  );
}
