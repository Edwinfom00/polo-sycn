"use client";

import { MoreHorizontalIcon, TrashIcon, PackageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useConfirm } from "@/hooks/use-confirm";

import { SortieGetOne } from "../../types";
import { deleteSortie, validerSortie } from "../../actions";
import { SORTIE_TYPE_LABELS, SORTIE_TYPE_COLORS, METHODE_VALORISATION_LABELS } from "../../constants";

interface SortieCardProProps {
    sortie: SortieGetOne;
    onDelete?: () => void;
    canValidate?: boolean;
}

export const SortieCardPro = ({ sortie, onDelete, canValidate = false }: SortieCardProProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Supprimer la sortie",
        "Êtes-vous sûr de vouloir supprimer cette sortie ? Le stock sera restauré."
    );

    const [ValidateDialog, confirmValidate] = useConfirm(
        "Valider la sortie",
        "Êtes-vous sûr de vouloir valider cette sortie ? Cette action est irréversible."
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        const result = await deleteSortie({ id: sortie.id });

        if (result.success) {
            toast.success(result.message);
            onDelete?.();
        } else {
            toast.error(result.message);
        }
    };

    const handleValidate = async () => {
        const ok = await confirmValidate();
        if (!ok) return;

        const result = await validerSortie({ id: sortie.id });

        if (result.success) {
            toast.success(result.message);
            onDelete?.(); // Refresh
        } else {
            toast.error(result.message);
        }
    };

    const totalQuantite = sortie.lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const isValidee = !!sortie.validePar;

    return (
        <>
            <ConfirmDialog />
            <ValidateDialog />
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                                <PackageIcon className="h-5 w-5 text-muted-foreground" />
                                <p className="font-semibold">{sortie.numero}</p>
                                {isValidee && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Validée
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={`${SORTIE_TYPE_COLORS[sortie.type]} text-white`}>
                                    {SORTIE_TYPE_LABELS[sortie.type]}
                                </Badge>
                                <Badge variant="outline">
                                    {METHODE_VALORISATION_LABELS[sortie.methodeValorisation]}
                                </Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canValidate && !isValidee && (
                                    <DropdownMenuItem onClick={handleValidate}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Valider
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="text-sm">
                            <span className="font-medium">Motif:</span> {sortie.motif}
                        </div>

                        {sortie.destinationDepot && (
                            <div className="text-sm">
                                <span className="font-medium">Destination:</span> {sortie.destinationDepot}
                            </div>
                        )}

                        {sortie.referenceExterne && (
                            <div className="text-sm">
                                <span className="font-medium">Référence:</span> {sortie.referenceExterne}
                            </div>
                        )}

                        {sortie.notes && (
                            <div className="text-sm text-muted-foreground">
                                {sortie.notes}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div>
                                <p className="text-xs text-muted-foreground">Quantité totale</p>
                                <p className="text-lg font-semibold">{totalQuantite}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Coût total</p>
                                <p className="text-lg font-semibold text-orange-600">
                                    {Number(sortie.coutTotal).toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </div>

                        <div className="text-sm">
                            <span className="font-medium">Articles:</span> {sortie.lignes.length}
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
                            <div>Par: {sortie.effectuePar.name}</div>
                            <div>Le: {new Date(sortie.effectueAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</div>
                            {isValidee && sortie.valideAt && (
                                <div className="text-green-600">
                                    Validée le: {new Date(sortie.valideAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Détails des lignes */}
                        <div className="pt-2 border-t">
                            <p className="text-xs font-medium mb-2">Détails:</p>
                            <div className="space-y-1">
                                {sortie.lignes.slice(0, 3).map((ligne, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                                        <span>
                                            {ligne.stock.produit.nom} - {ligne.stock.taille.nom} - {ligne.stock.couleur.nom}
                                        </span>
                                        <span className="font-medium">×{ligne.quantite}</span>
                                    </div>
                                ))}
                                {sortie.lignes.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                        +{sortie.lignes.length - 3} autre(s) article(s)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
