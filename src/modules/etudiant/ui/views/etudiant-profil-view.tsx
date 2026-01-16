"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, GraduationCap, Calendar, Shield } from "lucide-react";

interface EtudiantProfilViewProps {
    user: any;
    classeInfo: any;
}

export const EtudiantProfilView = ({ user, classeInfo }: EtudiantProfilViewProps) => {
    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Mon Profil</h1>
                <p className="text-muted-foreground">
                    Informations personnelles et académiques
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Informations personnelles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informations Personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Nom complet</p>
                            <p className="text-lg font-semibold">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </p>
                            <p className="text-lg">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Rôle
                            </p>
                            <Badge className="bg-purple-500">Étudiant</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Membre depuis
                            </p>
                            <p className="text-lg">
                                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Informations académiques */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Informations Académiques
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {classeInfo ? (
                            <>
                                <div>
                                    <p className="text-sm text-muted-foreground">Filière</p>
                                    <p className="text-lg font-semibold">{classeInfo.filiere?.nom || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">{classeInfo.filiere?.code || ''}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Classe</p>
                                    <p className="text-lg font-semibold">{classeInfo.nom}</p>
                                    <p className="text-sm text-muted-foreground">{classeInfo.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Niveau</p>
                                    <Badge variant="outline">{classeInfo.niveau}</Badge>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    Aucune classe assignée
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Statut du compte */}
            <Card>
                <CardHeader>
                    <CardTitle>Statut du Compte</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Email vérifié</p>
                            <p className="text-sm text-muted-foreground">
                                Votre adresse email est {user.emailVerified ? 'vérifiée' : 'non vérifiée'}
                            </p>
                        </div>
                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                            {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
