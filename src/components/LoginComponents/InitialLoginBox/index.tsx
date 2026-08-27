import GoogleIcon from "../../Icons/GoogleIcon";
import SiteIcon from "../../Icons/SiteIcon";

export default function InitialLoginBox(){
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-3xl bg-white rounded-lg shadow-xl flex">
                <div className="flex flex-col">
                    <SiteIcon className="pl-10"/>
                    <div className="flex flex-col px-10 gap-3">
                        <h2 className="text-2xl font-bold">Welcome to Canterest!</h2>
                        <input type="email" id="can_email" placeholder="Email" className="border-gray-400 border rounded-sm px-2 py-3"/>
                        <input type="password" id="can_password" placeholder="Password" className="border-gray-400 border rounded-sm px-2 py-3"/>
                        <span className="text-sm font-bold text-blue-500 cursor-pointer">Forgot Password?</span>
                        <button className="bg-red-600 text-white py-3 rounded-sm cursor-pointer">Log in</button>
                        <div className="flex items-center justify-center">or</div>
                        <button className=" border py-3 rounded-sm cursor-pointer flex flex-row gap-2 pl-10">
                            <GoogleIcon className=""/>
                            Continue with Google
                        </button>
                        <div className="flex flex-row gap-2 pb-8">
                            <span>
                                New to Canterest?
                            </span>
                            <button className="underline cursor-pointer">
                                Join for free
                            </button>
                        </div>
                        <div className="flex flex-row gap-2 pb-8 text-sm">
                            <button>
                                Terms of Service
                            </button> · 
                            <button>
                                Privacy Policy 
                            </button> · 
                            <button>
                                Notice at Collection
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-300 flex-1"></div>
            </div>
        </div>
    )
}