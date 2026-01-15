"use client";

import { useState } from "react";
import { Eye, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { LivraisonGetOne } from "../../types";

interface LivraisonCardProps {
    livraison: LivraisonGetOne;
}

export const LivraisonCard = ({ livraison }: LivraisonCardProps) => {
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                <Truck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{livraison.commande.numero}</CardTitle>
                                <CardDescription className="text-sm">
                                    {livraison.commande.etudiant.name}
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDetailsDialog(true)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Livré par</span>
                            <span className="font-medium">{livraison.livrePar.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Articles</span>
                            <span className="font-medium">{livraison.lignes.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Quantité totale</span>
                            <span className="font-medium">
                                {livraison.lignes.reduce((sum, l) => sum + l.quantiteLivree, 0)}
                            </span>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground text-right">
                            {new Date(livraison.livreAt).toLocaleString('fr-FR')}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Détails */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Détails de la livraison</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Commande</p>
                                <p className="font-medium">{livraison.commande.numero}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Étudiant</p>
                                <p className="font-medium">{livraison.commande.etudiant.name}</p>
                                <p className="text-sm text-muted-foreground">{livraison.commande.etudiant.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Livré par</p>
                                <p className="font-medium">{livraison.livrePar.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date de livraison</p>
                                <p className="font-medium">
                                    {new Date(livraison.livreAt).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-3">Articles livrés</h4>
                            <div className="space-y-2">
                                {livraison.lignes.map((ligne) => (
                                    <div key={ligne.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">{ligne.ligneCommande.produit.nom}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {ligne.ligneCommande.taille.nom} • {ligne.ligneCommande.couleur.nom}
                                            </p>
                                        </div>
                                        <p className="font-semibold">Qté: {ligne.quantiteLivree}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {livraison.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm">{livraison.notes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
