import { MessageCirclePlus, UserPlus } from "lucide-react";

export default function MessageBoard() {
  return (
    <div className="flex flex-col py-4 ">
      <div className="flex px-4 mb-2 gap-2 py-3 mx-2 rounded-md hover:bg-olive-50 cursor-pointer items-center">
        <MessageCirclePlus fill="red" color="white" className="w-12 h-12" />
        <div className="font-medium">New Message</div>
      </div>
      <div className="flex px-4 mb-2 gap-2 py-3 mx-2 rounded-md hover:bg-olive-50 cursor-pointer items-center">
        <UserPlus className="w-12 h-12" />
        <div className="flex flex-col">
          <div className="font-medium">Invite Friends</div>
          <div>Connect friends to start chatting</div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-16 gap-4 px-4">
        <div className="text-xl font-bold">Start a conversation</div>
        <p className="text-center">
          Use messages to chat with friends, share Pins and boards, and plan
          ideas together. Your conversations will appear here.
        </p>
      </div>
    </div>
  );
}
