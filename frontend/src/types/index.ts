export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Post {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface OgpData {
    id: number;
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
    site_name: string | null;
    created_at: string;
    updated_at: string;
}
