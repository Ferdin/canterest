import { useParams } from "react-router-dom";
import { useGetUserByUsernameQuery } from "../../features/users/userApi";
import Loading from "../MiscAnimatedComponents/Loading";

export default function UserProfile() {
    const { username } = useParams<{ username: string}>();
    const { data: user, isLoading, isError } = useGetUserByUsernameQuery(username!);

    if (isLoading) return <Loading/>
    if (isError || !user) return <div>User not found.</div>

    return (
        <div className="flex flex-col items-center pt-10">
            {user.avatar_url && (
                <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full"/>
            )}
            <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
            <p className="text-gray-500">@{user.username}</p>
        </div>
    )
}