"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Mail,
    GraduationCap,
    Calendar,
    ShoppingCart,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Package,
} from "lucide-react";

interface Etudiant {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    classe: {
        nom: string;
        code: string;
        niveau: string;
    } | null;
    filiere: {
        nom: string;
        code: string;
    } | null;
}

interface Commande {
    id: string;
    numero: string;
    statut: string;
    montantTotal: string;
    montantPaye: string;
    createdAt: Date;
}

interface AdminEtudiantDetailViewProps {
    etudiant: Etudiant;
    commandes: Commande[];
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

export const AdminEtudiantDetailView = ({ etudiant, commandes }: AdminEtudiantDetailViewProps) => {
    const pathname = usePathname();
    const isSuperAdmin = pathname.startsWith('/super-admin');
    const baseUrl = isSuperAdmin ? '/super-admin' : '/admin';

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const stats = {
        totalCommandes: commandes.length,
        enAttente: commandes.filter(c => c.statut === 'EN_ATTENTE').length,
        payees: commandes.filter(c => c.statut === 'PAYE').length,
        validees: commandes.filter(c => c.statut === 'VALIDE').length,
        livrees: commandes.filter(c => c.statut === 'LIVRE').length,
        annulees: commandes.filter(c => c.statut === 'ANNULE').length,
        montantTotal: commandes.reduce((acc, c) => acc + parseFloat(c.montantTotal), 0),
        montantPaye: commandes.reduce((acc, c) => acc + parseFloat(c.montantPaye), 0),
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`${baseUrl}/etudiants`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Profil Étudiant</h1>
                    <p className="text-muted-foreground">Informations et commandes</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Informations personnelles */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {getInitials(etudiant.name)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold text-center">{etudiant.name}</h2>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium break-all">{etudiant.email}</p>
                                </div>
                            </div>

                            {etudiant.classe && (
                                <div className="flex items-start gap-3">
                                    <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">Classe</p>
                                        <p className="font-medium">{etudiant.classe.nom}</p>
                                        <p className="text-sm text-muted-foreground">{etudiant.classe.code}</p>
                                    </div>
                                </div>
                            )}

                            {etudiant.filiere && (
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">Filière</p>
                                        <p className="font-medium">{etudiant.filiere.nom}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Inscrit le</p>
                                    <p className="font-medium">
                                        {new Date(etudiant.createdAt).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques et commandes */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalCommandes}</div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {stats.enAttente > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {stats.enAttente} en attente
                                        </Badge>
                                    )}
                                    {stats.payees > 0 && (
                                        <Badge className="text-xs bg-blue-500">
                                            {stats.payees} payées
                                        </Badge>
                                    )}
                                    {stats.livrees > 0 && (
                                        <Badge className="text-xs bg-purple-500">
                                            {stats.livrees} livrées
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Montants</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.montantPaye.toLocaleString('fr-FR')} FCFA
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    sur {stats.montantTotal.toLocaleString('fr-FR')} FCFA
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Liste des commandes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commandes ({commandes.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {commandes.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Aucune commande</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {commandes.map((commande) => (
                                        <div
                                            key={commande.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-medium">{commande.numero}</p>
                                                    {getStatusBadge(commande.statut)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>
                                                        {new Date(commande.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-medium">
                                                        {parseFloat(commande.montantTotal).toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-green-600 font-medium">
                                                        {parseFloat(commande.montantPaye).toLocaleString('fr-FR')} FCFA payé
                                                    </span>
                                                </div>
                                            </div>
                                            <Link href={`${baseUrl}/commandes/${commande.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Voir
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
