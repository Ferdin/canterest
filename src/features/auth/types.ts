export interface User {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleLoginRequest {
    credential: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface MeResponse {
    authorized: boolean;
    user: User | null;
}