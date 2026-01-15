"use client";

import { MoreHorizontalIcon, PencilIcon, TrashIcon, GraduationCapIcon } from "lucide-react";
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

import { FiliereGetOne } from "../../types";
import { deleteFiliere } from "../../actions";

interface FiliereCardProps {
    filiere: FiliereGetOne;
    classesCount?: number;
    onEdit?: (filiere: FiliereGetOne) => void;
    onDelete?: () => void;
}

export const FiliereCard = ({ filiere, classesCount = 0, onEdit, onDelete }: FiliereCardProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Supprimer la filière",
        "Êtes-vous sûr de vouloir supprimer cette filière ? Cette action est irréversible."
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        const result = await deleteFiliere({ id: filiere.id });

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
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <GraduationCapIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{filiere.nom}</p>
                                <Badge variant="outline" className="mt-1">
                                    {filiere.code}
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
                                <DropdownMenuItem onClick={() => onEdit?.(filiere)}>
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
                        {filiere.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {filiere.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span>{classesCount} classe{classesCount > 1 ? 's' : ''}</span>
                            <span>{filiere.actif ? '✓ Active' : '✗ Inactive'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
