"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

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

import { paiementCreateSchema } from "../../schemas";
import { createPaiement } from "../../actions";

interface PaiementFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    commandes: any[];
}

const methodesPaiement = [
    "Espèces",
    "Virement bancaire",
    "Mobile Money",
    "Carte bancaire",
    "Chèque",
];

export const PaiementForm = ({
    onSuccess,
    onCancel,
    commandes
}: PaiementFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof paiementCreateSchema>>({
        resolver: zodResolver(paiementCreateSchema),
        defaultValues: {
            commandeId: '',
            montant: '',
            methodePaiement: '',
            reference: '',
            notes: '',
        },
    });

    const commandeSelectionnee = form.watch('commandeId');
    const commandeData = commandes.find(c => c.id === commandeSelectionnee);

    const onSubmit = (data: z.infer<typeof paiementCreateSchema>) => {
        startTransition(async () => {
            const result = await createPaiement(data);

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
                    name="commandeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Commande</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une commande" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {commandes.map((cmd) => (
                                        <SelectItem key={cmd.id} value={cmd.id}>
                                            {cmd.numero} - {cmd.montantTotal} FCFA (Payé: {cmd.montantPaye} FCFA)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {commandeData && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                        <p><strong>Montant total:</strong> {commandeData.montantTotal} FCFA</p>
                        <p><strong>Déjà payé:</strong> {commandeData.montantPaye} FCFA</p>
                        <p className="text-orange-600 font-semibold">
                            <strong>Reste à payer:</strong> {(parseFloat(commandeData.montantTotal) - parseFloat(commandeData.montantPaye)).toFixed(2)} FCFA
                        </p>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="montant"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Montant (FCFA)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    placeholder="5000"
                                />
                            </FormControl>
                            <FormDescription>
                                Montant du paiement effectué
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="methodePaiement"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Méthode de paiement</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {methodesPaiement.map((methode) => (
                                        <SelectItem key={methode} value={methode}>
                                            {methode}
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
                    name="reference"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Référence (optionnel)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Numéro de transaction, reçu, etc."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (optionnel)</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Informations complémentaires..."
                                    rows={3}
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
                        {isPending ? 'En cours...' : 'Enregistrer le paiement'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
