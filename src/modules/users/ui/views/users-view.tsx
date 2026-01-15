"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, UsersIcon, SearchIcon } from "lucide-react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UserForm } from "../components/user-form";
import { UserGrid } from "../components/user-grid";
import { UserGetOne, UserStats } from "../../types";

interface UsersViewProps {
    initialUsers: UserGetOne[];
    stats: UserStats;
}

export const UsersView = ({ initialUsers, stats }: UsersViewProps) => {
    const [users] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserGetOne | null>(null);

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditingUser(null);
        // Recharger la page pour obtenir les données à jour
        window.location.reload();
    };

    return (
        <>
            <div className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion du personnel</h1>
                        <p className="text-muted-foreground">
                            Créer et gérer les comptes administrateurs et délégués de classe
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nouveau membre
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Admins & Délégués
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.admins}</div>
                            <p className="text-xs text-muted-foreground">
                                Super Admin & Admin
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Délégués</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.delegues}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.delegues > 1 ? 'délégués de classe' : 'délégué de classe'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Liste du personnel</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Les étudiants s'inscrivent eux-mêmes via la page d'inscription publique
                                </p>
                            </div>
                            <div className="relative w-64">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <UserGrid
                            users={filteredUsers}
                            onEdit={setEditingUser}
                            onDelete={handleSuccess}
                        />
                    </CardContent>
                </Card>
            </div>

            <ResponsiveDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Créer un membre du personnel"
                description="Ajouter un administrateur ou un délégué de classe"
            >
                <UserForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                title="Modifier le membre"
                description="Mettre à jour les informations du membre du personnel"
            >
                {editingUser && (
                    <UserForm
                        initialValues={editingUser}
                        onSuccess={handleSuccess}
                        onCancel={() => setEditingUser(null)}
                    />
                )}
            </ResponsiveDialog>
        </>
    );
};
