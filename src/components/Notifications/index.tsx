export default function Notifications() {
  return (
    <div className="flex flex-col py-4 ">
      <div className="px-6 mb-2 font-medium text-gray-600">Updates</div>
      <div className="flex hover:bg-olive-100 rounded-md cursor-pointer px-4 py-4 mx-2 gap-4">
        <img
          src="https://images.unsplash.com/photo-1786628211715-8a4ae8777c9d?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="h-20 w-14 object-cover rounded-lg"
        />
        <div className="font-medium flex items-center">Summer Vacation</div>
      </div>
      <div className="flex hover:bg-olive-100 rounded-md cursor-pointer px-4 py-4 mx-2 gap-4">
        <img
          src="https://images.unsplash.com/photo-1786603735052-fb4223ee82ed?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="h-20 w-14 object-cover rounded-lg"
        />
        <div className="font-medium flex items-center">Summer Vacation</div>
      </div>
    </div>
  );
}
