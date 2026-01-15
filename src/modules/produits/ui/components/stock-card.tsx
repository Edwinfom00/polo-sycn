"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Package, AlertTriangle, Plus, Minus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { StockGetOne } from "../../types";
import { deleteStock, ajusterStock, updateStock } from "../../actions";

interface StockCardProps {
    stock: StockGetOne;
    onUpdate: () => void;
}

export const StockCard = ({ stock, onUpdate }: StockCardProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAjustDialog, setShowAjustDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAjusting, setIsAjusting] = useState(false);
    const [ajustType, setAjustType] = useState<'AJOUT' | 'RETRAIT'>('AJOUT');
    const [ajustQuantite, setAjustQuantite] = useState(0);
    const [editQuantite, setEditQuantite] = useState(stock.quantiteDisponible);
    const [editSeuil, setEditSeuil] = useState(stock.seuilAlerte);

    const isLowStock = stock.quantiteDisponible <= stock.seuilAlerte;
    const isOutOfStock = stock.quantiteDisponible === 0;

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteStock(stock.id);

        if (result.success) {
            toast.success(result.message);
            onUpdate();
        } else {
            toast.error(result.message);
        }

        setIsDeleting(false);
        setShowDeleteDialog(false);
    };

    const handleAjust = async () => {
        if (ajustQuantite <= 0) {
            toast.error("La quantité doit être supérieure à 0");
            return;
        }

        setIsAjusting(true);
        const result = await ajusterStock({
            id: stock.id,
            quantite: ajustQuantite,
            type: ajustType,
        });

        if (result.success) {
            toast.success(result.message);
            onUpdate();
            setShowAjustDialog(false);
            setAjustQuantite(0);
        } else {
            toast.error(result.message);
        }

        setIsAjusting(false);
    };

    const handleEdit = async () => {
        const result = await updateStock({
            id: stock.id,
            quantiteDisponible: editQuantite,
            seuilAlerte: editSeuil,
        });

        if (result.success) {
            toast.success(result.message);
            onUpdate();
            setShowEditDialog(false);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <>
            <Card className={`hover:shadow-md transition-shadow ${isOutOfStock ? 'border-red-300' : isLowStock ? 'border-orange-300' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{stock.produit.nom}</CardTitle>
                                <CardDescription className="text-sm">
                                    {stock.taille.nom} • {stock.couleur.nom}
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
                                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    setAjustType('AJOUT');
                                    setShowAjustDialog(true);
                                }}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter stock
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    setAjustType('RETRAIT');
                                    setShowAjustDialog(true);
                                }}>
                                    <Minus className="mr-2 h-4 w-4" />
                                    Retirer stock
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Disponible</span>
                            <span className={`text-lg font-semibold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                                {stock.quantiteDisponible}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Réservé</span>
                            <span>{stock.quantiteReservee}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Livré</span>
                            <span>{stock.quantiteLivree}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Seuil alerte</span>
                            <span>{stock.seuilAlerte}</span>
                        </div>
                        {stock.couleur.codeHex && (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded border"
                                    style={{ backgroundColor: stock.couleur.codeHex }}
                                />
                                <span className="text-sm text-muted-foreground">{stock.couleur.codeHex}</span>
                            </div>
                        )}
                        {isLowStock && (
                            <Badge variant="destructive" className="w-full justify-center">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {isOutOfStock ? 'Rupture de stock' : 'Stock faible'}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Ajustement */}
            <Dialog open={showAjustDialog} onOpenChange={setShowAjustDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {ajustType === 'AJOUT' ? 'Ajouter du stock' : 'Retirer du stock'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Quantité actuelle</Label>
                            <p className="text-2xl font-bold">{stock.quantiteDisponible}</p>
                        </div>
                        <div>
                            <Label>Quantité à {ajustType === 'AJOUT' ? 'ajouter' : 'retirer'}</Label>
                            <Input
                                type="number"
                                min="1"
                                value={ajustQuantite}
                                onChange={(e) => setAjustQuantite(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="flex justify-between gap-x-2">
                            <Button
                                variant="ghost"
                                disabled={isAjusting}
                                onClick={() => setShowAjustDialog(false)}
                            >
                                Annuler
                            </Button>
                            <Button onClick={handleAjust} disabled={isAjusting}>
                                {isAjusting ? 'En cours...' : 'Confirmer'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Modification */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le stock</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Quantité disponible</Label>
                            <Input
                                type="number"
                                min="0"
                                value={editQuantite}
                                onChange={(e) => setEditQuantite(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <Label>Seuil d'alerte</Label>
                            <Input
                                type="number"
                                min="0"
                                value={editSeuil}
                                onChange={(e) => setEditSeuil(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="flex justify-between gap-x-2">
                            <Button
                                variant="ghost"
                                onClick={() => setShowEditDialog(false)}
                            >
                                Annuler
                            </Button>
                            <Button onClick={handleEdit}>
                                Mettre à jour
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Suppression */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce stock ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
