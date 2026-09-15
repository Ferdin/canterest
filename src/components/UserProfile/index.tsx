import { useParams } from "react-router-dom";
import { useGetUserByUsernameQuery } from "../../features/users/userApi";
import Loading from "../MiscAnimatedComponents/Loading";
import { useGetPinsByUsernameQuery } from "../../features/pins/pinsApi";

export default function UserProfile() {
    const { username } = useParams<{ username: string}>();
    const { data: user, isLoading, isError } = useGetUserByUsernameQuery(username!);
    const { data: pins, isLoading: pinsLoading } = useGetPinsByUsernameQuery(username!, {
        skip: !username,
    });

    if (isLoading) return <Loading/>
    if (isError || !user) return <div>User not found.</div>

    return (
        <div className="flex flex-col items-center pt-10">
            {user.avatar_url && (
                <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full"/>
            )}
            <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
            <p className="text-gray-500">@{user.username}</p>

            <div className="w-full px-8 mt-10">
                {pinsLoading && <Loading/>}

                {!pinsLoading && pins?.length === 0 && (
                    <p className="text-center text-gray-500">No pins yet.</p>
                )}

                {pins && pins.length > 0 && (
                    <div className="columns-2 sm:columns-3 md:columns-4 gap-4 [column-fill:balance]">
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
        </div>
    )
}