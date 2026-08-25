import { ChevronDown } from "lucide-react";
// import Tooltip from "../../ToolTip";
import { useState, useRef, useEffect } from "react";
import AccountOptionsBox from "../../AccountOptionsBox";

export default function ChevronDownIcon() {

  const [toggle, setToggle] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return() => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  return (
    // <Tooltip content="Accounts" position="bottom">
    //   <div className="items-center justify-center hover:bg-olive-300 hover:rounded-md cursor-pointer">
    //     <ChevronDown onClick={handleToggle}/>
    //   </div>
    //   {toggle && <AccountOptionsBox/>}
    // </Tooltip>
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-olive-300 cursor-pointer"
        aria-label="Account options"
        aria-expanded={toggle}
      >
        <ChevronDown/>
      </button>
      {toggle && <AccountOptionsBox/>}
    </div>
  );
}
