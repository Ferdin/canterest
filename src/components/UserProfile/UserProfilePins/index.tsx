import { useParams } from "react-router-dom";
import { useGetPinsByUsernameQuery } from "../../../features/pins/pinsApi";
import Loading from "../../MiscAnimatedComponents/Loading";
import { Settings2 } from "lucide-react";

export default function UserProfilePins(){
    const { username } = useParams<{ username: string }>();
    const { data: pins, isLoading } = useGetPinsByUsernameQuery(username!, {
                skip: !username,
    });
    
    if (isLoading) return <Loading/>

    return(
        <div className="w-full px-8 mt-10">

            <div className="flex flex-row mb-6 gap-4 items-center">
                <Settings2 className="cursor-pointer"/>
                <button className="bg-olive-300 rounded-lg p-2 cursor-pointer hover:bg-olive-400">Favorites</button>
                <button className="bg-olive-300 rounded-lg p-2 cursor-pointer hover:bg-olive-400">Created by you</button>
            </div>
            {pins?.length === 0 && (
                <p className="text-center text-gray-500">No pins yet.</p>
            )}

            {pins && pins.length > 0 && (
                <div className="columns-2 sm:columns-3 md:columns-6 gap-4 [column-fill:balance]">
                    {pins.map((pin) =>(
                        <div key={pin.id} className="mb-4 break-inside-avoid">
                            <img
                                src={pin.media_url}
                                alt={pin.alt_text || pin.title || "Pin"}
                                className="w-full rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}