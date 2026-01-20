"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Truck,
    Package,
    Search,
    Plus,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createLivraison } from "@/modules/livraisons/actions";
import { toast } from "sonner";

interface Livraison {
    id: string;
    livreAt: Date;
    notes: string | null;
    commande: {
        numero: string;
        etudiant: {
            name: string;
        };
    };
    livrePar: {
        name: string;
    };
    lignes: Array<{
        quantiteLivree: number;
        ligneCommande: {
            produit: { nom: string };
            taille: { nom: string };
            couleur: { nom: string };
        };
    }>;
}

interface CommandeValidee {
    id: string;
    numero: string;
    etudiant: {
        name: string;
    };
    lignes: Array<{
        quantite: number;
        produit: { nom: string };
        taille: { nom: string };
        couleur: { nom: string };
    }>;
}

interface AdminLivraisonsViewProps {
    livraisons: Livraison[];
    commandesValidees: CommandeValidee[];
}

export const AdminLivraisonsView = ({ livraisons: initialLivraisons, commandesValidees }: AdminLivraisonsViewProps) => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedCommande, setSelectedCommande] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 9;

    const filteredLivraisons = initialLivraisons.filter(l =>
        search === "" ||
        l.commande.numero.toLowerCase().includes(search.toLowerCase()) ||
        l.commande.etudiant.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLivraisons.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLivraisons = filteredLivraisons.slice(startIndex, endIndex);

    const handleCreate = async () => {
        if (!selectedCommande) {
            toast.error("Veuillez sélectionner une commande");
            return;
        }

        setLoading(true);
        try {
            const result = await createLivraison({
                commandeId: selectedCommande,
                notes: notes.trim() || undefined,
            });

            if (result.success) {
                toast.success(result.message);
                window.location.reload();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Livraisons</h1>
                    <p className="text-muted-foreground">Enregistrez les livraisons</p>
                </div>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle livraison
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total livraisons</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialLivraisons.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commandes à livrer</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{commandesValidees.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par commande ou étudiant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {currentLivraisons.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucune livraison</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentLivraisons.map((livraison) => (
                            <Card key={livraison.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{livraison.commande.numero}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{livraison.commande.etudiant.name}</p>
                                        </div>
                                        <Badge className="bg-purple-500">
                                            <Truck className="h-3 w-3 mr-1" />
                                            Livré
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Date:</span>
                                            <span className="font-medium">
                                                {new Date(livraison.livreAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Livré par:</span>
                                            <span className="font-medium">{livraison.livrePar.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Articles:</span>
                                            <span className="font-medium">{livraison.lignes.length}</span>
                                        </div>
                                    </div>
                                    {livraison.notes && (
                                        <div className="pt-2 border-t">
                                            <p className="text-xs text-muted-foreground">Notes:</p>
                                            <p className="text-sm">{livraison.notes}</p>
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

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nouvelle livraison</DialogTitle>
                        <DialogDescription>
                            Sélectionnez une commande validée à livrer
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {commandesValidees.length === 0 ? (
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground text-center">
                                    Aucune commande validée disponible pour livraison.
                                    <br />
                                    Les commandes doivent avoir le statut "VALIDE" pour être livrées.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Commande * ({commandesValidees.length} disponible{commandesValidees.length > 1 ? 's' : ''})</Label>
                                    <Select value={selectedCommande} onValueChange={setSelectedCommande}>
                                        <SelectTrigger className="w-full!">
                                            <SelectValue placeholder="Sélectionner une commande" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {commandesValidees.map((cmd) => (
                                                <SelectItem key={cmd.id} value={cmd.id}>
                                                    {cmd.numero} - {cmd.etudiant.name} ({cmd.lignes.length} articles)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedCommande && (
                                    <div className="border rounded-lg p-4 space-y-2">
                                        <p className="font-medium text-sm">Articles à livrer:</p>
                                        {commandesValidees
                                            .find(c => c.id === selectedCommande)
                                            ?.lignes.map((ligne, idx) => (
                                                <div key={idx} className="text-sm flex justify-between">
                                                    <span>
                                                        {ligne.produit.nom} - {ligne.taille.nom} - {ligne.couleur.nom}
                                                    </span>
                                                    <span className="font-medium">x{ligne.quantite}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notes optionnelles..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDialog(false);
                                setSelectedCommande("");
                                setNotes("");
                            }}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleCreate} disabled={loading || !selectedCommande || commandesValidees.length === 0}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
