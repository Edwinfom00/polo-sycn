"use client";

import { useState } from "react";
import { FiliereCard } from "./filiere-card";
import { FiliereGetOne } from "../../types";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";

interface FiliereGridProps {
    filieres: FiliereGetOne[];
    onEdit?: (filiere: FiliereGetOne) => void;
    onDelete?: () => void;
}

const ITEMS_PER_PAGE = 9;

export const FiliereGrid = ({ filieres, onEdit, onDelete }: FiliereGridProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(filieres.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentFilieres = filieres.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (filieres.length === 0) {
        return (
            <EmptyState
                title="Aucune filière"
                description="Commencez par créer une filière académique (Informatique, Gestion, Droit, etc.)"
                image="/empty.svg"
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentFilieres.map((filiere) => (
                    <FiliereCard
                        key={filiere.id}
                        filiere={filiere}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} sur {totalPages} ({filieres.length} filière{filieres.length > 1 ? 's' : ''})
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeftIcon className="h-4 w-4 mr-1" />
                            Précédent
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(page)}
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
