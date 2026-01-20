"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";

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

import { userInsertSchema, userUpdateSchema } from "../../schemas";
import { UserGetOne } from "../../types";
import { createUser, updateUser } from "../../actions";
import { generatePassword, copyToClipboard } from "@/lib/utils/password-generator";

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
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string, password: string } | null>(null);

    const isEdit = !!initialValues?.id;

    // Créer un schéma dynamique basé sur le mode
    const formSchema = isEdit
        ? z.object({
            name: z.string().min(1, "Le nom est requis"),
            email: z.string().email("Email invalide"),
            role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DELEGUE', 'ETUDIANT']),
            classeId: z.string().optional().nullable(),
            password: z.string().optional(), // Optionnel en mode édition
        })
        : userInsertSchema;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            email: initialValues?.email ?? '',
            password: '',
            role: initialValues?.role ?? 'ADMIN',
            classeId: initialValues?.classeId ?? null,
        },
        mode: 'onChange',
    });

    const handleGeneratePassword = () => {
        const newPassword = generatePassword(12);
        form.setValue('password', newPassword);
        toast.success("Mot de passe généré");
    };

    const handleCopyPassword = async () => {
        const password = form.getValues('password') || '';
        const success = await copyToClipboard(password);
        if (success) {
            setCopiedPassword(true);
            toast.success("Mot de passe copié");
            setTimeout(() => setCopiedPassword(false), 2000);
        } else {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleCopyEmail = async () => {
        const email = form.getValues('email');
        const success = await copyToClipboard(email);
        if (success) {
            setCopiedEmail(true);
            toast.success("Email copié");
            setTimeout(() => setCopiedEmail(false), 2000);
        } else {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleCopyCredentials = async () => {
        if (generatedCredentials) {
            const text = `Email: ${generatedCredentials.email}\nMot de passe: ${generatedCredentials.password}`;
            const success = await copyToClipboard(text);
            if (success) {
                toast.success("Identifiants copiés");
            } else {
                toast.error("Erreur lors de la copie");
            }
        }
    };

    const onSubmit = (data: any) => {
        console.log('=== FORM SUBMIT START ===');
        console.log('Form submitted with data:', data);
        console.log('Is edit mode:', isEdit);
        console.log('Initial values:', initialValues);

        if (isEdit && !initialValues?.id) {
            console.error('Edit mode but no ID!');
            toast.error('Erreur: ID utilisateur manquant');
            return;
        }

        startTransition(async () => {
            try {
                let result;

                if (isEdit) {
                    // Transform undefined to null for classeId
                    const updateData = {
                        id: initialValues?.id,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        classeId: data.classeId === undefined ? null : data.classeId
                    };

                    console.log('Calling updateUser with:', updateData);
                    result = await updateUser(updateData);
                } else {
                    console.log('Calling createUser with:', data);
                    result = await createUser(data);
                }

                console.log('Result:', result);

                if (result.success) {
                    if (!isEdit) {
                        setGeneratedCredentials({
                            email: data.email,
                            password: data.password,
                        });
                    }
                    toast.success(result.message);
                    if (isEdit) {
                        onSuccess?.();
                    }
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.error('Submit error:', error);
                toast.error('Erreur lors de la soumission');
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="text-xs text-muted-foreground mb-2">
                    Mode: {isEdit ? 'Édition' : 'Création'} | ID: {initialValues?.id || 'N/A'}
                </div>

                <GeneratedAvatar
                    seed={form.watch('name') || "Name"}
                    variant="initials"
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
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="jean.dupont@example.com"
                                        disabled={generatedCredentials !== null}
                                        className="flex-1"
                                    />
                                </FormControl>
                                {generatedCredentials && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyEmail}
                                    >
                                        {copiedEmail ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
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
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="••••••••"
                                            disabled={generatedCredentials !== null}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    {!generatedCredentials && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleGeneratePassword}
                                            title="Générer un mot de passe"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {!generatedCredentials && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopyPassword}
                                        >
                                            {copiedPassword ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
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
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={generatedCredentials !== null}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full!">
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Administrateur</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {generatedCredentials && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-primary">✓ Utilisateur créé avec succès!</p>
                        <p className="text-xs text-primary/80">Copiez les identifiants avant de fermer cette fenêtre.</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyCredentials}
                            className="w-full"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copier tous les identifiants
                        </Button>
                    </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                    {!generatedCredentials ? (
                        <>
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
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full sm:w-auto"
                            >
                                {isPending ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => {
                                setGeneratedCredentials(null);
                                setCopiedPassword(false);
                                setCopiedEmail(false);
                                onSuccess?.();
                            }}
                            className="w-full"
                        >
                            Fermer et actualiser
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
};
