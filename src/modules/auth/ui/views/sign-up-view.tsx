"use client";
import { Card, CardContent } from '@/components/ui/card'

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';


import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle } from '@/components/ui/alert';
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
import { OctagonAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const formSchema = z.object({
    name: z.string().min(1, {
        message: 'Le nom est requis',
    }),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, {
        message: 'Le mot de passe doit contenir au moins 6 caractères',
    }),
    confirmPassword: z.string().min(1, {
        message: 'Confirmez votre mot de passe',
    }),
    filiereId: z.string().min(1, {
        message: 'Sélectionnez votre filière',
    }),
    classeId: z.string().min(1, {
        message: 'Sélectionnez votre classe',
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
})

interface SignUpViewProps {
    filieres: any[];
    classes: any[];
}

export const SignUpView = ({ filieres, classes }: SignUpViewProps) => {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [filteredClasses, setFilteredClasses] = useState(classes);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            filiereId: '',
            classeId: '',
        },
    })

    // Filtrer les classes selon la filière sélectionnée
    const filiereId = form.watch('filiereId');
    useEffect(() => {
        if (filiereId) {
            setFilteredClasses(classes.filter(c => c.filiereId === filiereId));
            form.setValue('classeId', ''); // Reset classe selection
        } else {
            setFilteredClasses([]);
        }
    }, [filiereId, classes, form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setError(null);
        setPending(true);

        try {
            // D'abord créer le compte
            await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            // Ensuite mettre à jour la classe de l'utilisateur
            const response = await fetch('/api/auth/update-student-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    classeId: data.classeId,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de la classe');
            }

            setPending(false);
            router.push("/");
        } catch (err: any) {
            setPending(false);
            setError(err.message || 'Une erreur est survenue');
        }
    }



    return (
        <div className='flex flex-col gap-6'>
            <Card className='overflow-hidden p-0'>
                <CardContent className='grid p-0 md:grid-cols-2'>
                    <Form {...form}>
                        <form className='p-6 md:p-8' onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='flex flex-col gap-6'>
                                <div className='flex flex-col items-center text-center'>
                                    <h1 className="text-2xl font-bold">
                                        Inscription Étudiant
                                    </h1>
                                    <p className='text-muted-foreground text-balance'>
                                        Créez votre compte PoloSync
                                    </p>
                                </div>
                                <div className='grid gap-3'>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom complet</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jean Dupont" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="jean.dupont@example.com" type='email' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="filiereId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Filière</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl className="w-full">
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionnez votre filière" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filieres.map((filiere) => (
                                                            <SelectItem key={filiere.id} value={filiere.id}>
                                                                {filiere.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="classeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Classe</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={!filiereId}
                                                >
                                                    <FormControl className="w-full">
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionnez votre classe" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredClasses.map((classe) => (
                                                            <SelectItem key={classe.id} value={classe.id}>
                                                                {classe.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Sélectionnez d&apos;abord votre filière
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mot de passe</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="********" type='password' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmer le mot de passe</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="********" type='password' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {!!error && (
                                    <Alert className='bg-destructive/10 border-none'>
                                        <OctagonAlertIcon className='h-4 w-4 text-destructive!' />
                                        <AlertTitle>{error}</AlertTitle>
                                    </Alert>
                                )}
                                <Button
                                    className='w-full'
                                    type='submit'
                                    disabled={pending}
                                >
                                    {pending ? 'Inscription...' : "S'inscrire"}
                                </Button>
                                <div className='text-center text-sm'>
                                    Vous avez déjà un compte ?{' '}
                                    <Link href="/sign-in" className='underline underline-offset-4 hover:text-primary'>
                                        Se connecter
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>

                    <div className='bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center'>
                        <img src={'/logo.png'} alt='logo' className='h-[92px] w-[92px]' />
                        <p className='text-2xl font-semibold text-white'>
                            PoloSync
                        </p>
                    </div>
                </CardContent>
            </Card>
            <div className='text-muted-foreground text-center text-xs text-balance'>
                En continuant, vous acceptez nos <a href="#" className='underline underline-offset-4 hover:text-primary'>Conditions d&apos;utilisation</a> et notre <a href="#" className='underline underline-offset-4 hover:text-primary'>Politique de confidentialité</a>
            </div>
        </div>
    )
}
