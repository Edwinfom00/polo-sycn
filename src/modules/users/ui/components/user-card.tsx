"use client";

import { MoreHorizontalIcon, PencilIcon, TrashIcon, KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useConfirm } from "@/hooks/use-confirm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { UserGetOne } from "../../types";
import { deleteUser, regenerateCredentials } from "../../actions";

interface UserCardProps {
    user: UserGetOne;
    onEdit?: (user: UserGetOne) => void;
    onDelete?: () => void;
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrateur',
    ETUDIANT: 'Étudiant',
};

const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    ADMIN: 'bg-blue-500 text-white',
    ETUDIANT: 'bg-gray-500 text-white',
};

export const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Supprimer le membre",
        "Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible."
    );
    const [showCredentials, setShowCredentials] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        const result = await deleteUser({ id: user.id });

        if (result.success) {
            toast.success(result.message);
            onDelete?.();
        } else {
            toast.error(result.message);
        }
    };

    const handleRegenerateCredentials = async () => {
        setIsRegenerating(true);
        const result = await regenerateCredentials(user.id);
        setIsRegenerating(false);

        if (result.success && result.data) {
            setNewCredentials(result.data);
            setShowCredentials(true);
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const handleCopyCredentials = async () => {
        if (newCredentials) {
            const text = `Email: ${newCredentials.email}\nMot de passe: ${newCredentials.password}`;
            try {
                await navigator.clipboard.writeText(text);
                toast.success("Identifiants copiés");
            } catch {
                toast.error("Erreur lors de la copie");
            }
        }
    };

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    return (
        <>
            <ConfirmDialog />
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <GeneratedAvatar
                                seed={user.name}
                                variant="initials"
                                className="size-12 border"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user.name}</p>
                                <Badge className={`${roleColors[user.role] || 'bg-gray-500 text-white'} mt-1`}>
                                    {roleLabels[user.role] || user.role}
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
                                <DropdownMenuItem onClick={() => onEdit?.(user)}>
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Modifier
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem onClick={handleRegenerateCredentials} disabled={isRegenerating}>
                                        <KeyRoundIcon className="h-4 w-4 mr-2" />
                                        {isRegenerating ? 'Régénération...' : 'Régénérer identifiants'}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-destructive"
                                >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveaux identifiants générés</DialogTitle>
                        <DialogDescription>
                            Copiez ces identifiants avant de fermer cette fenêtre. Ils ne seront plus affichés.
                        </DialogDescription>
                    </DialogHeader>
                    {newCredentials && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={newCredentials.email} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Nouveau mot de passe</Label>
                                <Input value={newCredentials.password} readOnly />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleCopyCredentials} className="flex-1">
                                    Copier les identifiants
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCredentials(false);
                                        setNewCredentials(null);
                                    }}
                                    className="flex-1"
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
