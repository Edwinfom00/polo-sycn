"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Download,
    Filter,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    CreditCard,
    Package,
    PackageMinusIcon,
    Users,
    Calendar as CalendarIcon,
    BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { RapportComplet } from "../../types";

interface RapportCompletViewProps {
    initialData: RapportComplet;
    classes: Array<{ id: string; nom: string; code: string }>;
    filieres: Array<{ id: string; nom: string; code: string }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const statutLabels: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    PAYE: 'Payé',
    VALIDE: 'Validé',
    LIVRE: 'Livré',
    ANNULE: 'Annulé',
};

const sortieTypeLabels: Record<string, string> = {
    PERTE: 'Perte',
    DON: 'Don',
    DEFAUT: 'Défaut',
    AJUSTEMENT: 'Ajustement',
    AUTRE: 'Autre',
};

export const RapportCompletView = ({ initialData, classes, filieres }: RapportCompletViewProps) => {
    const [data] = useState(initialData);
    const [dateDebut, setDateDebut] = useState<Date>();
    const [dateFin, setDateFin] = useState<Date>();
    const [classeId, setClasseId] = useState<string>();
    const [filiereId, setFiliereId] = useState<string>();

    const tauxPaiement = data.commandes.montants.total > 0
        ? (data.commandes.montants.paye / data.commandes.montants.total) * 100
        : 0;

    const tauxLivraison = data.commandes.total > 0
        ? (data.livraisons.total / data.commandes.total) * 100
        : 0;

    const exportToPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();
            const date = new Date().toLocaleDateString('fr-FR');

            // Titre
            doc.setFontSize(20);
            doc.text('Rapport Complet TWYZ', 105, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Période: ${format(data.periode.debut, 'dd/MM/yyyy', { locale: fr })} - ${format(data.periode.fin, 'dd/MM/yyyy', { locale: fr })}`, 105, 22, { align: 'center' });
            doc.text(`Généré le ${date}`, 105, 27, { align: 'center' });

            let yPos = 40;

            // Vue d'ensemble
            doc.setFontSize(14);
            doc.text('Vue d\'ensemble', 14, yPos);
            yPos += 7;

            autoTable(doc, {
                startY: yPos,
                head: [['Indicateur', 'Valeur']],
                body: [
                    ['Total Commandes', data.commandes.total.toString()],
                    ['Montant Total', `${data.commandes.montants.total.toLocaleString('fr-FR')} FCFA`],
                    ['Montant Payé', `${data.commandes.montants.paye.toLocaleString('fr-FR')} FCFA`],
                    ['Taux de Paiement', `${tauxPaiement.toFixed(1)}%`],
                    ['Total Paiements', data.paiements.total.toString()],
                    ['Total Livraisons', data.livraisons.total.toString()],
                    ['Stock Disponible', data.stock.disponible.toString()],
                    ['Sorties de Stock', data.sorties.total.toString()],
                ],
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // Commandes par statut
            doc.setFontSize(14);
            doc.text('Commandes par Statut', 14, yPos);
            yPos += 7;

            autoTable(doc, {
                startY: yPos,
                head: [['Statut', 'Nombre', 'Montant']],
                body: data.commandes.parStatut.map(s => [
                    statutLabels[s.statut] || s.statut,
                    s.count.toString(),
                    `${s.montant.toLocaleString('fr-FR')} FCFA`,
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // Nouvelle page
            doc.addPage();
            yPos = 20;

            // Top produits
            doc.setFontSize(14);
            doc.text('Top 10 Produits', 14, yPos);
            yPos += 7;

            autoTable(doc, {
                startY: yPos,
                head: [['Produit', 'Quantité', 'Commandes', 'Montant']],
                body: data.topProduits.map(p => [
                    p.nom,
                    p.quantite.toString(),
                    p.commandes.toString(),
                    `${p.montant.toLocaleString('fr-FR')} FCFA`,
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // Performance par classe
            if (data.performanceClasses.length > 0) {
                doc.addPage();
                yPos = 20;

                doc.setFontSize(14);
                doc.text('Performance par Classe', 14, yPos);
                yPos += 7;

                autoTable(doc, {
                    startY: yPos,
                    head: [['Classe', 'Filière', 'Commandes', 'Montant', 'Taux Paiement']],
                    body: data.performanceClasses.map(c => [
                        `${c.nom} (${c.code})`,
                        c.filiere,
                        c.commandes.toString(),
                        `${c.montantTotal.toLocaleString('fr-FR')} FCFA`,
                        `${c.tauxPaiement.toFixed(1)}%`,
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                });
            }

            doc.save(`rapport-twyz-${date}.pdf`);
            toast.success('Rapport exporté en PDF');
        } catch (error) {
            console.error('Erreur export PDF:', error);
            toast.error('Erreur lors de l\'export PDF');
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
                    <p className="text-muted-foreground">
                        Période: {format(data.periode.debut, 'dd MMM yyyy', { locale: fr })} - {format(data.periode.fin, 'dd MMM yyyy', { locale: fr })}
                    </p>
                </div>
                <Button onClick={exportToPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter PDF
                </Button>
            </div>

            {/* KPIs principaux */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{data.commandes.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.commandes.montants.total.toLocaleString('fr-FR')} FCFA
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux de Paiement</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{tauxPaiement.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {data.commandes.montants.paye.toLocaleString('fr-FR')} FCFA payés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock</CardTitle>
                        <Package className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{data.stock.disponible}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.stock.faible} en alerte
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sorties</CardTitle>
                        <PackageMinusIcon className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{data.sorties.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.sorties.quantite} unités sorties
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Commandes par statut */}
                <Card>
                    <CardHeader>
                        <CardTitle>Commandes par Statut</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.commandes.parStatut.map(s => ({
                                        name: statutLabels[s.statut] || s.statut,
                                        value: s.count,
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.commandes.parStatut.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Paiements par méthode */}
                <Card>
                    <CardHeader>
                        <CardTitle>Paiements par Méthode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.paiements.parMethode}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="methode" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} FCFA`} />
                                <Bar dataKey="montant" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Évolution temporelle */}
            <Card>
                <CardHeader>
                    <CardTitle>Évolution des Commandes</CardTitle>
                    <CardDescription>Nombre et montant par jour</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.commandes.evolution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Nombre" />
                            <Line yAxisId="right" type="monotone" dataKey="montant" stroke="#10b981" name="Montant (FCFA)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top produits */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Produits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.topProduits.map((produit, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
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
                                    <p className="text-lg font-bold text-primary">{produit.quantite}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {produit.montant.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance par classe */}
            {data.performanceClasses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Performance par Classe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Classe</th>
                                        <th className="text-left py-3 px-4 font-medium">Filière</th>
                                        <th className="text-right py-3 px-4 font-medium">Étudiants</th>
                                        <th className="text-right py-3 px-4 font-medium">Commandes</th>
                                        <th className="text-right py-3 px-4 font-medium">Montant</th>
                                        <th className="text-right py-3 px-4 font-medium">Taux Paiement</th>
                                        <th className="text-right py-3 px-4 font-medium">Moy/Étudiant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.performanceClasses.map((classe, idx) => (
                                        <tr key={idx} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium">{classe.nom}</p>
                                                    <p className="text-xs text-muted-foreground">{classe.code}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{classe.filiere}</td>
                                            <td className="py-3 px-4 text-right">{classe.etudiants}</td>
                                            <td className="py-3 px-4 text-right font-medium">{classe.commandes}</td>
                                            <td className="py-3 px-4 text-right">
                                                {classe.montantTotal.toLocaleString('fr-FR')} FCFA
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`font-medium ${classe.tauxPaiement >= 80 ? 'text-green-600' : classe.tauxPaiement >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                                                    {classe.tauxPaiement.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-muted-foreground">
                                                {classe.moyenneParEtudiant.toLocaleString('fr-FR')} FCFA
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sorties par type */}
            {data.sorties.parType.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sorties de Stock par Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.sorties.parType.map(s => ({
                                type: sortieTypeLabels[s.type] || s.type,
                                quantite: s.quantite,
                                count: s.count,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="quantite" fill="#f59e0b" name="Quantité" />
                                <Bar dataKey="count" fill="#ef4444" name="Nombre de sorties" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
