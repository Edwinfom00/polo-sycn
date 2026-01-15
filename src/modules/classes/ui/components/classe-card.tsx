"use client";

import { MoreHorizontalIcon, PencilIcon, TrashIcon, UsersIcon } from "lucide-react";
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

import { ClasseWithFiliere } from "../../types";
import { deleteClasse } from "../../actions";

interface ClasseCardProps {
    classe: ClasseWithFiliere;
    studentsCount?: number;
    onEdit?: (classe: ClasseWithFiliere) => void;
    onDelete?: () => void;
}

export const ClasseCard = ({ classe, studentsCount = 0, onEdit, onDelete }: ClasseCardProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Supprimer la classe",
        "Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible."
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        const result = await deleteClasse({ id: classe.id });

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
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                                <UsersIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{classe.nom}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline">{classe.code}</Badge>
                                    <Badge variant="secondary">{classe.niveau}</Badge>
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit?.(classe)}>
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
                        {classe.filiere && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">Filière : </span>
                                <span className="font-medium">{classe.filiere.nom}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span>{studentsCount} étudiant{studentsCount > 1 ? 's' : ''}</span>
                            <span>{classe.actif ? '✓ Active' : '✗ Inactive'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
