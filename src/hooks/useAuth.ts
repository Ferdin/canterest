import { useState, useEffect } from "react";
import api from "../api/api";

interface User {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
}

export function useAuth() {
    const [user, setUser] = useState<User | null> (null);
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState(true); // true while we're checking

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            // First-time / logged-out visitor - nothing to check, skip the API call
            if (!token) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            // Token exists - verify it's still valid
            try {
                const { data } = await api.get("/auth/me");
                if (data.authorized) {
                    setAuthorized(true);
                    setUser(data.user);
                } else {
                    localStorage.removeItem("token"); // stale/expired - clean up
                    setAuthorized(false);
                }
            } catch {
                localStorage.removeItem("token");
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return { user, authorized, loading };
}