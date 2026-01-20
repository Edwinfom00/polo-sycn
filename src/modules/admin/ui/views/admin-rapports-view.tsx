"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    TrendingUp,
    Users,
    Package,
    CreditCard,
    Truck,
    ShoppingCart,
    AlertTriangle,
    Download,
    FileText,
} from "lucide-react";
import { toast } from "sonner";

interface RapportsStats {
    global: {
        totalCommandes: number;
        commandesEnAttente: number;
        commandesPayees: number;
        commandesValidees: number;
        commandesLivrees: number;
        totalPaiements: number;
        paiementsEnAttente: number;
        paiementsValides: number;
        montantTotal: number;
        montantPaye: number;
        totalLivraisons: number;
        stockTotal: number;
        stockFaible: number;
        totalEtudiants: number;
        totalClasses: number;
    };
    parClasse: Array<{
        classeNom: string;
        classeCode: string;
        totalCommandes: number;
        montantTotal: number;
        montantPaye: number;
    }>;
    parStatut: Array<{
        statut: string;
        count: number;
    }>;
    produitsPopulaires: Array<{
        nom: string;
        quantite: number;
        commandes: number;
    }>;
}

interface AdminRapportsViewProps {
    stats: RapportsStats | null;
}

const getStatutLabel = (statut: string) => {
    switch (statut) {
        case 'EN_ATTENTE': return 'En attente';
        case 'PAYE': return 'Payé';
        case 'VALIDE': return 'Validé';
        case 'LIVRE': return 'Livré';
        default: return statut;
    }
};

