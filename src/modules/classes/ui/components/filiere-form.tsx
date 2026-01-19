"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";

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

import { filiereInsertSchema } from "../../schemas";
import { FiliereGetOne } from "../../types";
import { createFiliere, updateFiliere } from "../../actions";
import { generateFiliereCode } from "@/lib/utils/code-generator";

interface FiliereFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: FiliereGetOne;
}

export const FiliereForm = ({
    onSuccess,
    onCancel,
    initialValues
}: FiliereFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof filiereInsertSchema>>({
        resolver: zodResolver(filiereInsertSchema),
        defaultValues: {
            nom: initialValues?.nom ?? '',
            code: initialValues?.code ?? '',
            description: initialValues?.description ?? '',
        },
    });

    const isEdit = !!initialValues?.id;

    // Auto-générer le code quand le nom change (seulement en création)
    useEffect(() => {
        if (!isEdit) {
            const subscription = form.watch((value, { name }) => {
                if (name === 'nom' && value.nom) {
                    const generatedCode = generateFiliereCode(value.nom);
                    form.setValue('code', generatedCode);
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [form, isEdit]);

    const onSubmit = (data: z.infer<typeof filiereInsertSchema>) => {
        startTransition(async () => {
            const result = isEdit
                ? await updateFiliere({ ...data, id: initialValues?.id })
                : await createFiliere(data);

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
                            <FormLabel>Nom de la filière</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Informatique" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="INFO" maxLength={10} />
                            </FormControl>
                            <FormDescription>
                                {!isEdit && "Généré automatiquement, vous pouvez le modifier"}
                            </FormDescription>
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
                                    placeholder="Licence et Master en Informatique"
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                        {isPending ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
