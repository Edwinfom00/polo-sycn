"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart,
    PlusCircle,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Truck,
    Package
} from "lucide-react";
import type { CommandeGetOne } from "@/modules/commandes/types";
import { NouvelleCommandeModal } from "../components/nouvelle-commande-modal";

interface EtudiantCommandesViewProps {
    commandes: CommandeGetOne[];
    produits: any[];
    tailles: any[];
    couleurs: any[];
}

const getStatusBadge = (statut: string) => {
    switch (statut) {
        case 'EN_ATTENTE':
            return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
        case 'PAYE':
            return <Badge className="gap-1 bg-blue-500"><CreditCard className="h-3 w-3" />Payé</Badge>;
        case 'VALIDE':
            return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Validé</Badge>;
        case 'LIVRE':
            return <Badge className="gap-1 bg-purple-500"><Truck className="h-3 w-3" />Livré</Badge>;
        case 'ANNULE':
            return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Annulé</Badge>;
        default:
            return <Badge variant="outline">{statut}</Badge>;
    }
};

export const EtudiantCommandesView = ({
    commandes: initialCommandes,
    produits,
    tailles,
    couleurs
}: EtudiantCommandesViewProps) => {
    const [filter, setFilter] = useState<string>('all');
    const [modalOpen, setModalOpen] = useState(false);

    const filteredCommandes = initialCommandes.filter(cmd => {
        if (filter === 'all') return true;
        return cmd.statut === filter;
    });

    const stats = {
        total: initialCommandes.length,
        enAttente: initialCommandes.filter(c => c.statut === 'EN_ATTENTE').length,
        paye: initialCommandes.filter(c => c.statut === 'PAYE').length,
        valide: initialCommandes.filter(c => c.statut === 'VALIDE').length,
        livre: initialCommandes.filter(c => c.statut === 'LIVRE').length,
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mes Commandes</h1>
                    <p className="text-muted-foreground">
                        Gérez et suivez vos commandes de polos
                    </p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle commande
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('EN_ATTENTE')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('PAYE')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payé</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.paye}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('VALIDE')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Validé</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.valide}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('LIVRE')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Livré</CardTitle>
                        <Truck className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.livre}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des commandes */}
            <div className="space-y-4">
                {filteredCommandes.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">Aucune commande</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {filter === 'all'
                                    ? "Vous n'avez pas encore passé de commande"
                                    : `Aucune commande avec le statut "${filter}"`
                                }
                            </p>
                            {filter === 'all' && (
                                <Button onClick={() => setModalOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Passer ma première commande
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredCommandes.map((commande) => (
                        <Card key={commande.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{commande.numero}</h3>
                                            {getStatusBadge(commande.statut)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <p>Passée le {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                            <p className="mt-1">{commande.lignes.length} article(s)</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Montant total</p>
                                                <p className="text-lg font-bold">{parseFloat(commande.montantTotal).toLocaleString('fr-FR')} FCFA</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Montant payé</p>
                                                <p className="text-lg font-semibold text-green-600">
                                                    {parseFloat(commande.montantPaye).toLocaleString('fr-FR')} FCFA
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/etudiant/commandes/${commande.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Détails
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal Nouvelle Commande */}
            <NouvelleCommandeModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                produits={produits}
                tailles={tailles}
                couleurs={couleurs}
            />
        </div>
    );
};
