export interface UserGetOne {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'DELEGUE' | 'ETUDIANT';
    classeId?: string | null;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserGetMany {
    users: UserGetOne[];
    total: number;
}

export interface UserStats {
    total: number;
    admins: number;
    delegues: number;
    etudiants: number;
}
