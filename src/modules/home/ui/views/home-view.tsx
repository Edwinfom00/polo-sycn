"use client";

interface HomeViewProps {
    user: {
        id: string;
        name: string;
        email: string;
        role?: string;
    };
}

export const HomeView = ({ user }: HomeViewProps) => {
    return (
        <div className="p-4 flex flex-col gap-y-4">
            <h1 className="text-2xl font-bold">Bienvenue, {user.name}</h1>
            <p className="text-muted-foreground">
                Vous êtes connecté en tant que {user.role || 'ETUDIANT'}
            </p>
        </div>
    )
}

