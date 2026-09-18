// components/UserProfile/UserProfileBoards.tsx
import { useParams } from "react-router-dom";
import { useGetBoardsByUsernameQuery } from "../../../features/boards/boardsApi";
import Loading from "../../MiscAnimatedComponents/Loading";


export default function UserProfileBoards() {
    const { username } = useParams<{ username: string }>();
    const { data: boards, isLoading } = useGetBoardsByUsernameQuery(username!, { skip: !username });

    if (isLoading) return <Loading />;

    return (
        <div className="w-full px-8 mt-10">
            {boards?.length === 0 && <p className="text-center text-gray-500">No boards yet.</p>}

            {boards && boards.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                    {boards.map((board) => (
                        <div key={board.id} className="rounded-2xl bg-gray-100 p-4">
                            <h3 className="font-semibold">{board.name}</h3>
                            {board.description && (
                                <p className="text-sm text-gray-500">{board.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}