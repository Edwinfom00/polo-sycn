import { getCurrentUser } from '@/lib/auth-utils';
import { redirectByRole } from '@/lib/redirect-by-role';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, UserPlus, ShoppingCart, CreditCard, Truck } from "lucide-react";

export default async function Home() {
  // Vérifier si l'utilisateur est connecté
  const user = await getCurrentUser();

  // Si connecté, rediriger vers le dashboard selon le rôle
  if (user) {
    redirectByRole(user.role as any);
  }

  // Sinon, afficher la landing page
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="PoloSync" width={40} height={40} />
            <span className="text-xl font-bold">PoloSync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <Image src="/logo.png" alt="PoloSync" width={120} height={120} />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Bienvenue sur <span className="text-primary">PoloSync</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Plateforme de gestion des commandes de polos universitaires.
              Commandez, payez et suivez vos livraisons en toute simplicité.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Créer un compte étudiant
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <LogIn className="mr-2 h-5 w-5" />
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Comment ça marche ?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">1. Commander</h3>
                  <p className="text-muted-foreground">
                    Choisissez votre polo, la taille et la couleur qui vous conviennent.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">2. Payer</h3>
                  <p className="text-muted-foreground">
                    Effectuez votre paiement et enregistrez-le dans le système.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">3. Recevoir</h3>
                  <p className="text-muted-foreground">
                    Suivez votre commande et récupérez votre polo une fois prêt.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <Card className="border-2 bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="mb-4 text-2xl font-bold">
                  Prêt à commander votre polo ?
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Créez votre compte étudiant en quelques secondes et passez votre première commande.
                </p>
                <Link href="/sign-up">
                  <Button size="lg">
                    Commencer maintenant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 PoloSync. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
