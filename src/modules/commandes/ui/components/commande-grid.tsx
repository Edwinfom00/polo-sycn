"use client";

import { CommandeGetOne } from "../../types";
import { CommandeCard } from "./commande-card";
import { EmptyState } from "@/components/empty-state";

interface CommandeGridProps {
    commandes: CommandeGetOne[];
    onUpdate: () => void;
    userRole: string;
}

export const CommandeGrid = ({ commandes, onUpdate, userRole }: CommandeGridProps) => {
    if (commandes.length === 0) {
        return (
            <EmptyState
                title="Aucune commande"
                description="Aucune commande n'a été passée pour le moment"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commandes.map((commande) => (
                <CommandeCard
                    key={commande.id}
                    commande={commande}
                    onUpdate={onUpdate}
                    userRole={userRole}
                />
            ))}
        </div>
    );
};
