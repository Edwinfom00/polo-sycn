"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { validerPaiement, rejeterPaiement } from "@/modules/paiements/actions";
import { toast } from "sonner";

interface Paiement {
    id: string;
    montant: string;
    statut: string;
    methodePaiement: string | null;
    reference: string | null;
    notes: string | null;
    createdAt: Date;
    commande: {
        numero: string;
        etudiant: {
            name: string;
        };
    };
}

interface AdminPaiementsViewProps {
    paiements: Paiement[];
}

const getStatusBadge = (statut: string) => {
    switch (statut) {
        case 'EN_ATTENTE':
            return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
        case 'PAYE':
            return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Validé</Badge>;
        case 'REMBOURSE':
            return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeté</Badge>;
        default:
            return <Badge variant="outline">{statut}</Badge>;
    }
};

export const AdminPaiementsView = ({ paiements: initialPaiements }: AdminPaiementsViewProps) => {
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null);
    const [action, setAction] = useState<'valider' | 'rejeter' | null>(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 9;

    const filteredPaiements = initialPaiements.filter(p => {
        const matchFilter = filter === 'all' || p.statut === filter;
        const matchSearch = search === "" ||
            p.commande.numero.toLowerCase().includes(search.toLowerCase()) ||
            p.commande.etudiant.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPaiements = filteredPaiements.slice(startIndex, endIndex);

    const stats = {
        total: initialPaiements.length,
        enAttente: initialPaiements.filter(p => p.statut === 'EN_ATTENTE').length,
        valides: initialPaiements.filter(p => p.statut === 'PAYE').length,
        rejetes: initialPaiements.filter(p => p.statut === 'REMBOURSE').length,
    };

    const handleAction = async () => {
        if (!selectedPaiement || !action) return;

        setLoading(true);
        try {
            if (action === 'valider') {
                const result = await validerPaiement({ id: selectedPaiement.id, notes });
                if (result.success) {
                    toast.success(result.message);
                    window.location.reload();
                } else {
                    toast.error(result.message);
                }
            } else {
                const result = await rejeterPaiement({ id: selectedPaiement.id, notes });
                if (result.success) {
                    toast.success(result.message);
                    window.location.reload();
                } else {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
            setSelectedPaiement(null);
            setAction(null);
            setNotes("");
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
                <p className="text-muted-foreground">Validez les paiements des étudiants</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
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
                        <CardTitle className="text-sm font-medium">Validés</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.valides}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('REMBOURSE')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejetes}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par commande ou étudiant..."
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

            {currentPaiements.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucun paiement</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentPaiements.map((paiement) => (
                            <Card key={paiement.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{paiement.commande.numero}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{paiement.commande.etudiant.name}</p>
                                        </div>
                                        {getStatusBadge(paiement.statut)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Montant:</span>
                                            <span className="font-bold text-green-600">
                                                {parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                        {paiement.methodePaiement && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Méthode:</span>
                                                <span className="font-medium">{paiement.methodePaiement}</span>
                                            </div>
                                        )}
                                        {paiement.reference && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Référence:</span>
                                                <span className="font-medium text-xs">{paiement.reference}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Date:</span>
                                            <span className="font-medium">
                                                {new Date(paiement.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                    {paiement.statut === 'EN_ATTENTE' && (
                                        <div className="pt-2 flex gap-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedPaiement(paiement);
                                                    setAction('valider');
                                                }}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Valider
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedPaiement(paiement);
                                                    setAction('rejeter');
                                                }}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Rejeter
                                            </Button>
                                        </div>
                                    )}
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

            <Dialog open={!!selectedPaiement} onOpenChange={() => {
                setSelectedPaiement(null);
                setAction(null);
                setNotes("");
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {action === 'valider' ? 'Valider le paiement' : 'Rejeter le paiement'}
                        </DialogTitle>
                        <DialogDescription>
                            {action === 'valider'
                                ? 'Confirmez la validation de ce paiement. La commande sera mise à jour automatiquement.'
                                : 'Indiquez la raison du rejet de ce paiement.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Notes {action === 'rejeter' && '(obligatoire)'}</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={action === 'valider' ? 'Notes optionnelles...' : 'Raison du rejet...'}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedPaiement(null);
                                setAction(null);
                                setNotes("");
                            }}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant={action === 'valider' ? 'default' : 'destructive'}
                            onClick={handleAction}
                            disabled={loading || (action === 'rejeter' && !notes.trim())}
                        >
                            {loading ? 'Traitement...' : action === 'valider' ? 'Valider' : 'Rejeter'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
