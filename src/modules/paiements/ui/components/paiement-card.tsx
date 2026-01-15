"use client";

import { useState } from "react";
import { MoreVertical, CheckCircle, XCircle, CreditCard } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { PaiementGetOne } from "../../types";
import { validerPaiement, rejeterPaiement } from "../../actions";

interface PaiementCardProps {
    paiement: PaiementGetOne;
    onUpdate: () => void;
    userRole: string;
}

const statutColors = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    PAYE: "bg-green-100 text-green-800",
    REMBOURSE: "bg-red-100 text-red-800",
};

const statutLabels = {
    EN_ATTENTE: "En attente",
    PAYE: "Validé",
    REMBOURSE: "Rejeté",
};

export const PaiementCard = ({ paiement, onUpdate, userRole }: PaiementCardProps) => {
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectNotes, setRejectNotes] = useState('');

    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const canValidate = isAdmin && paiement.statut === 'EN_ATTENTE';

    const handleValidate = async () => {
        setIsProcessing(true);
        const result = await validerPaiement({ id: paiement.id });

        if (result.success) {
            toast.success(result.message);
            onUpdate();
        } else {
            toast.error(result.message);
        }

        setIsProcessing(false);
        setShowValidateDialog(false);
    };

    const handleReject = async () => {
        if (!rejectNotes.trim()) {
            toast.error("Veuillez indiquer la raison du rejet");
            return;
        }

        setIsProcessing(true);
        const result = await rejeterPaiement({ id: paiement.id, notes: rejectNotes });

        if (result.success) {
            toast.success(result.message);
            onUpdate();
        } else {
            toast.error(result.message);
        }

        setIsProcessing(false);
        setShowRejectDialog(false);
        setRejectNotes('');
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-linear-to-br from-green-500 to-green-600 rounded-lg">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{paiement.montant} FCFA</CardTitle>
                                <CardDescription className="text-sm">
                                    {paiement.commande.numero}
                                </CardDescription>
                            </div>
                        </div>
                        {canValidate && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setShowValidateDialog(true)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Valider
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowRejectDialog(true)}
                                        className="text-red-600"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Rejeter
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Étudiant</span>
                            <span className="font-medium">{paiement.commande.etudiant.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Méthode</span>
                            <span className="font-medium">{paiement.methodePaiement}</span>
                        </div>
                        {paiement.reference && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Référence</span>
                                <span className="font-medium">{paiement.reference}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Badge className={statutColors[paiement.statut as keyof typeof statutColors]}>
                                {statutLabels[paiement.statut as keyof typeof statutLabels]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {new Date(paiement.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        {paiement.notes && (
                            <>
                                <Separator />
                                <div className="text-sm">
                                    <p className="text-muted-foreground mb-1">Notes:</p>
                                    <p className="text-xs">{paiement.notes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Validation */}
            <AlertDialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Valider le paiement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir valider ce paiement de {paiement.montant} FCFA ?
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

            {/* Dialog Rejet */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter le paiement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Veuillez indiquer la raison du rejet de ce paiement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label>Raison du rejet</Label>
                        <Textarea
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                            placeholder="Expliquez pourquoi ce paiement est rejeté..."
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessing ? "Rejet..." : "Rejeter"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