const exportToPDF = async (stats: RapportsStats) => {
    try {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const doc = new jsPDF();
        const date = new Date().toLocaleDateString('fr-FR');

        // Titre
        doc.setFontSize(20);
        doc.text('Rapport TWYZ', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Généré le ${date}`, 105, 22, { align: 'center' });

        let yPos = 35;

        // Stats globales
        doc.setFontSize(16);
        doc.text('Statistiques Globales', 14, yPos);
        yPos += 10;

        autoTable(doc, {
            startY: yPos,
            head: [['Indicateur', 'Valeur']],
            body: [
                ['Total Commandes', stats.global.totalCommandes.toString()],
                ['Commandes en attente', stats.global.commandesEnAttente.toString()],
                ['Commandes payées', stats.global.commandesPayees.toString()],
                ['Commandes validées', stats.global.commandesValidees.toString()],
                ['Commandes livrées', stats.global.commandesLivrees.toString()],
                ['Montant total', `${stats.global.montantTotal.toLocaleString('fr-FR')} FCFA`],
                ['Montant payé', `${stats.global.montantPaye.toLocaleString('fr-FR')} FCFA`],
                ['Total paiements', stats.global.totalPaiements.toString()],
                ['Paiements en attente', stats.global.paiementsEnAttente.toString()],
                ['Total livraisons', stats.global.totalLivraisons.toString()],
                ['Stock total', stats.global.stockTotal.toString()],
                ['Stock faible', stats.global.stockFaible.toString()],
                ['Total étudiants', stats.global.totalEtudiants.toString()],
                ['Total classes', stats.global.totalClasses.toString()],
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Stats par classe
        if (stats.parClasse.length > 0) {
            doc.setFontSize(16);
            doc.text('Activité par Classe', 14, yPos);
            yPos += 10;

            autoTable(doc, {
                startY: yPos,
                head: [['Classe', 'Code', 'Commandes', 'Montant Total', 'Montant Payé']],
                body: stats.parClasse.map(c => [
                    c.classeNom,
                    c.classeCode,
                    c.totalCommandes.toString(),
                    `${c.montantTotal.toLocaleString('fr-FR')} FCFA`,
                    `${c.montantPaye.toLocaleString('fr-FR')} FCFA`,
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // Nouvelle page si nécessaire
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        // Produits populaires
        if (stats.produitsPopulaires.length > 0) {
            doc.setFontSize(16);
            doc.text('Produits les Plus Commandés', 14, yPos);
            yPos += 10;

            autoTable(doc, {
                startY: yPos,
                head: [['Produit', 'Quantité', 'Commandes']],
                body: stats.produitsPopulaires.map(p => [
                    p.nom,
                    p.quantite.toString(),
                    p.commandes.toString(),
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
            });
        }

        // Sauvegarder
        doc.save(`rapport-twyz-${date}.pdf`);
        toast.success('Rapport exporté en PDF');
    } catch (error) {
        console.error('Erreur export PDF:', error);
        toast.error('Erreur lors de l\'export PDF');
    }
};

export const AdminRapportsView = ({ stats }: AdminRapportsViewProps) => {
    if (!stats) {
        return (
            <div className="flex-1 space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
                    <p className="text-muted-foreground">Erreur lors du chargement des données</p>
                </div>
            </div>
        );
    }

    const tauxPaiement = stats.global.montantTotal > 0
        ? (stats.global.montantPaye / stats.global.montantTotal) * 100
        : 0;

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
                    <p className="text-muted-foreground">Vue d'ensemble des activités</p>
                </div>
                <Button onClick={() => exportToPDF(stats)}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter en PDF
                </Button>
            </div>

            {/* Stats principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.global.totalCommandes}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.global.commandesEnAttente} en attente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.global.montantPaye.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            sur {stats.global.montantTotal.toLocaleString('fr-FR')} FCFA
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
                        <Truck className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.global.totalLivraisons}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.global.commandesLivrees} commandes livrées
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.global.stockTotal}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.global.stockFaible} en alerte
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Taux de paiement */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Taux de Paiement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Progression</span>
                            <span className="text-2xl font-bold text-green-600">
                                {tauxPaiement.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-green-600 h-4 rounded-full transition-all"
                                style={{ width: `${tauxPaiement}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Montant total</p>
                                <p className="font-bold">{stats.global.montantTotal.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Montant payé</p>
                                <p className="font-bold text-green-600">
                                    {stats.global.montantPaye.toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Répartition par statut */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Répartition des Commandes par Statut
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.parStatut.map((item) => {
                            const total = stats.global.totalCommandes;
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;

                            return (
                                <div key={item.statut} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{getStatutLabel(item.statut)}</span>
                                        <span className="text-muted-foreground">
                                            {item.count} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${item.statut === 'EN_ATTENTE' ? 'bg-yellow-500' :
                                                item.statut === 'PAYE' ? 'bg-blue-500' :
                                                    item.statut === 'VALIDE' ? 'bg-green-500' :
                                                        'bg-purple-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Activité par classe */}
            {stats.parClasse.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Activité par Classe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Classe</th>
                                        <th className="text-left py-3 px-4 font-medium">Code</th>
                                        <th className="text-right py-3 px-4 font-medium">Commandes</th>
                                        <th className="text-right py-3 px-4 font-medium">Montant Total</th>
                                        <th className="text-right py-3 px-4 font-medium">Montant Payé</th>
                                        <th className="text-right py-3 px-4 font-medium">Taux</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.parClasse.map((classe, idx) => {
                                        const taux = classe.montantTotal > 0
                                            ? (classe.montantPaye / classe.montantTotal) * 100
                                            : 0;

                                        return (
                                            <tr key={idx} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">{classe.classeNom}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{classe.classeCode}</td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    {classe.totalCommandes}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {classe.montantTotal.toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td className="py-3 px-4 text-right text-green-600 font-medium">
                                                    {classe.montantPaye.toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`font-medium ${taux >= 80 ? 'text-green-600' : taux >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                                                        {taux.toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Produits populaires */}
            {stats.produitsPopulaires.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Produits les Plus Commandés
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.produitsPopulaires.map((produit, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{produit.nom}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {produit.commandes} commande{produit.commandes > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">{produit.quantite}</p>
                                        <p className="text-xs text-muted-foreground">unités</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alertes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Alertes & Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.global.stockFaible > 0 && (
                            <div className="flex items-center gap-3 p-3 border rounded-lg border-orange-200 bg-orange-50">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                <div className="flex-1">
                                    <p className="font-medium">Stock faible</p>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.global.stockFaible} article{stats.global.stockFaible > 1 ? 's' : ''} nécessite{stats.global.stockFaible > 1 ? 'nt' : ''} un réapprovisionnement
                                    </p>
                                </div>
                            </div>
                        )}
                        {stats.global.paiementsEnAttente > 0 && (
                            <div className="flex items-center gap-3 p-3 border rounded-lg border-blue-200 bg-blue-50">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                    <p className="font-medium">Paiements en attente</p>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.global.paiementsEnAttente} paiement{stats.global.paiementsEnAttente > 1 ? 's' : ''} nécessite{stats.global.paiementsEnAttente > 1 ? 'nt' : ''} votre validation
                                    </p>
                                </div>
                            </div>
                        )}
                        {stats.global.commandesValidees > 0 && (
                            <div className="flex items-center gap-3 p-3 border rounded-lg border-green-200 bg-green-50">
                                <ShoppingCart className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="font-medium">Commandes validées</p>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.global.commandesValidees} commande{stats.global.commandesValidees > 1 ? 's sont' : ' est'} prête{stats.global.commandesValidees > 1 ? 's' : ''} pour la livraison
                                    </p>
                                </div>
                            </div>
                        )}
                        {stats.global.stockFaible === 0 && stats.global.paiementsEnAttente === 0 && stats.global.commandesValidees === 0 && (
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="font-medium">Aucune alerte</p>
                                    <p className="text-sm text-muted-foreground">Tout est en ordre</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
