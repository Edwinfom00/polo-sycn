"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShoppingCart,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Truck,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import type { CommandeGetOne } from "@/modules/commandes/types";

interface AdminCommandesViewProps {
    commandes: CommandeGetOne[];
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

export const AdminCommandesView = ({ commandes: initialCommandes }: AdminCommandesViewProps) => {
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const filteredCommandes = initialCommandes.filter(cmd => {
        const matchFilter = filter === 'all' || cmd.statut === filter;
        const matchSearch = search === "" ||
            cmd.numero.toLowerCase().includes(search.toLowerCase()) ||
            cmd.etudiant.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCommandes = filteredCommandes.slice(startIndex, endIndex);

    const stats = {
        total: initialCommandes.length,
        enAttente: initialCommandes.filter(c => c.statut === 'EN_ATTENTE').length,
        paye: initialCommandes.filter(c => c.statut === 'PAYE').length,
        valide: initialCommandes.filter(c => c.statut === 'VALIDE').length,
        livre: initialCommandes.filter(c => c.statut === 'LIVRE').length,
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
                <p className="text-muted-foreground">Validez et gérez les commandes</p>
            </div>

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

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par numéro ou étudiant..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {filter !== 'all' && (
                    <Button variant="outline" onClick={() => setFilter('all')}>
                        <Filter className="h-4 w-4 mr-2" />
                        Réinitialiser
                    </Button>
                )}
            </div>

            {currentCommandes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucune commande</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentCommandes.map((commande) => (
                            <Card key={commande.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{commande.numero}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{commande.etudiant.name}</p>
                                        </div>
                                        {getStatusBadge(commande.statut)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Classe:</span>
                                            <span className="font-medium">{commande.classe.nom}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Articles:</span>
                                            <span className="font-medium">{commande.lignes.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-bold">{parseFloat(commande.montantTotal).toLocaleString('fr-FR')} FCFA</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Payé:</span>
                                            <span className="font-semibold text-green-600">
                                                {parseFloat(commande.montantPaye).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Link href={`/admin/commandes/${commande.id}`} className="w-full">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir détails
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8"
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
