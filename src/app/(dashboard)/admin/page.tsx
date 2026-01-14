import { requireRole } from "@/lib/auth-utils";
import { USER_ROLES } from "@/lib/constants/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, UsersIcon } from "lucide-react";

export default async function AdminPage() {
    const user = await requireRole(USER_ROLES.ADMIN);

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Administration</h1>
                    <p className="text-muted-foreground">
                        Gestion des utilisateurs et des paramètres système
                    </p>
                </div>
                <Badge variant="outline" className="gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    {user.role}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Utilisateurs
                        </CardTitle>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Aucun utilisateur pour le moment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Commandes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            En attente de Phase 2
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            En attente de Phase 2
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bienvenue, {user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="font-medium">Email :</span> {user.email}
                        </p>
                        <p>
                            <span className="font-medium">Rôle :</span> {user.role}
                        </p>
                        <p className="text-muted-foreground">
                            Cette page est accessible uniquement aux administrateurs et super administrateurs.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
