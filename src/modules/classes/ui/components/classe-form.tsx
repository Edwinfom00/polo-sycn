"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { classeInsertSchema } from "../../schemas";
import { ClasseGetOne, FiliereGetOne } from "../../types";
import { createClasse, updateClasse } from "../../actions";
import { generateClasseCode } from "@/lib/utils/code-generator";

interface ClasseFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: ClasseGetOne;
    filieres: FiliereGetOne[];
    delegues: { id: string; name: string; email: string }[];
}

const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];

export const ClasseForm = ({
    onSuccess,
    onCancel,
    initialValues,
    filieres,
    delegues
}: ClasseFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof classeInsertSchema>>({
        resolver: zodResolver(classeInsertSchema),
        defaultValues: {
            nom: initialValues?.nom ?? '',
            code: initialValues?.code ?? '',
            niveau: initialValues?.niveau ?? '',
            filiereId: initialValues?.filiereId ?? '',
            delegueId: initialValues?.delegueId ?? null,
        },
    });

    const isEdit = !!initialValues?.id;

    // Auto-générer le code quand le nom change (seulement en création)
    useEffect(() => {
        if (!isEdit) {
            const subscription = form.watch((value, { name }) => {
                if (name === 'nom' && value.nom) {
                    const generatedCode = generateClasseCode(value.nom);
                    form.setValue('code', generatedCode);
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [form, isEdit]);

    const onSubmit = (data: z.infer<typeof classeInsertSchema>) => {
        startTransition(async () => {
            const result = isEdit
                ? await updateClasse({ ...data, id: initialValues?.id })
                : await createClasse(data);

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
                            <FormLabel>Nom de la classe</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Informatique L1 - Groupe A" />
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
                                <Input {...field} placeholder="INFO-L1-A" maxLength={10} />
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
                    name="niveau"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Niveau</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un niveau" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {niveaux.map((niveau) => (
                                        <SelectItem key={niveau} value={niveau}>
                                            {niveau}
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
                    name="filiereId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Filière</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une filière" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filieres.map((filiere) => (
                                        <SelectItem key={filiere.id} value={filiere.id}>
                                            {filiere.nom} ({filiere.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
