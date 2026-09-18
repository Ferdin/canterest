import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { useGetUserByUsernameQuery } from "../../features/users/userApi";
import Loading from "../MiscAnimatedComponents/Loading";

export default function UserProfile() {
    const { username } = useParams<{ username: string }>();
    const { data: user, isLoading, isError } = useGetUserByUsernameQuery(username!);
    const location = useLocation();

    if (isLoading) return <Loading />;
    if (isError || !user) return <div>User not found.</div>;

    const tabs = [
        { label: "Pins", path: `/${username}` },
        { label: "Boards", path: `/${username}/boards` },
        { label: "Collages", path: `/${username}/collages` },
    ];

    return (
        <div className="flex flex-col items-center pt-10">
            {user.avatar_url && (
                <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full" />
            )}
            <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
            <p className="text-gray-500">@{user.username}</p>

            <div className="flex flex-row gap-4 font-medium mt-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={`cursor-pointer pb-1 border-b-2 ${
                                isActive ? "border-black text-black" : "border-transparent text-gray-500"
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <Outlet />
        </div>
    );
}