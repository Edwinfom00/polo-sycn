"use client";

import { useEffect, useState } from "react";
import {
    Users,
    ShoppingCart,
    CreditCard,
    Truck,
    GraduationCap,
    TrendingUp,
    Clock,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DelegueDashboardViewProps {
    userId: string;
    userName: string;
    classeId: string | null;
}

export const DelegueDashboardView = ({ userId, userName, classeId }: DelegueDashboardViewProps) => {
    const [stats, setStats] = useState<any>(null);
    const [classeInfo, setClasseInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Charger les stats du délégué et infos de la classe
        const loadData = async () => {
            setIsLoading(true);
            // Simuler le chargement
            setTimeout(() => {
                setClasseInfo({
                    nom: "L3 Informatique",
                    filiere: "Informatique",
                    niveau: "L3",
                });
                setStats({
                    etudiants: {
                        total: 0,
                        actifs: 0,
                    },
                    commandes: {
                        total: 0,
                        enAttente: 0,
                        payees: 0,
                        livrees: 0,
                    },
                    mesCommandes: {
                        total: 0,
                        enAttente: 0,
                    },
                    tauxPaiement: 0,
                });
                setIsLoading(false);
            }, 500);
        };

        loadData();
    }, [userId, classeId]);

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
                    <h1 className="text-3xl font-bold">Espace Délégué</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {userName} - {classeInfo?.nom || 'Aucune classe'}
                    </p>
                </div>
                <Badge className="bg-green-500">
                    Délégué de classe
                </Badge>
            </div>

            {/* Info Classe */}
            {classeInfo && (
                <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            Ma Classe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Classe</p>
                                <p className="text-lg font-semibold">{classeInfo.nom}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Filière</p>
                                <p className="text-lg font-semibold">{classeInfo.filiere}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Niveau</p>
                                <p className="text-lg font-semibold">{classeInfo.niveau}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards - Classe */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Étudiants
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.etudiants.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Dans ma classe
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Commandes classe
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
                            Taux de paiement
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tauxPaiement}%</div>
                        <p className="text-xs text-muted-foreground">
                            De la classe
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mes commandes
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.mesCommandes.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Personnelles
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions rapides */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow border-2 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            Étudiants de ma classe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Voir la liste des étudiants de ma classe
                        </p>
                        <Link href="/delegue/etudiants">
                            <Button className="w-full">
                                Voir les étudiants
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-2 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                            Commandes de la classe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Suivre les commandes des étudiants
                        </p>
                        <Link href="/delegue/commandes">
                            <Button className="w-full">
                                Voir les commandes
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-2 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-purple-600" />
                            Passer une commande
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Commander mes propres polos
                        </p>
                        <Link href="/delegue/commandes/new">
                            <Button className="w-full">
                                Nouvelle commande
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
                            Gérer mes paiements personnels
                        </p>
                        <Link href="/delegue/paiements">
                            <Button variant="outline" className="w-full">
                                Voir mes paiements
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Mes livraisons
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Suivre mes livraisons personnelles
                        </p>
                        <Link href="/delegue/livraisons">
                            <Button variant="outline" className="w-full">
                                Voir mes livraisons
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Infos classe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Détails et statistiques de ma classe
                        </p>
                        <Link href="/delegue/ma-classe">
                            <Button variant="outline" className="w-full">
                                Voir ma classe
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
