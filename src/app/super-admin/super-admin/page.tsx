import { requireRole } from "@/lib/auth-utils";
import { USER_ROLES } from "@/lib/constants/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrownIcon, DatabaseIcon, SettingsIcon } from "lucide-react";

export default async function SuperAdminPage() {
    const user = await requireRole(USER_ROLES.SUPER_ADMIN);

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Super Administration</h1>
                    <p className="text-muted-foreground">
                        Contrôle total du système PoloSync
                    </p>
                </div>
                <Badge variant="default" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                    <CrownIcon className="h-4 w-4" />
                    {user.role}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-yellow-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Administrateurs
                        </CardTitle>
                        <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">
                            Vous êtes le seul pour le moment
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Base de données
                        </CardTitle>
                        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">✓</div>
                        <p className="text-xs text-muted-foreground">
                            Connectée et opérationnelle
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Système
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Phase 1</div>
                        <p className="text-xs text-muted-foreground">
                            Auth & Rôles opérationnels
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-yellow-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CrownIcon className="h-5 w-5 text-yellow-500" />
                        Privilèges Super Administrateur
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="font-medium">Accès complet</p>
                            <p className="text-sm text-muted-foreground">
                                Vous avez accès à toutes les fonctionnalités du système
                            </p>
                        </div>
                        <div>
                            <p className="font-medium">Gestion des administrateurs</p>
                            <p className="text-sm text-muted-foreground">
                                Créer, modifier et supprimer des comptes administrateurs (Phase 2)
                            </p>
                        </div>
                        <div>
                            <p className="font-medium">Configuration système</p>
                            <p className="text-sm text-muted-foreground">
                                Paramètres globaux, seuils de stock, alertes (Phase 2)
                            </p>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm">
                                <span className="font-medium">Connecté en tant que :</span> {user.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
