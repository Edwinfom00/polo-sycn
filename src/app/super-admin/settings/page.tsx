import { requireAuth, getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const user = await requireAuth();

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground">
                    Gérez vos préférences et informations de compte
                </p>
            </div>

            <div className="grid gap-6">
                {/* Informations du compte */}
                <div className="rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Nom</label>
                            <p className="text-lg">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-lg">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                            <p className="text-lg capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>

                {/* Section à venir */}
                <div className="rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Préférences</h2>
                    <p className="text-muted-foreground">
                        Les paramètres de préférences seront disponibles prochainement.
                    </p>
                </div>
            </div>
        </div>
    );
}
