"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { livraisonCreateSchema } from "../../schemas";
import { createLivraison } from "../../actions";

interface LivraisonFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    commandes: any[];
}

export const LivraisonForm = ({
    onSuccess,
    onCancel,
    commandes
}: LivraisonFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [commandeId, setCommandeId] = useState('');
    const [lignesSelectionnees, setLignesSelectionnees] = useState<Record<string, boolean>>({});
    const [notes, setNotes] = useState('');

    const commandeSelectionnee = commandes.find(c => c.id === commandeId);

    const toggleLigne = (ligneId: string) => {
        setLignesSelectionnees(prev => ({
            ...prev,
            [ligneId]: !prev[ligneId]
        }));
    };

    const onSubmit = () => {
        if (!commandeId) {
            toast.error("Veuillez sélectionner une commande");
            return;
        }

        const lignesALivrer = Object.entries(lignesSelectionnees)
            .filter(([_, selected]) => selected)
            .map(([ligneId]) => {
                const ligne = commandeSelectionnee?.lignes.find((l: any) => l.id === ligneId);
                return {
                    ligneCommandeId: ligneId,
                    quantiteLivree: ligne?.quantite || 0,
                };
            });

        if (lignesALivrer.length === 0) {
            toast.error("Veuillez sélectionner au moins un article à livrer");
            return;
        }

        startTransition(async () => {
            const result = await createLivraison({
                commandeId,
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
            <div>
                <Label>Commande à livrer</Label>
                <Select value={commandeId} onValueChange={(value) => {
                    setCommandeId(value);
                    setLignesSelectionnees({});
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une commande" />
                    </SelectTrigger>
                    <SelectContent>
                        {commandes.map((cmd) => (
                            <SelectItem key={cmd.id} value={cmd.id}>
                                {cmd.numero} - {cmd.etudiant.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {commandeSelectionnee && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Articles à livrer</CardTitle>
                        <CardDescription>
                            Sélectionnez les articles que vous livrez
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {commandeSelectionnee.lignes.map((ligne: any) => (
                            <div key={ligne.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                                <Checkbox
                                    checked={lignesSelectionnees[ligne.id] || false}
                                    onCheckedChange={() => toggleLigne(ligne.id)}
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{ligne.produit.nom}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {ligne.taille.nom} • {ligne.couleur.nom} • Qté: {ligne.quantite}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div>
                <Label>Notes (optionnel)</Label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informations complémentaires sur la livraison..."
                    rows={3}
                />
            </div>

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
                    {isPending ? 'En cours...' : 'Enregistrer la livraison'}
                </Button>
            </div>
        </div>
    );
};
