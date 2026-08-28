import { useDispatch } from "react-redux";
import SiteIcon from "../../Icons/SiteIcon";
import { useState } from "react";
import { useGoogleLoginMutation, useLoginMutation, useRegisterMutation } from "../../../features/auth/authApi";
import { GoogleLogin } from "@react-oauth/google";
import { setCredentials } from "../../../features/auth/authSlice";

export default function InitialLoginBox(){
    const dispatch = useDispatch();
    const [mode, setMode] = useState<"login" | "register">("login");

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");

    const [login, { isLoading: loginLoading }] = useLoginMutation();
    const [register, { isLoading: registerLoading }] = useRegisterMutation();
    const [googleLogin] = useGoogleLoginMutation();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isLoading = loginLoading || registerLoading;

    const extractErrorMessage = (err: any): string => {
        const detail = err?.data?.detail;
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
        return "Something went wrong. Please try again."
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);

        try {
            const result = 
                mode === "login"
                    ? await login({ email, password }).unwrap()
                    : await register({ email, password, name}).unwrap();
            dispatch(setCredentials({ token: result.access_token }));        
        } catch (err: any) {
            setErrorMsg(extractErrorMessage(err));
        }
    }

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) return;
            setErrorMsg(null);

        try {
            const result = await googleLogin({
                credential: credentialResponse.credential
            }).unwrap();
            dispatch(setCredentials({ token: result.access_token }));
        } catch (err: any) {
            setErrorMsg(extractErrorMessage(err));
        }    
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-3xl bg-white rounded-lg shadow-xl flex">
                <div className="flex flex-col">
                    <SiteIcon className="pl-10"/>
                    <form onSubmit={handleSubmit} className="flex flex-col px-10 gap-3">
                        <h2 className="text-2xl font-bold">
                            {mode === "login" ? "Welcome to Canterest!" : "Join Canterest"}
                        </h2>

                        {mode === "register" && (
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-gray-400 border rounded-sm px-2 py-3"
                                required
                            />
                        )}
                        <input 
                            type="email" 
                            id="can_email" 
                            placeholder="Email" 
                            className="border-gray-400 border rounded-sm px-2 py-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required    
                        />
                        <input 
                            type="password" 
                            id="can_password" 
                            placeholder="Password" 
                            className="border-gray-400 border rounded-sm px-2 py-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {mode === "login" && (
                            <span className="text-sm font-bold text-blue-500 cursor-pointer">
                                Forgot Password?
                            </span>
                        )}
                        {errorMsg && (
                            <span className="text-sm text-red-600">{errorMsg}</span>
                        )}
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="bg-red-600 text-white py-3 rounded-sm cursor-pointer disabled:opacity-60"
                        >
                            {isLoading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
                        </button>
                        <div className="flex items-center justify-center">or</div>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setErrorMsg("Google sign-in failed. Please try again.")}
                            width="100%" 
                            containerProps={{
                                className: "w-full"
                            }}
                        />
                        <div className="flex flex-row gap-2 pb-8">
                            <span>
                                {mode === "login" ? "New to Canterest" : "Already have an account?"}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === "login" ? "register" : "login");
                                    setErrorMsg(null);
                                }} 
                                className="underline cursor-pointer"
                            >
                                {mode === "login" ? "Join for free" : "Log in"}
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
                    </form>
                </div>
                <div className="bg-gray-300 flex-1"></div>
            </div>
        </div>
    )
}