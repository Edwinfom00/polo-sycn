"use client";

import { useState } from "react";
import {
    ShoppingCart,
    CreditCard,
    Truck,
    Package,
    AlertTriangle,
    CheckCircle,
    Clock,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Stats {
    commandes: {
        total: number;
        enAttente: number;
        aValider: number;
        livrees: number;
    };
    paiements: {
        total: number;
        enAttente: number;
        valides: number;
    };
    livraisons: {
        total: number;
        aujourdhui: number;
    };
    stock: {
        total: number;
        faible: number;
    };
}

interface AdminDashboardViewProps {
    userId: string;
    userName: string;
    userRole: string;
    initialStats: Stats | null;
}

export const AdminDashboardView = ({ userId, userName, userRole, initialStats }: AdminDashboardViewProps) => {
    const [stats] = useState<Stats>(initialStats || {
        commandes: { total: 0, enAttente: 0, aValider: 0, livrees: 0 },
        paiements: { total: 0, enAttente: 0, valides: 0 },
        livraisons: { total: 0, aujourdhui: 0 },
        stock: { total: 0, faible: 0 },
    });

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Administration</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {userName}
                    </p>
                </div>
                <Badge className="bg-blue-500">
                    {userRole === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Administrateur'}
                </Badge>
            </div>

            {/* Stats Cards */}
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

            {/* Actions rapides */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow border-2 border-orange-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            Commandes à valider
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {stats.commandes.aValider} commandes en attente de validation
                        </p>
                        <Link href="/admin/commandes">
                            <Button className="w-full">
                                Valider les commandes
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-2 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Paiements à valider
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {stats.paiements.enAttente} paiements en attente
                        </p>
                        <Link href="/admin/paiements">
                            <Button className="w-full">
                                Valider les paiements
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-2 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Truck className="h-5 w-5 text-green-600" />
                            Enregistrer livraison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Enregistrer une nouvelle livraison
                        </p>
                        <Link href="/admin/livraisons">
                            <Button className="w-full">
                                Nouvelle livraison
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Toutes les commandes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Voir l'historique complet des commandes
                        </p>
                        <Link href="/admin/commandes">
                            <Button variant="outline" className="w-full">
                                Voir les commandes
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Gérer le stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Consulter et gérer le stock disponible
                        </p>
                        <Link href="/admin/stock">
                            <Button variant="outline" className="w-full">
                                Voir le stock
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {stats.stock.faible > 0 && (
                    <Card className="hover:shadow-md transition-shadow border-2 border-red-200 bg-red-50/50">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Alertes stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {stats.stock.faible} articles en stock faible
                            </p>
                            <Link href="/admin/stock">
                                <Button variant="destructive" className="w-full">
                                    Voir les alertes
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
