export interface Board {
    id: number;
    name: string;
    description: string | null;
    is_secret: boolean;
    owner_id: number;
}

export interface BoardCreate {
    name: string;
    description?: string;
    is_secret?: boolean;
}