"use client";

import { useState } from "react";
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
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useConfirm } from "@/hooks/use-confirm";

import { UserGetOne } from "../../types";
import { deleteUser } from "../../actions";

interface UserListProps {
    users: UserGetOne[];
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
    SUPER_ADMIN: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    ADMIN: 'bg-blue-500',
    DELEGUE: 'bg-green-500',
    ETUDIANT: 'bg-gray-500',
};

export const UserList = ({ users, onEdit, onDelete }: UserListProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Supprimer l'utilisateur",
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
    );

    const handleDelete = async (user: UserGetOne) => {
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

    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Aucun utilisateur trouvé</p>
            </div>
        );
    }

    return (
        <>
            <ConfirmDialog />
            <div className="space-y-2">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                    >
                        <div className="flex items-center gap-4">
                            <GeneratedAvatar
                                seed={user.name}
                                variant="botttsNeutral"
                                className="size-12 border"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user.name}</p>
                                    <Badge className={roleColors[user.role]}>
                                        {roleLabels[user.role]}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit?.(user)}>
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(user)}
                                    className="text-destructive"
                                >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        </>
    );
};
