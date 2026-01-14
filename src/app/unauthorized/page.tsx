import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-6">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <ShieldAlertIcon className="h-10 w-10 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Accès refusé</h1>
                        <p className="text-muted-foreground">
                            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        </p>
                    </div>

                    <Button asChild className="w-full">
                        <Link href="/">Retour à l'accueil</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
