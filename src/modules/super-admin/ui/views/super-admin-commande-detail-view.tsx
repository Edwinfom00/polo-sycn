"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Truck,
    Package,
    User,
    GraduationCap,
    Calendar,
    FileText,
} from "lucide-react";
import type { CommandeGetOne } from "@/modules/commandes/types";
import { validerCommande, annulerCommande } from "@/modules/commandes/actions";
import { toast } from "sonner";

interface SuperAdminCommandeDetailViewProps {
    commande: CommandeGetOne;
    backUrl?: string;
}

const getStatusBadge = (statut: string) => {
    switch (statut) {
        case 'EN_ATTENTE':
            return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
        case 'PAYE':
            return <Badge className="gap-1 bg-blue-500"><CreditCard className="h-3 w-3" />Payé</Badge>;
        case 'VALIDE':
            return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Validé</Badge>;
        case 'LIVRE':
            return <Badge className="gap-1 bg-purple-500"><Truck className="h-3 w-3" />Livré</Badge>;
        case 'ANNULE':
            return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Annulé</Badge>;
        default:
            return <Badge variant="outline">{statut}</Badge>;
    }
};

export const SuperAdminCommandeDetailView = ({ commande, backUrl = "/super-admin/orders" }: SuperAdminCommandeDetailViewProps) => {
    const router = useRouter();
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [notes, setNotes] = useState("");
    const [pending, setPending] = useState(false);

    const handleValider = async () => {
        setPending(true);
        const result = await validerCommande({
            id: commande.id,
            notes: notes || null,
        });
        setPending(false);

        if (result.success) {
            toast.success("Commande validée avec succès");
            setShowValidateDialog(false);
            router.refresh();
        } else {
            toast.error(result.message || "Erreur lors de la validation");
        }
    };

    const handleAnnuler = async () => {
        setPending(true);
        const result = await annulerCommande(commande.id);
        setPending(false);

        if (result.success) {
            toast.success("Commande annulée avec succès");
            setShowCancelDialog(false);
            router.refresh();
        } else {
            toast.error(result.message || "Erreur lors de l'annulation");
        }
    };

    const peutValider = commande.statut === 'PAYE';
    const peutAnnuler = commande.statut !== 'LIVRE' && commande.statut !== 'ANNULE';

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={backUrl}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{commande.numero}</h1>
                        <p className="text-muted-foreground">Détails de la commande</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(commande.statut)}
                    {peutValider && (
                        <Button onClick={() => setShowValidateDialog(true)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Valider
                        </Button>
                    )}
                    {peutAnnuler && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annuler
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Informations générales */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Étudiant
                                </p>
                                <p className="font-medium">{commande.etudiant.name}</p>
                                <p className="text-sm text-muted-foreground">{commande.etudiant.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Classe
                                </p>
                                <p className="font-medium">{commande.classe.nom}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date de commande
                                </p>
                                <p className="font-medium">
                                    {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {commande.valideAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Date de validation
                                    </p>
                                    <p className="font-medium">
                                        {new Date(commande.valideAt).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {commande.notes && (
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4" />
                                    Notes
                                </p>
                                <p className="text-sm bg-muted p-3 rounded-md">{commande.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Montants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Montants</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Montant Total</p>
                            <p className="text-2xl font-bold">
                                {parseFloat(commande.montantTotal).toLocaleString('fr-FR')} FCFA
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground">Montant Payé</p>
                            <p className="text-xl font-semibold text-green-600">
                                {parseFloat(commande.montantPaye).toLocaleString('fr-FR')} FCFA
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground">Reste à Payer</p>
                            <p className="text-xl font-semibold text-orange-600">
                                {(parseFloat(commande.montantTotal) - parseFloat(commande.montantPaye)).toLocaleString('fr-FR')} FCFA
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Articles commandés */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Articles Commandés
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {commande.lignes.map((ligne, index) => (
                            <div key={ligne.id}>
                                {index > 0 && <Separator className="my-4" />}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <h4 className="font-semibold">{ligne.produit.nom}</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>Taille: <Badge variant="outline">{ligne.taille.nom}</Badge></span>
                                            <span className="flex items-center gap-2">
                                                Couleur:
                                                <Badge variant="outline" className="gap-2">
                                                    {ligne.couleur.codeHex && (
                                                        <div
                                                            className="w-3 h-3 rounded border"
                                                            style={{ backgroundColor: ligne.couleur.codeHex }}
                                                        />
                                                    )}
                                                    {ligne.couleur.nom}
                                                </Badge>
                                            </span>
                                            <span>Quantité: <strong>{ligne.quantite}</strong></span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Prix unitaire</p>
                                        <p className="font-medium">
                                            {parseFloat(ligne.prixUnitaire).toLocaleString('fr-FR')} FCFA
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">Sous-total</p>
                                        <p className="text-lg font-bold">
                                            {parseFloat(ligne.sousTotal).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de validation */}
            <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Valider la commande</DialogTitle>
                        <DialogDescription>
                            Cette action va réserver le stock pour cette commande.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Notes (optionnel)</label>
                            <Textarea
                                placeholder="Ajouter des notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowValidateDialog(false)}
                                disabled={pending}
                            >
                                Annuler
                            </Button>
                            <Button onClick={handleValider} disabled={pending}>
                                {pending ? "Validation..." : "Valider la commande"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog d'annulation */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Annuler la commande ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pending}>Retour</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAnnuler}
                            disabled={pending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {pending ? "Annulation..." : "Oui, annuler"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
