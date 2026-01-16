"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    Search,
    Eye,
    GraduationCap,
    ShoppingCart,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Plus,
    RefreshCw,
    Copy,
    Check,
} from "lucide-react";
import { createUser } from "@/modules/users/actions";
import { toast } from "sonner";
import { generatePassword, copyToClipboard } from "@/lib/utils/password-generator";

interface Etudiant {
    id: string;
    name: string;
    email: string;
    classe: {
        nom: string;
        code: string;
    } | null;
    filiere: {
        nom: string;
    } | null;
    stats: {
        totalCommandes: number;
        commandesEnAttente: number;
        commandesPayees: number;
        commandesValidees: number;
        commandesLivrees: number;
        montantTotal: number;
        montantPaye: number;
    };
}

interface AdminEtudiantsViewProps {
    etudiants: Etudiant[];
    classes?: Array<{ id: string; nom: string; code: string }>;
    isSuperAdmin?: boolean;
}

export const AdminEtudiantsView = ({ etudiants: initialEtudiants, classes = [], isSuperAdmin = false }: AdminEtudiantsViewProps) => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string, password: string } | null>(null);

    // Debug log
    console.log('AdminEtudiantsView - isSuperAdmin:', isSuperAdmin);

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [classeId, setClasseId] = useState("");

    const itemsPerPage = 12;

    const filteredEtudiants = initialEtudiants.filter(e =>
        search === "" ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.classe?.nom.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredEtudiants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEtudiants = filteredEtudiants.slice(startIndex, endIndex);

    const stats = {
        total: initialEtudiants.length,
        avecCommandes: initialEtudiants.filter(e => e.stats.totalCommandes > 0).length,
        sansCommandes: initialEtudiants.filter(e => e.stats.totalCommandes === 0).length,
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleGeneratePassword = () => {
        const newPassword = generatePassword(12);
        setPassword(newPassword);
        toast.success("Mot de passe généré");
    };

    const handleCopyPassword = async () => {
        const success = await copyToClipboard(password);
        if (success) {
            setCopiedPassword(true);
            toast.success("Mot de passe copié");
            setTimeout(() => setCopiedPassword(false), 2000);
        } else {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleCopyEmail = async () => {
        const success = await copyToClipboard(email);
        if (success) {
            setCopiedEmail(true);
            toast.success("Email copié");
            setTimeout(() => setCopiedEmail(false), 2000);
        } else {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleCopyCredentials = async () => {
        if (generatedCredentials) {
            const text = `Email: ${generatedCredentials.email}\nMot de passe: ${generatedCredentials.password}`;
            const success = await copyToClipboard(text);
            if (success) {
                toast.success("Identifiants copiés");
            } else {
                toast.error("Erreur lors de la copie");
            }
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setLoading(true);
        try {
            const result = await createUser({
                name: name.trim(),
                email: email.trim(),
                password,
                role: 'ETUDIANT',
                classeId: classeId || null,
            });

            if (result.success) {
                // Sauvegarder les identifiants pour pouvoir les copier
                setGeneratedCredentials({
                    email: email.trim(),
                    password: password,
                });
                toast.success(result.message);
                setName("");
                setEmail("");
                setPassword("");
                setClasseId("");
                // Ne pas fermer le dialog immédiatement pour permettre la copie
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Étudiants</h1>
                    <p className="text-muted-foreground">Consultez la liste des étudiants et leurs commandes</p>
                </div>
                {isSuperAdmin && (
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-primary hover:bg-primary/90"
                        size="lg"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Créer un étudiant
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total étudiants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avec commandes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.avecCommandes}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sans commandes</CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.sansCommandes}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom, email ou classe..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {currentEtudiants.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucun étudiant trouvé</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {currentEtudiants.map((etudiant) => (
                            <Card key={etudiant.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {getInitials(etudiant.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">{etudiant.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground truncate">{etudiant.email}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {etudiant.classe && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{etudiant.classe.nom}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Commandes:</span>
                                            <span className="font-bold">{etudiant.stats.totalCommandes}</span>
                                        </div>
                                        {etudiant.stats.totalCommandes > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Montant total:</span>
                                                    <span className="font-medium">
                                                        {etudiant.stats.montantTotal.toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Payé:</span>
                                                    <span className="font-medium text-green-600">
                                                        {etudiant.stats.montantPaye.toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {etudiant.stats.totalCommandes > 0 && (
                                        <div className="flex gap-1 flex-wrap pt-2">
                                            {etudiant.stats.commandesEnAttente > 0 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {etudiant.stats.commandesEnAttente} en attente
                                                </Badge>
                                            )}
                                            {etudiant.stats.commandesPayees > 0 && (
                                                <Badge className="text-xs bg-blue-500">
                                                    {etudiant.stats.commandesPayees} payées
                                                </Badge>
                                            )}
                                            {etudiant.stats.commandesLivrees > 0 && (
                                                <Badge className="text-xs bg-purple-500">
                                                    {etudiant.stats.commandesLivrees} livrées
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Link href={`${isSuperAdmin ? '/super-admin' : '/admin'}/etudiants/${etudiant.id}`} className="w-full">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir détails
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8"
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Modal de création */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un étudiant</DialogTitle>
                        <DialogDescription>
                            Créez un nouveau compte étudiant
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom complet *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Jean Dupont"
                                disabled={generatedCredentials !== null}
                            />
                        </div>
                        <div>
                            <Label>Email *</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ex: jean.dupont@example.com"
                                    disabled={generatedCredentials !== null}
                                    className="flex-1"
                                />
                                {generatedCredentials && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyEmail}
                                    >
                                        {copiedEmail ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label>Mot de passe *</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 caractères"
                                    disabled={generatedCredentials !== null}
                                    className="flex-1"
                                />
                                {!generatedCredentials && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleGeneratePassword}
                                        title="Générer un mot de passe"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                )}
                                {generatedCredentials && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyPassword}
                                    >
                                        {copiedPassword ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                        {classes.length > 0 && (
                            <div>
                                <Label>Classe (optionnel)</Label>
                                <Select value={classeId} onValueChange={setClasseId} disabled={generatedCredentials !== null}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une classe (optionnel)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((classe) => (
                                            <SelectItem key={classe.id} value={classe.id}>
                                                {classe.nom} ({classe.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {generatedCredentials && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                <p className="text-sm font-medium text-green-900">✓ Étudiant créé avec succès!</p>
                                <p className="text-xs text-green-700">Copiez les identifiants avant de fermer cette fenêtre.</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyCredentials}
                                    className="w-full"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copier tous les identifiants
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {!generatedCredentials ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateDialog(false);
                                        setName("");
                                        setEmail("");
                                        setPassword("");
                                        setClasseId("");
                                    }}
                                    disabled={loading}
                                >
                                    Annuler
                                </Button>
                                <Button onClick={handleCreate} disabled={loading}>
                                    {loading ? 'Création...' : 'Créer'}
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => {
                                    setShowCreateDialog(false);
                                    setName("");
                                    setEmail("");
                                    setPassword("");
                                    setClasseId("");
                                    setGeneratedCredentials(null);
                                    setCopiedPassword(false);
                                    setCopiedEmail(false);
                                    window.location.reload();
                                }}
                                className="w-full"
                            >
                                Fermer et actualiser
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
