import { useParams } from "react-router-dom";
import { useGetPinsByUsernameQuery } from "../../../features/pins/pinsApi";
import Loading from "../../MiscAnimatedComponents/Loading";

export default function UserProfilePins(){
    const { username } = useParams<{ username: string }>();
    const { data: pins, isLoading } = useGetPinsByUsernameQuery(username!, {
                skip: !username,
    });
    
    if (isLoading) return <Loading/>

    return(
        <div className="w-full px-8 mt-10">

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
                            {pin.title && (
                                <p className="text-sm font-medium mt-1 px-1">{pin.title}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}