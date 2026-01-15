"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { GeneratedAvatar } from "@/components/generated-avatar";
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

import { userInsertSchema } from "../../schemas";
import { UserGetOne } from "../../types";
import { createUser, updateUser } from "../../actions";

interface UserFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: UserGetOne;
}

export const UserForm = ({
    onSuccess,
    onCancel,
    initialValues
}: UserFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof userInsertSchema>>({
        resolver: zodResolver(userInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            email: initialValues?.email ?? '',
            password: '',
            role: initialValues?.role ?? 'DELEGUE', // Par défaut Délégué
            classeId: initialValues?.classeId ?? null,
        },
    });

    const isEdit = !!initialValues?.id;

    const onSubmit = (data: z.infer<typeof userInsertSchema>) => {
        startTransition(async () => {
            const result = isEdit
                ? await updateUser({ ...data, id: initialValues?.id })
                : await createUser(data);

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
                <GeneratedAvatar
                    seed={form.watch('name')}
                    variant="botttsNeutral"
                    className="border size-16"
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Jean Dupont" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" placeholder="jean.dupont@example.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!isEdit && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" placeholder="••••••••" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rôle</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full!">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="DELEGUE">Délégué</SelectItem>
                                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Administrateur</SelectItem>
                                </SelectContent>
                            </Select>
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
                        {isPending ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
