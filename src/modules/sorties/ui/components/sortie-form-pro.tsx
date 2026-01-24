"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { sortieInsertSchema } from "../../schemas";
import { createSortie } from "../../actions";
import {
    SORTIE_TYPE_LABELS,
    SORTIE_TYPE_DESCRIPTIONS,
    METHODE_VALORISATION_LABELS,
    METHODE_VALORISATION_DESCRIPTIONS,
    TYPES_AVEC_DESTINATION,
    TYPES_AVEC_REFERENCE,
    TYPES_NECESSITANT_VALIDATION,
} from "../../constants";

interface SortieFormProProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    stocks: Array<{
        id: string;
        produit: { nom: string };
        taille: { nom: string };
        couleur: { nom: string };
        quantiteDisponible: number;
        coutUnitaireMoyen: string;
    }>;
}

export const SortieFormPro = ({ onSuccess, onCancel, stocks }: SortieFormProProps) => {
    const [isPending, startTransition] = useTransition();
    const [lignes, setLignes] = useState<Array<{
        stockId: string;
        quantite: number;
        coutUnitaire?: number;
        lotNumero?: string;
        datePeremption?: Date;
    }>>([{ stockId: "", quantite: 1 }]);

    const form = useForm<z.infer<typeof sortieInsertSchema>>({
        resolver: zodResolver(sortieInsertSchema),
        defaultValues: {
            type: "CONSOMMATION_INTERNE",
            motif: "",
            methodeValorisation: "FIFO",
            notes: "",
            lignes: [{ stockId: "", quantite: 1 }],
        },
    });

    const typeSelectionne = form.watch("type");
    const methodeSelectionne = form.watch("methodeValorisation");
    const necessiteDestination = TYPES_AVEC_DESTINATION.includes(typeSelectionne);
    const necessiteReference = TYPES_AVEC_REFERENCE.includes(typeSelectionne);
    const necessiteValidation = TYPES_NECESSITANT_VALIDATION.includes(typeSelectionne);

    const ajouterLigne = () => {
        setLignes([...lignes, { stockId: "", quantite: 1 }]);
    };

    const supprimerLigne = (index: number) => {
        if (lignes.length > 1) {
            setLignes(lignes.filter((_, i) => i !== index));
        }
    };

    const calculerCoutTotal = () => {
        let total = 0;
        lignes.forEach((ligne) => {
            if (ligne.stockId) {
                const stockItem = stocks.find(s => s.id === ligne.stockId);
                if (stockItem) {
                    const cout = methodeSelectionne === 'PRIX_SPECIFIQUE' && ligne.coutUnitaire
                        ? ligne.coutUnitaire
                        : Number(stockItem.coutUnitaireMoyen || 0);
                    total += cout * ligne.quantite;
                }
            }
        });
        return total;
    };

    const onSubmit = (data: z.infer<typeof sortieInsertSchema>) => {
        data.lignes = lignes;

        startTransition(async () => {
            const result = await createSortie(data);

            if (result.success) {
                toast.success(result.message);
                onSuccess?.();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Layout en 2 colonnes pour grands écrans */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Colonne gauche - Informations principales */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informations principales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type de sortie *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl className="w-full">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner un type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="VENTE">{SORTIE_TYPE_LABELS.VENTE}</SelectItem>
                                                    <SelectItem value="CONSOMMATION_INTERNE">{SORTIE_TYPE_LABELS.CONSOMMATION_INTERNE}</SelectItem>
                                                    <SelectItem value="DEMARQUE_CASSE">{SORTIE_TYPE_LABELS.DEMARQUE_CASSE}</SelectItem>
                                                    <SelectItem value="DEMARQUE_VOL">{SORTIE_TYPE_LABELS.DEMARQUE_VOL}</SelectItem>
                                                    <SelectItem value="DEMARQUE_PEREMPTION">{SORTIE_TYPE_LABELS.DEMARQUE_PEREMPTION}</SelectItem>
                                                    <SelectItem value="DEMARQUE_OBSOLESCENCE">{SORTIE_TYPE_LABELS.DEMARQUE_OBSOLESCENCE}</SelectItem>
                                                    <SelectItem value="TRANSFERT">{SORTIE_TYPE_LABELS.TRANSFERT}</SelectItem>
                                                    <SelectItem value="RETOUR_FOURNISSEUR">{SORTIE_TYPE_LABELS.RETOUR_FOURNISSEUR}</SelectItem>
                                                    <SelectItem value="AJUSTEMENT_INVENTAIRE">{SORTIE_TYPE_LABELS.AJUSTEMENT_INVENTAIRE}</SelectItem>
                                                    <SelectItem value="ECHANTILLON">{SORTIE_TYPE_LABELS.ECHANTILLON}</SelectItem>
                                                    <SelectItem value="AUTRE">{SORTIE_TYPE_LABELS.AUTRE}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                {SORTIE_TYPE_DESCRIPTIONS[typeSelectionne]}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {necessiteValidation && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Ce type nécessitera une validation par un responsable.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <FormField
                                    control={form.control}
                                    name="motif"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Motif *</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Ex: Produit endommagé lors du transport" rows={3} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {necessiteDestination && (
                                    <FormField
                                        control={form.control}
                                        name="destinationDepot"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Destination *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ex: Entrepôt B" />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Dépôt ou entrepôt de destination
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {necessiteReference && (
                                    <FormField
                                        control={form.control}
                                        name="referenceExterne"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Référence externe</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ex: BR-2026-001" />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Bon de retour, numéro de transfert, etc.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes (optionnel)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Informations complémentaires..." rows={2} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Méthode de valorisation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="methodeValorisation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Méthode *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl className="w-full">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner une méthode" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(METHODE_VALORISATION_LABELS).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                {METHODE_VALORISATION_DESCRIPTIONS[methodeSelectionne]}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Résumé */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Coût total estimé</p>
                                        <p className="text-xs text-muted-foreground">
                                            Méthode: {METHODE_VALORISATION_LABELS[methodeSelectionne]}
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary">
                                        {calculerCoutTotal().toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne droite - Articles */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Articles à sortir</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={ajouterLigne}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                                {lignes.map((ligne, index) => (
                                    <div key={index} className="p-3 border rounded-lg space-y-3 bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-xs">Article {index + 1}</Badge>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => supprimerLigne(index)}
                                                disabled={lignes.length === 1}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs font-medium">Article *</label>
                                                <Select
                                                    value={ligne.stockId}
                                                    onValueChange={(value) => {
                                                        const newLignes = [...lignes];
                                                        newLignes[index].stockId = value;
                                                        setLignes(newLignes);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9 w-full text-sm">
                                                        <SelectValue placeholder="Sélectionner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {stocks.map((s) => (
                                                            <SelectItem key={s.id} value={s.id} className="text-sm">
                                                                <div className="flex flex-col">
                                                                    <span>{s.produit.nom} - {s.taille.nom} - {s.couleur.nom}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Dispo: {s.quantiteDisponible} | {Number(s.coutUnitaireMoyen).toLocaleString('fr-FR')} FCFA
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-medium">Quantité *</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        className="h-9 text-sm"
                                                        value={ligne.quantite}
                                                        onChange={(e) => {
                                                            const newLignes = [...lignes];
                                                            newLignes[index].quantite = parseInt(e.target.value) || 1;
                                                            setLignes(newLignes);
                                                        }}
                                                        placeholder="Qté"
                                                    />
                                                </div>

                                                {methodeSelectionne === 'PRIX_SPECIFIQUE' && (
                                                    <div>
                                                        <label className="text-xs font-medium">Coût (FCFA)</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className="h-9 text-sm"
                                                            value={ligne.coutUnitaire || ''}
                                                            onChange={(e) => {
                                                                const newLignes = [...lignes];
                                                                newLignes[index].coutUnitaire = parseFloat(e.target.value) || undefined;
                                                                setLignes(newLignes);
                                                            }}
                                                            placeholder="Coût"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-medium">N° de lot</label>
                                                    <Input
                                                        className="h-9 text-sm"
                                                        value={ligne.lotNumero || ''}
                                                        onChange={(e) => {
                                                            const newLignes = [...lignes];
                                                            newLignes[index].lotNumero = e.target.value || undefined;
                                                            setLignes(newLignes);
                                                        }}
                                                        placeholder="LOT-2026-001"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-medium">Péremption</label>
                                                    <Input
                                                        type="date"
                                                        className="h-9 text-sm"
                                                        value={ligne.datePeremption ? ligne.datePeremption.toISOString().split('T')[0] : ''}
                                                        onChange={(e) => {
                                                            const newLignes = [...lignes];
                                                            newLignes[index].datePeremption = e.target.value ? new Date(e.target.value) : undefined;
                                                            setLignes(newLignes);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                    {onCancel && (
                        <Button variant="ghost" disabled={isPending} type="button" onClick={onCancel} className="w-full sm:w-auto">
                            Annuler
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                        {isPending ? "Enregistrement..." : "Enregistrer la sortie"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
