"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { stockInsertSchema } from "../../schemas";
import { ProduitGetOne, TailleGetOne, CouleurGetOne } from "../../types";
import { createStock } from "../../actions";

interface StockFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    produits: ProduitGetOne[];
    tailles: TailleGetOne[];
    couleurs: CouleurGetOne[];
}

export const StockForm = ({
    onSuccess,
    onCancel,
    produits,
    tailles,
    couleurs
}: StockFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof stockInsertSchema>>({
        resolver: zodResolver(stockInsertSchema),
        defaultValues: {
            produitId: '',
            tailleId: '',
            couleurId: '',
            quantiteDisponible: 0,
            seuilAlerte: 10,
        },
    });

    const onSubmit = (data: z.infer<typeof stockInsertSchema>) => {
        startTransition(async () => {
            const result = await createStock(data);

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="produitId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Produit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {produits.map((produit) => (
                                        <SelectItem key={produit.id} value={produit.id}>
                                            {produit.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tailleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taille</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une taille" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {tailles.map((taille) => (
                                        <SelectItem key={taille.id} value={taille.id}>
                                            {taille.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="couleurId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Couleur</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une couleur" />
                                    </SelectTrigger>
                                </FormControl>
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="quantiteDisponible"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantité disponible</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="seuilAlerte"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Seuil d'alerte</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'En cours...' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
