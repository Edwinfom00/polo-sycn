"use client";

import { MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
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
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useConfirm } from "@/hooks/use-confirm";

import { UserGetOne } from "../../types";
import { deleteUser } from "../../actions";

interface UserCardProps {
    user: UserGetOne;
    onEdit?: (user: UserGetOne) => void;
    onDelete?: () => void;
}

const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrateur',
    DELEGUE: 'Délégué',
    ETUDIANT: 'Étudiant',
};

const roleColors = {
    SUPER_ADMIN: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    ADMIN: 'bg-blue-500 text-white',
    DELEGUE: 'bg-green-500 text-white',
    ETUDIANT: 'bg-gray-500 text-white',
};

export const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Supprimer le membre",
        "Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible."
    );

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

    return (
        <>
            <ConfirmDialog />
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <GeneratedAvatar
                                seed={user.name}
                                variant="botttsNeutral"
                                className="size-12 border"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user.name}</p>
                                <Badge className={`${roleColors[user.role]} mt-1`}>
                                    {roleLabels[user.role]}
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
        </>
    );
};
