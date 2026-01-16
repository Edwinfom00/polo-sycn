"use client";

import { useEffect, useState } from "react";
import {
    ShoppingCart,
    CreditCard,
    Truck,
    Clock,
    CheckCircle,
    AlertCircle,
    PlusCircle,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EtudiantDashboardViewProps {
    userId: string;
    userName: string;
    classeId: string | null;
}

export const EtudiantDashboardView = ({ userId, userName, classeId }: EtudiantDashboardViewProps) => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Charger les stats de l'étudiant
        const loadData = async () => {
            setIsLoading(true);
            // Simuler le chargement
            setTimeout(() => {
                setStats({
                    commandes: {
                        total: 0,
                        enAttente: 0,
                        payees: 0,
                        livrees: 0,
                    },
                    montantTotal: 0,
                    montantPaye: 0,
                });
                setIsLoading(false);
            }, 500);
        };

        loadData();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Bienvenue, {userName} 👋</h1>
                    <p className="text-muted-foreground">
                        Gérez vos commandes de polos universitaires
                    </p>
                </div>
                <Badge className="bg-purple-500">
                    Étudiant
                </Badge>
            </div>

            {/* Stats Cards */}
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
                            En cours
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
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
                        <CheckCircle className="h-4 w-4 text-green-600" />
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

            {/* Actions rapides */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <PlusCircle className="h-5 w-5 text-primary" />
                            Nouvelle commande
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Commandez vos polos universitaires en quelques clics
                        </p>
                        <Link href="/etudiant/commandes/new">
                            <Button className="w-full">
                                Passer une commande
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Mes commandes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Suivre l'état de vos commandes en temps réel
                        </p>
                        <Link href="/etudiant/commandes">
                            <Button variant="outline" className="w-full">
                                Voir mes commandes
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Mes paiements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Enregistrer et suivre vos paiements
                        </p>
                        <Link href="/etudiant/paiements">
                            <Button variant="outline" className="w-full">
                                Gérer les paiements
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Info Card */}
            {stats.commandes.total === 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                            Commencez dès maintenant
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Vous n'avez pas encore passé de commande. Commencez par commander vos polos universitaires !
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-blue-600 text-white w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                                <p>Choisissez votre polo, taille et couleur</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-blue-600 text-white w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                                <p>Enregistrez votre paiement</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-blue-600 text-white w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                                <p>Attendez la validation et récupérez votre commande</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
