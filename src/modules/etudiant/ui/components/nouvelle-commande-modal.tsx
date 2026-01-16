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
import { Plus, Trash2, ShoppingCart } from "lucide-react";
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Nouvelle Commande
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez vos polos, tailles et couleurs
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Articles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Articles</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={ajouterLigne}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un article
                            </Button>
                        </div>

                        {lignes.map((ligne, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg space-y-4 bg-muted/30"
                            >
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">Article {index + 1}</Badge>
                                    {lignes.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => supprimerLigne(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Produit */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Produit *</label>
                                        <Select
                                            value={ligne.produitId}
                                            onValueChange={(value) =>
                                                updateLigne(index, "produitId", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un produit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {produits
                                                    .filter((p) => p.actif)
                                                    .map((produit) => (
                                                        <SelectItem
                                                            key={produit.id}
                                                            value={produit.id}
                                                        >
                                                            {produit.nom} -{" "}
                                                            {parseFloat(
                                                                produit.prixUnitaire
                                                            ).toLocaleString("fr-FR")}{" "}
                                                            FCFA
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Taille */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Taille *</label>
                                        <Select
                                            value={ligne.tailleId}
                                            onValueChange={(value) =>
                                                updateLigne(index, "tailleId", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez une taille" />
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Couleur *</label>
                                        <Select
                                            value={ligne.couleurId}
                                            onValueChange={(value) =>
                                                updateLigne(index, "couleurId", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez une couleur" />
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
                                                                    className="w-4 h-4 rounded border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            couleur.codeHex,
                                                                    }}
                                                                />
                                                            )}
                                                            {couleur.nom}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Quantité */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Quantité *</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={ligne.quantite}
                                            onChange={(e) =>
                                                updateLigne(
                                                    index,
                                                    "quantite",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Sous-total */}
                                {ligne.produitId && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            Sous-total
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {(
                                                parseFloat(
                                                    produits.find(
                                                        (p) => p.id === ligne.produitId
                                                    )?.prixUnitaire || "0"
                                                ) * ligne.quantite
                                            ).toLocaleString("fr-FR")}{" "}
                                            FCFA
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (optionnel)</label>
                        <Textarea
                            placeholder="Informations complémentaires..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <p className="text-lg font-semibold">Montant Total</p>
                        <p className="text-2xl font-bold text-primary">
                            {calculerTotal().toLocaleString("fr-FR")} FCFA
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={pending}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={pending}
                        >
                            {pending ? "Création..." : "Créer la commande"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
