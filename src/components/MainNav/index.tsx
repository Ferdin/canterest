import ChevronDownIcon from "../Icons/ChevronDownIcon";
import MainNavWrapper from "../MainNavWrapper";
import UserIcon from "../Icons/UserIcon";

export default function MainNav() {
  return (
    <MainNavWrapper>
      <div className="w-11/12">
        <input
          type="text"
          name="search"
          id="pin-search"
          placeholder="Search"
          className=" w-full bg-olive-300 hover:bg-olive-400 rounded-md h-10 focus:outline-none focus:ring-4 focus:ring-blue-300 px-2.5"
        />
      </div>
      <div className="flex px-4 flex-1 gap-5 items-center">
        <UserIcon />
        <ChevronDownIcon />
      </div>
    </MainNavWrapper>
  );
}
