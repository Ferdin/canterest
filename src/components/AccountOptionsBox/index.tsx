export default function AccountOptionsBox() {
    return (
        <div 
            className="absolute
                       right-0
                       top-full
                       mt-2
                       w-72
                       rounded-xl
                       bg-white
                       p-2
                       shadow-lg
                       ring-1
                       ring-black/5
                       z-50
        ">
            <div className="px-3 py-2">
                <p className="text-xs font-medium text-grey-500">
                    Currently in
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                    Ferdin Norbert
                </p>
                <p className="text-sm text-gray-500">
                    Personal
                </p>
                <p className="text-sm text-gray-500">
                    ferdinmultimatic@gmail.com
                </p>
            </div>

            <div className="my-1 h-px bg-gray-200"/>

            <button
                className="
                    w-full rounded-lg px-3 py-2
                    text-left text-sm font-medium
                    hover:bg-gray-100
                    cursor-pointer
                "
            >
                Convert to Business
            </button>

            <div className="my-1 h-px bg-gray-200" />

            <div className="px-3 py-2">
                <p className="text-xs font-medium text-gray-500">
                    Your accounts
                </p>
            </div>

            <button
                className="
                    w-full rounded-lg px-3 py-2
                    text-left text-sm font-medium
                    hover:bg-gray-100
                    cursor-pointer
                " 
            >
                Add Pinterest Account
            </button>

            <button
                className="
                    w-full rounded-lg px-3 py-2
                    text-left text-sm font-medium
                    hover:bg-gray-100
                    cursor-pointer
                "
            >
                Log out
            </button>
        </div>
    )
}