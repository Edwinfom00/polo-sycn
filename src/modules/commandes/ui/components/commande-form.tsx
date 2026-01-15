"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { commandeCreateSchema } from "../../schemas";
import { ProduitGetOne } from "@/modules/produits/types";
import { TailleGetOne, CouleurGetOne } from "@/modules/produits/types";
import { createCommande } from "../../actions";

interface CommandeFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    produits: ProduitGetOne[];
    tailles: TailleGetOne[];
    couleurs: CouleurGetOne[];
}

type LigneForm = {
    produitId: string;
    tailleId: string;
    couleurId: string;
    quantite: number;
};

export const CommandeForm = ({
    onSuccess,
    onCancel,
    produits,
    tailles,
    couleurs
}: CommandeFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [lignes, setLignes] = useState<LigneForm[]>([
        { produitId: '', tailleId: '', couleurId: '', quantite: 1 }
    ]);
    const [notes, setNotes] = useState('');

    const ajouterLigne = () => {
        setLignes([...lignes, { produitId: '', tailleId: '', couleurId: '', quantite: 1 }]);
    };

    const supprimerLigne = (index: number) => {
        if (lignes.length > 1) {
            setLignes(lignes.filter((_, i) => i !== index));
        }
    };

    const updateLigne = (index: number, field: keyof LigneForm, value: any) => {
        const newLignes = [...lignes];
        newLignes[index] = { ...newLignes[index], [field]: value };
        setLignes(newLignes);
    };

    const calculerTotal = () => {
        return lignes.reduce((total, ligne) => {
            const produit = produits.find(p => p.id === ligne.produitId);
            if (produit) {
                return total + (parseFloat(produit.prixUnitaire) * ligne.quantite);
            }
            return total;
        }, 0);
    };

    const onSubmit = () => {
        // Valider les lignes
        const lignesValides = lignes.filter(
            l => l.produitId && l.tailleId && l.couleurId && l.quantite > 0
        );

        if (lignesValides.length === 0) {
            toast.error("Veuillez ajouter au moins un article");
            return;
        }

        const lignesAvecPrix = lignesValides.map(ligne => {
            const produit = produits.find(p => p.id === ligne.produitId);
            return {
                ...ligne,
                prixUnitaire: produit?.prixUnitaire || '0',
            };
        });

        startTransition(async () => {
            const result = await createCommande({
                lignes: lignesAvecPrix,
                notes: notes || null,
            });

            if (result.success) {
                toast.success(result.message);
                onSuccess?.();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Liste des lignes */}
            <div className="space-y-4">
                {lignes.map((ligne, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Article {index + 1}</CardTitle>
                                {lignes.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => supprimerLigne(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Produit</label>
                                    <Select
                                        value={ligne.produitId}
                                        onValueChange={(value) => updateLigne(index, 'produitId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {produits.map((produit) => (
                                                <SelectItem key={produit.id} value={produit.id}>
                                                    {produit.nom} - {produit.prixUnitaire} FCFA
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Taille</label>
                                    <Select
                                        value={ligne.tailleId}
                                        onValueChange={(value) => updateLigne(index, 'tailleId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tailles.map((taille) => (
                                                <SelectItem key={taille.id} value={taille.id}>
                                                    {taille.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Couleur</label>
                                    <Select
                                        value={ligne.couleurId}
                                        onValueChange={(value) => updateLigne(index, 'couleurId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {couleurs.map((couleur) => (
                                                <SelectItem key={couleur.id} value={couleur.id}>
                                                    <div className="flex items-center gap-2">
                                                        {couleur.codeHex && (
                                                            <div
                                                                className="w-4 h-4 rounded border"
                                                                style={{ backgroundColor: couleur.codeHex }}
                                                            />
                                                        )}
                                                        {couleur.nom}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Quantité</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={ligne.quantite}
                                        onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>

                            {ligne.produitId && (
                                <div className="text-sm text-muted-foreground">
                                    Sous-total: {
                                        (parseFloat(produits.find(p => p.id === ligne.produitId)?.prixUnitaire || '0') * ligne.quantite).toFixed(2)
                                    } FCFA
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={ajouterLigne}
                className="w-full"
            >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un article
            </Button>

            {/* Notes */}
            <div>
                <label className="text-sm font-medium">Notes (optionnel)</label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informations complémentaires..."
                    rows={3}
                />
            </div>

            {/* Total */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{calculerTotal().toFixed(2)} FCFA</span>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between gap-x-2">
                {onCancel && (
                    <Button
                        variant="ghost"
                        disabled={isPending}
                        type="button"
                        onClick={onCancel}
                    >
                        Annuler
                    </Button>
                )}
                <Button onClick={onSubmit} disabled={isPending}>
                    {isPending ? 'En cours...' : 'Passer la commande'}
                </Button>
            </div>
        </div>
    );
};
