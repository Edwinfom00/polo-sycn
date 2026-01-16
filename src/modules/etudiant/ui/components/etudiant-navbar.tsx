"use client";

import { PanelLeftClose, PanelLeftIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export const EtudiantNavbar = () => {
    const { state, toggleSidebar, isMobile } = useSidebar();

    return (
        <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-background">
            <Button className="size-9" variant="outline" onClick={toggleSidebar}>
                {(state === "collapsed" || isMobile) ? <PanelLeftIcon className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
            <div className="flex-1">
                <h2 className="text-sm font-medium text-muted-foreground">Mon Espace Étudiant</h2>
            </div>
        </nav>
    );
};
