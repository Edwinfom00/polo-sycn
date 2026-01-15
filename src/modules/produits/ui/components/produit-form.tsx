"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { produitInsertSchema } from "../../schemas";
import { ProduitGetOne } from "../../types";
import { createProduit, updateProduit } from "../../actions";

interface ProduitFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: ProduitGetOne;
}

export const ProduitForm = ({
    onSuccess,
    onCancel,
    initialValues
}: ProduitFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof produitInsertSchema>>({
        resolver: zodResolver(produitInsertSchema),
        defaultValues: {
            nom: initialValues?.nom ?? '',
            description: initialValues?.description ?? '',
            prixUnitaire: initialValues?.prixUnitaire ?? '',
            actif: initialValues?.actif ?? true,
        },
    });

    const isEdit = !!initialValues?.id;

    const onSubmit = (data: z.infer<typeof produitInsertSchema>) => {
        startTransition(async () => {
            const result = isEdit
                ? await updateProduit({ ...data, id: initialValues?.id })
                : await createProduit(data);

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
                    name="nom"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du produit</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Polo universitaire" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (optionnel)</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Description du produit"
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="prixUnitaire"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prix unitaire (FCFA)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    placeholder="5000"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="actif"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Produit actif</FormLabel>
                            </div>
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
                        {isPending ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
