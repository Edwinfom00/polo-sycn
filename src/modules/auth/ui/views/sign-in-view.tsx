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
    FormMessage
} from "@/components/ui/form";
import { OctagonAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


const formSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, {
        message: 'Le mot de passe est requis',
    }),
})

export const SignInView = () => {
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setError(null);
        setPending(true);

        authClient.signIn.email({
            email: data.email,
            password: data.password,
            callbackURL: "/"
        }, {
            onSuccess: () => {
                setPending(false);
                router.push("/");
            },
            onError: ({ error }) => {
                setPending(false);
                setError(error.message);
            },
        });
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
                                        Bon retour
                                    </h1>
                                    <p className='text-muted-foreground text-balance'>
                                        Connectez-vous à votre compte
                                    </p>
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
                                    {pending ? 'Connexion...' : 'Se connecter'}
                                </Button>
                                <div className='text-center text-sm'>
                                    Pas encore de compte ?{' '}
                                    <Link href="/sign-up" className='underline underline-offset-4 hover:text-primary'>
                                        S&apos;inscrire
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>

                    <div className='bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center'>
                        <img src={'/logo.png'} alt='logo' className='h-[150px] w-[150px]' />
                        <p className='text-2xl font-semibold text-white'>
                            TWYZ
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
