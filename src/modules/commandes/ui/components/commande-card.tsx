"use client";

import { useState } from "react";
import { MoreVertical, Eye, XCircle, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { CommandeGetOne } from "../../types";
import { annulerCommande, validerCommande } from "../../actions";
import { createLivraison } from "@/modules/livraisons/actions";

interface CommandeCardProps {
    commande: CommandeGetOne;
    onUpdate: () => void;
    userRole: string;
}

const statutColors = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    PAYE: "bg-blue-100 text-blue-800",
    VALIDE: "bg-green-100 text-green-800",
    LIVRE: "bg-purple-100 text-purple-800",
    ANNULE: "bg-red-100 text-red-800",
};

const statutLabels = {
    EN_ATTENTE: "En attente",
    PAYE: "Payé",
    VALIDE: "Validé",
    LIVRE: "Livré",
    ANNULE: "Annulé",
};

export const CommandeCard = ({ commande, onUpdate, userRole }: CommandeCardProps) => {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showDeliverDialog, setShowDeliverDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const canCancel = commande.statut !== 'LIVRE' && commande.statut !== 'ANNULE';
    const canValidate = isAdmin && commande.statut === 'PAYE';
    const canDeliver = isAdmin && commande.statut === 'VALIDE';

    const handleCancel = async () => {
        setIsProcessing(true);
        const result = await annulerCommande(commande.id);

        if (result.success) {
            toast.success(result.message);
            onUpdate();
        } else {
            toast.error(result.message);
        }

        setIsProcessing(false);
        setShowCancelDialog(false);
    };

    const handleValidate = async () => {
        setIsProcessing(true);
        const result = await validerCommande({ id: commande.id });

        if (result.success) {
            toast.success(result.message);
            onUpdate();
        } else {
            toast.error(result.message);
        }

        setIsProcessing(false);
        setShowValidateDialog(false);
    };

    const handleDeliver = async () => {
        setIsProcessing(true);
        const result = await createLivraison({ commandeId: commande.id });

        if (result.success) {
            toast.success(result.message);
            onUpdate();
        } else {
            toast.error(result.message);
        }

        setIsProcessing(false);
        setShowDeliverDialog(false);
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{commande.numero}</CardTitle>
                                <CardDescription className="text-sm">
                                    {commande.etudiant.name}
                                </CardDescription>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                </DropdownMenuItem>
                                {canValidate && (
                                    <DropdownMenuItem onClick={() => setShowValidateDialog(true)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Valider
                                    </DropdownMenuItem>
                                )}
                                {canDeliver && (
                                    <DropdownMenuItem onClick={() => setShowDeliverDialog(true)}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                                        Livrer
                                    </DropdownMenuItem>
                                )}
                                {canCancel && (
                                    <DropdownMenuItem
                                        onClick={() => setShowCancelDialog(true)}
                                        className="text-red-600"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Annuler
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Classe</span>
                            <span className="font-medium">{commande.classe.nom}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Articles</span>
                            <span className="font-medium">{commande.lignes.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Montant</span>
                            <span className="font-semibold text-lg">{commande.montantTotal} FCFA</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Badge className={statutColors[commande.statut as keyof typeof statutColors]}>
                                {statutLabels[commande.statut as keyof typeof statutLabels]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {new Date(commande.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Détails */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Détails de la commande {commande.numero}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Étudiant</p>
                                <p className="font-medium">{commande.etudiant.name}</p>
                                <p className="text-sm text-muted-foreground">{commande.etudiant.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Classe</p>
                                <p className="font-medium">{commande.classe.nom}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-3">Articles commandés</h4>
                            <div className="space-y-2">
                                {commande.lignes.map((ligne) => (
                                    <div key={ligne.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">{ligne.produit.nom}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {ligne.taille.nom} • {ligne.couleur.nom} • Qté: {ligne.quantite}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{ligne.sousTotal} FCFA</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>{commande.montantTotal} FCFA</span>
                        </div>

                        {commande.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm">{commande.notes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Validation */}
            <AlertDialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Valider la commande</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir valider cette commande ? Le stock sera réservé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleValidate}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? "Validation..." : "Valider"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Livraison */}
            <AlertDialog open={showDeliverDialog} onOpenChange={setShowDeliverDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Livrer la commande</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir marquer cette commande comme livrée ? Le stock sera mis à jour.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeliver}
                            disabled={isProcessing}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isProcessing ? "Livraison..." : "Livrer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Annulation */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Retour</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessing ? "Annulation..." : "Annuler la commande"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
