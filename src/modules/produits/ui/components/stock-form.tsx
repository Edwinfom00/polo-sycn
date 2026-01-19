"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { stockInsertSchema } from "../../schemas";
import { ProduitGetOne, TailleGetOne, CouleurGetOne } from "../../types";
import { createStock, createTaille, createCouleur, getTailles, getCouleurs } from "../../actions";
import { getClosestColorHex } from "@/lib/utils/color-helper";

interface StockFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    produits: ProduitGetOne[];
    tailles: TailleGetOne[];
    couleurs: CouleurGetOne[];
}

export const StockForm = ({
    onSuccess,
    onCancel,
    produits,
    tailles: initialTailles,
    couleurs: initialCouleurs
}: StockFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [tailles, setTailles] = useState<TailleGetOne[]>(initialTailles);
    const [couleurs, setCouleurs] = useState<CouleurGetOne[]>(initialCouleurs);

    // Dialogs pour créer taille/couleur
    const [showTailleDialog, setShowTailleDialog] = useState(false);
    const [showCouleurDialog, setShowCouleurDialog] = useState(false);
    const [newTailleName, setNewTailleName] = useState("");
    const [newCouleurName, setNewCouleurName] = useState("");
    const [newCouleurHex, setNewCouleurHex] = useState("#000000");
    const [creating, setCreating] = useState(false);

    const form = useForm<z.infer<typeof stockInsertSchema>>({
        resolver: zodResolver(stockInsertSchema),
        defaultValues: {
            produitId: '',
            tailleId: '',
            couleurId: '',
            quantiteDisponible: 0,
            seuilAlerte: 10,
        },
    });

    const onSubmit = (data: z.infer<typeof stockInsertSchema>) => {
        startTransition(async () => {
            const result = await createStock(data);

            if (result.success) {
                toast.success(result.message);
                onSuccess?.();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleCreateTaille = async () => {
        if (!newTailleName.trim()) {
            toast.error("Veuillez entrer un nom de taille");
            return;
        }

        setCreating(true);
        const result = await createTaille({ nom: newTailleName.trim() });
        setCreating(false);

        if (result.success && result.data) {
            toast.success(result.message);
            setTailles([...tailles, result.data]);
            form.setValue('tailleId', result.data.id);
            setShowTailleDialog(false);
            setNewTailleName("");
        } else {
            toast.error(result.message);
        }
    };

    const handleCreateCouleur = async () => {
        if (!newCouleurName.trim()) {
            toast.error("Veuillez entrer un nom de couleur");
            return;
        }

        setCreating(true);
        const result = await createCouleur({
            nom: newCouleurName.trim(),
            codeHex: newCouleurHex,
        });
        setCreating(false);

        if (result.success && result.data) {
            toast.success(result.message);
            setCouleurs([...couleurs, result.data]);
            form.setValue('couleurId', result.data.id);
            setShowCouleurDialog(false);
            setNewCouleurName("");
            setNewCouleurHex("#000000");
        } else {
            toast.error(result.message);
        }
    };

    // Détection automatique de la couleur basée sur le nom
    const handleColorNameChange = (name: string) => {
        setNewCouleurName(name);

        // Essayer de détecter automatiquement la couleur
        const detectedHex = getClosestColorHex(name);
        if (detectedHex) {
            setNewCouleurHex(detectedHex);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="produitId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Produit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {produits.map((produit) => (
                                        <SelectItem key={produit.id} value={produit.id}>
                                            {produit.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tailleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taille</FormLabel>
                            <div className="flex gap-2">
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl className="flex-1">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une taille" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tailles.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                Aucune taille disponible
                                            </div>
                                        ) : (
                                            tailles.map((taille) => (
                                                <SelectItem key={taille.id} value={taille.id}>
                                                    {taille.nom}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowTailleDialog(true)}
                                    title="Créer une nouvelle taille"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="couleurId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Couleur</FormLabel>
                            <div className="flex gap-2">
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl className="flex-1">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une couleur" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {couleurs.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                Aucune couleur disponible
                                            </div>
                                        ) : (
                                            couleurs.map((couleur) => (
                                                <SelectItem key={couleur.id} value={couleur.id}>
                                                    <div className="flex items-center gap-2">
                                                        {couleur.codeHex && (
                                                            <div
                                                                className="w-4 h-4 rounded border"
                                                                style={{ backgroundColor: couleur.codeHex }}
                                                            />
                                                        )}
                                                        {couleur.nom}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowCouleurDialog(true)}
                                    title="Créer une nouvelle couleur"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="quantiteDisponible"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantité disponible</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="seuilAlerte"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Seuil d'alerte</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                        {isPending ? 'En cours...' : 'Créer'}
                    </Button>
                </div>
            </form>

            {/* Dialog pour créer une taille */}
            <Dialog open={showTailleDialog} onOpenChange={setShowTailleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle taille</DialogTitle>
                        <DialogDescription>
                            Ajoutez une nouvelle taille pour vos produits
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom de la taille *</Label>
                            <Input
                                value={newTailleName}
                                onChange={(e) => setNewTailleName(e.target.value)}
                                placeholder="Ex: S, M, L, XL, 38, 40..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateTaille();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowTailleDialog(false);
                                    setNewTailleName("");
                                }}
                                disabled={creating}
                            >
                                Annuler
                            </Button>
                            <Button onClick={handleCreateTaille} disabled={creating}>
                                {creating ? 'Création...' : 'Créer'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog pour créer une couleur */}
            <Dialog open={showCouleurDialog} onOpenChange={setShowCouleurDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle couleur</DialogTitle>
                        <DialogDescription>
                            Ajoutez une nouvelle couleur pour vos produits
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom de la couleur *</Label>
                            <Input
                                value={newCouleurName}
                                onChange={(e) => handleColorNameChange(e.target.value)}
                                placeholder="Ex: Rouge, Bleu, Noir..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                💡 La couleur sera détectée automatiquement
                            </p>
                        </div>
                        <div>
                            <Label>Code couleur</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={newCouleurHex}
                                    onChange={(e) => setNewCouleurHex(e.target.value)}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={newCouleurHex}
                                    onChange={(e) => setNewCouleurHex(e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Modifiable manuellement si besoin
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCouleurDialog(false);
                                    setNewCouleurName("");
                                    setNewCouleurHex("#000000");
                                }}
                                disabled={creating}
                            >
                                Annuler
                            </Button>
                            <Button onClick={handleCreateCouleur} disabled={creating}>
                                {creating ? 'Création...' : 'Créer'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Form>
    );
};
