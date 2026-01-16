"use client";

import { useEffect, useState } from "react";
import {
    Users,
    ShoppingCart,
    CreditCard,
    Truck,
    Package,
    AlertTriangle,
    TrendingUp,
    Clock,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentActivities } from "../../actions";

interface MainDashboardViewProps {
    userRole: string;
    userName: string;
}

export const MainDashboardView = ({ userRole, userName }: MainDashboardViewProps) => {
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const isDelegue = userRole === 'DELEGUE';
    const isEtudiant = userRole === 'ETUDIANT';

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [statsResult, activitiesResult] = await Promise.all([
                getDashboardStats(),
                getRecentActivities(),
            ]);

            if (statsResult.success) {
                setStats(statsResult.data);
            }

            if (activitiesResult.success) {
                setActivities(activitiesResult.data);
            }

            setIsLoading(false);
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    const getRoleLabel = () => {
        switch (userRole) {
            case 'ADMIN':
                return 'Administrateur';
            case 'DELEGUE':
                return 'Délégué de classe';
            case 'ETUDIANT':
                return 'Étudiant';
            default:
                return userRole;
        }
    };

    const getRoleColor = () => {
        switch (userRole) {
            case 'ADMIN':
                return 'bg-blue-500';
            case 'DELEGUE':
                return 'bg-green-500';
            case 'ETUDIANT':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tableau de bord</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {userName}
                    </p>
                </div>
                <Badge className={getRoleColor()}>
                    {getRoleLabel()}
                </Badge>
            </div>

            {/* Stats Cards - Admin & Délégué */}
            {(isAdmin || isDelegue) && stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Commandes
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.commandes.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.commandes.enAttente} en attente
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Paiements
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.paiements.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.paiements.enAttente} à valider
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Livraisons
                            </CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.livraisons.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.livraisons.aujourdhui} aujourd'hui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Stock
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stock.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.stock.faible} alertes
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Stats Cards - Étudiant */}
            {isEtudiant && stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Mes commandes
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.commandes.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Total de commandes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                En attente
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.commandes.enAttente + stats.commandes.payees}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                À traiter
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Livrées
                            </CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.commandes.livrees}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Complétées
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Actions rapides */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Admin */}
                {isAdmin && (
                    <>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Commandes en attente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {stats?.commandes.enAttente || 0} commandes à traiter
                                </p>
                                <Link href="/orders">
                                    <Button className="w-full">
                                        Voir les commandes
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Paiements à valider</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {stats?.paiements.enAttente || 0} paiements en attente
                                </p>
                                <Link href="/payments">
                                    <Button className="w-full">
                                        Valider les paiements
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {stats?.stock.faible > 0 && (
                            <Card className="hover:shadow-md transition-shadow border-orange-200">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        Alertes stock
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {stats.stock.faible} articles en stock faible
                                    </p>
                                    <Link href="/admin/products">
                                        <Button variant="outline" className="w-full">
                                            Gérer le stock
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Délégué */}
                {isDelegue && (
                    <>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Ma classe</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Gérer les étudiants de ma classe
                                </p>
                                <Link href="/admin/classes">
                                    <Button className="w-full">
                                        Voir ma classe
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Commandes de la classe</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Suivre les commandes des étudiants
                                </p>
                                <Link href="/orders">
                                    <Button className="w-full">
                                        Voir les commandes
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Étudiant */}
                {isEtudiant && (
                    <>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Passer une commande</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Commander vos polos universitaires
                                </p>
                                <Link href="/orders">
                                    <Button className="w-full">
                                        Nouvelle commande
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Mes commandes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Suivre l'état de vos commandes
                                </p>
                                <Link href="/orders">
                                    <Button variant="outline" className="w-full">
                                        Voir mes commandes
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">Mes paiements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Enregistrer vos paiements
                                </p>
                                <Link href="/payments">
                                    <Button variant="outline" className="w-full">
                                        Gérer les paiements
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Activités récentes - Admin & Délégué */}
            {(isAdmin || isDelegue) && activities && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Dernières commandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activities.commandes.slice(0, 5).map((cmd: any) => (
                                    <div key={cmd.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium">{cmd.numero}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {cmd.etudiant?.name}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{cmd.statut}</Badge>
                                    </div>
                                ))}
                                {activities.commandes.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Aucune commande récente</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Derniers paiements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activities.paiements.slice(0, 5).map((pmt: any) => (
                                    <div key={pmt.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium">{pmt.montant} FCFA</p>
                                            <p className="text-muted-foreground text-xs">
                                                {pmt.etudiant?.name}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{pmt.statut}</Badge>
                                    </div>
                                ))}
                                {activities.paiements.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Aucun paiement récent</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
