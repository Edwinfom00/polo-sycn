"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, GraduationCapIcon, UsersIcon, SearchIcon } from "lucide-react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { FiliereForm } from "../components/filiere-form";
import { ClasseForm } from "../components/classe-form";
import { FiliereGrid } from "../components/filiere-grid";
import { ClasseGrid } from "../components/classe-grid";
import { FiliereGetOne, ClasseWithFiliere, ClasseStats } from "../../types";

interface ClassesViewProps {
    initialFilieres: FiliereGetOne[];
    initialClasses: ClasseWithFiliere[];
    stats: ClasseStats;
    delegues: { id: string; name: string; email: string }[];
}

export const ClassesView = ({
    initialFilieres,
    initialClasses,
    stats,
    delegues
}: ClassesViewProps) => {
    const [filieres] = useState(initialFilieres);
    const [classes] = useState(initialClasses);
    const [searchFiliere, setSearchFiliere] = useState("");
    const [searchClasse, setSearchClasse] = useState("");

    const [isCreateFiliereOpen, setIsCreateFiliereOpen] = useState(false);
    const [isCreateClasseOpen, setIsCreateClasseOpen] = useState(false);
    const [editingFiliere, setEditingFiliere] = useState<FiliereGetOne | null>(null);
    const [editingClasse, setEditingClasse] = useState<ClasseWithFiliere | null>(null);

    const filteredFilieres = filieres.filter((filiere) =>
        filiere.nom.toLowerCase().includes(searchFiliere.toLowerCase()) ||
        filiere.code.toLowerCase().includes(searchFiliere.toLowerCase())
    );

    const filteredClasses = classes.filter((classe) =>
        classe.nom.toLowerCase().includes(searchClasse.toLowerCase()) ||
        classe.code.toLowerCase().includes(searchClasse.toLowerCase())
    );

    const handleSuccess = () => {
        setIsCreateFiliereOpen(false);
        setIsCreateClasseOpen(false);
        setEditingFiliere(null);
        setEditingClasse(null);
        window.location.reload();
    };

    return (
        <>
            <div className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Classes & Filières</h1>
                        <p className="text-muted-foreground">
                            Gérer les filières académiques et les classes
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Filières</CardTitle>
                            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalFilieres}</div>
                            <p className="text-xs text-muted-foreground">
                                filière{stats.totalFilieres > 1 ? 's' : ''} académique{stats.totalFilieres > 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalClasses}</div>
                            <p className="text-xs text-muted-foreground">
                                classe{stats.totalClasses > 1 ? 's' : ''} créée{stats.totalClasses > 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Classes Actives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.classesActives}</div>
                            <p className="text-xs text-muted-foreground">
                                en cours cette année
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="classes" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="classes">Classes</TabsTrigger>
                        <TabsTrigger value="filieres">Filières</TabsTrigger>
                    </TabsList>

                    <TabsContent value="classes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Liste des classes</CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground mt-2">
                                            Gérer les classes par filière et niveau
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col items-start gap-2">
                                        <div className="relative w-64">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Rechercher..."
                                                value={searchClasse}
                                                onChange={(e) => setSearchClasse(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <Button onClick={() => setIsCreateClasseOpen(true)}>
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Nouvelle classe
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ClasseGrid
                                    classes={filteredClasses}
                                    onEdit={setEditingClasse}
                                    onDelete={handleSuccess}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="filieres" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Liste des filières</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Gérer les filières académiques
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-64">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Rechercher..."
                                                value={searchFiliere}
                                                onChange={(e) => setSearchFiliere(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <Button onClick={() => setIsCreateFiliereOpen(true)}>
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Nouvelle filière
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <FiliereGrid
                                    filieres={filteredFilieres}
                                    onEdit={setEditingFiliere}
                                    onDelete={handleSuccess}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialogs Filière */}
            <ResponsiveDialog
                open={isCreateFiliereOpen}
                onOpenChange={setIsCreateFiliereOpen}
                title="Créer une filière"
                description="Ajouter une nouvelle filière académique"
            >
                <FiliereForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateFiliereOpen(false)}
                />
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!editingFiliere}
                onOpenChange={(open) => !open && setEditingFiliere(null)}
                title="Modifier la filière"
                description="Mettre à jour les informations de la filière"
            >
                {editingFiliere && (
                    <FiliereForm
                        initialValues={editingFiliere}
                        onSuccess={handleSuccess}
                        onCancel={() => setEditingFiliere(null)}
                    />
                )}
            </ResponsiveDialog>

            {/* Dialogs Classe */}
            <ResponsiveDialog
                open={isCreateClasseOpen}
                onOpenChange={setIsCreateClasseOpen}
                title="Créer une classe"
                description="Ajouter une nouvelle classe"
            >
                <ClasseForm
                    filieres={filieres}
                    delegues={delegues}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateClasseOpen(false)}
                />
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!editingClasse}
                onOpenChange={(open) => !open && setEditingClasse(null)}
                title="Modifier la classe"
                description="Mettre à jour les informations de la classe"
            >
                {editingClasse && (
                    <ClasseForm
                        initialValues={editingClasse}
                        filieres={filieres}
                        delegues={delegues}
                        onSuccess={handleSuccess}
                        onCancel={() => setEditingClasse(null)}
                    />
                )}
            </ResponsiveDialog>
        </>
    );
};
