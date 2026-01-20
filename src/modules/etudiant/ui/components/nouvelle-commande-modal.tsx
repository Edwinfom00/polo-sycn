"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createCommande } from "@/modules/commandes/actions";

interface NouvelleCommandeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    produits: any[];
    tailles: any[];
    couleurs: any[];
}

export const NouvelleCommandeModal = ({
    open,
    onOpenChange,
    produits,
    tailles,
    couleurs,
}: NouvelleCommandeModalProps) => {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [notes, setNotes] = useState("");
    const [lignes, setLignes] = useState<any[]>([
        { produitId: "", tailleId: "", couleurId: "", quantite: 1 },
    ]);

    const ajouterLigne = () => {
        setLignes([...lignes, { produitId: "", tailleId: "", couleurId: "", quantite: 1 }]);
    };

    const supprimerLigne = (index: number) => {
        if (lignes.length > 1) {
            setLignes(lignes.filter((_, i) => i !== index));
        }
    };

    const updateLigne = (index: number, field: string, value: any) => {
        const newLignes = [...lignes];
        newLignes[index] = { ...newLignes[index], [field]: value };
        setLignes(newLignes);
    };

    const calculerTotal = () => {
        return lignes.reduce((total, ligne) => {
            const produit = produits.find((p) => p.id === ligne.produitId);
            if (produit && ligne.quantite) {
                return total + parseFloat(produit.prixUnitaire) * ligne.quantite;
            }
            return total;
        }, 0);
    };

    const validerFormulaire = () => {
        // Vérifier que toutes les lignes sont complètes
        for (const ligne of lignes) {
            if (!ligne.produitId || !ligne.tailleId || !ligne.couleurId || ligne.quantite < 1) {
                toast.error("Veuillez remplir tous les champs de chaque article");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validerFormulaire()) return;

        setPending(true);

        // Préparer les lignes avec les prix
        const lignesAvecPrix = lignes.map((ligne) => {
            const produit = produits.find((p) => p.id === ligne.produitId);
            return {
                ...ligne,
                prixUnitaire: produit?.prixUnitaire || "0",
            };
        });

        const result = await createCommande({
            lignes: lignesAvecPrix,
            notes: notes || null,
        });

        setPending(false);

        if (result.success) {
            toast.success("Commande créée avec succès !");
            // Réinitialiser le formulaire
            setLignes([{ produitId: "", tailleId: "", couleurId: "", quantite: 1 }]);
            setNotes("");
            onOpenChange(false);
            router.refresh();
        } else {
            toast.error(result.message || "Erreur lors de la création");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        Nouvelle Commande
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Sélectionnez vos articles, tailles et couleurs pour créer votre commande
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-6">
                    {/* Articles */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-2">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                <h3 className="text-base sm:text-lg font-semibold">Mes Articles</h3>
                                <Badge variant="secondary">{lignes.length}</Badge>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={ajouterLigne}
                                className="gap-1 sm:gap-2 text-xs sm:text-sm"
                            >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Ajouter</span>
                                <span className="sm:hidden">+</span>
                            </Button>
                        </div>

                        {lignes.map((ligne, index) => {
                            const produitSelectionne = produits.find((p) => p.id === ligne.produitId);
                            const sousTotal = produitSelectionne
                                ? parseFloat(produitSelectionne.prixUnitaire) * ligne.quantite
                                : 0;

                            return (
                                <Card key={index} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                                    <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="gap-1 text-xs">
                                                <Package className="h-3 w-3" />
                                                Article {index + 1}
                                            </Badge>
                                            {lignes.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => supprimerLigne(index)}
                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* Produit */}
                                            <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                                                <Label className="text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    Produit <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={ligne.produitId}
                                                    onValueChange={(value) =>
                                                        updateLigne(index, "produitId", value)
                                                    }
                                                >
                                                    <SelectTrigger className={!ligne.produitId ? "border-primary/30 w-full!" : "w-full!"}>
                                                        <SelectValue placeholder="Choisir un produit" />
                                                    </SelectTrigger>
                                                    <SelectContent className="w-full!">
                                                        {produits
                                                            .filter((p) => p.actif)
                                                            .map((produit) => (
                                                                <SelectItem
                                                                    key={produit.id}
                                                                    value={produit.id}
                                                                >
                                                                    <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
                                                                        <span className="text-xs sm:text-sm">{produit.nom}</span>
                                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                                            {parseFloat(
                                                                                produit.prixUnitaire
                                                                            ).toLocaleString("fr-FR")} FCFA
                                                                        </Badge>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Taille */}
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <Label className="text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    Taille <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={ligne.tailleId}
                                                    onValueChange={(value) =>
                                                        updateLigne(index, "tailleId", value)
                                                    }
                                                >
                                                    <SelectTrigger className={!ligne.tailleId ? "border-primary/30 w-full!" : "w-full!"}>
                                                        <SelectValue placeholder="Choisir une taille" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tailles.map((taille) => (
                                                            <SelectItem
                                                                key={taille.id}
                                                                value={taille.id}
                                                            >
                                                                {taille.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Couleur */}
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <Label className="text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    Couleur <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={ligne.couleurId}
                                                    onValueChange={(value) =>
                                                        updateLigne(index, "couleurId", value)
                                                    }
                                                >
                                                    <SelectTrigger className={!ligne.couleurId ? "border-primary/30 w-full!" : "w-full!"}>
                                                        <SelectValue placeholder="Choisir une couleur" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {couleurs.map((couleur) => (
                                                            <SelectItem
                                                                key={couleur.id}
                                                                value={couleur.id}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {couleur.codeHex && (
                                                                        <div
                                                                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-border shadow-sm"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    couleur.codeHex,
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <span className="text-xs sm:text-sm">{couleur.nom}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Quantité */}
                                            <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                                                <Label className="text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    Quantité <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={ligne.quantite}
                                                    onChange={(e) =>
                                                        updateLigne(
                                                            index,
                                                            "quantite",
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                    className="text-center font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Sous-total */}
                                        {ligne.produitId && (
                                            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t text-xs sm:text-sm">
                                                <span className="text-muted-foreground">
                                                    Sous-total de cet article
                                                </span>
                                                <span className="text-base sm:text-lg font-bold text-primary">
                                                    {sousTotal.toLocaleString("fr-FR")} FCFA
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Notes */}
                    <Card>
                        <CardContent className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                            <Label className="text-xs sm:text-sm font-medium">Notes ou instructions (optionnel)</Label>
                            <Textarea
                                placeholder="Ex: Préférence de livraison, remarques particulières..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="resize-none text-xs sm:text-sm"
                            />
                        </CardContent>
                    </Card>
                </div>

                <Separator className="my-3 sm:my-4" />

                {/* Footer avec total et actions */}
                <div className="space-y-3 sm:space-y-4 pt-2">
                    {/* Résumé */}
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                        <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Montant Total</p>
                            <p className="text-2xl sm:text-3xl font-bold text-primary">
                                {calculerTotal().toLocaleString("fr-FR")} FCFA
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs sm:text-sm text-muted-foreground">Articles</p>
                            <p className="text-xl sm:text-2xl font-semibold">{lignes.length}</p>
                        </div>
                    </div>

                    {/* Message d'info */}
                    {lignes.some(l => !l.produitId || !l.tailleId || !l.couleurId) && (
                        <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs sm:text-sm text-primary/90">
                                Veuillez remplir tous les champs obligatoires (*) pour chaque article
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={pending}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={pending}
                            size="lg"
                            className="gap-2 w-full sm:w-auto sm:min-w-[180px]"
                        >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                            {pending ? "Création..." : "Créer la commande"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
