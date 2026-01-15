"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Package, AlertTriangle, Box } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { ProduitGrid } from "../components/produit-grid";
import { StockGrid } from "../components/stock-grid";
import { ProduitForm } from "../components/produit-form";
import { StockForm } from "../components/stock-form";
import { ProduitGetOne, StockGetOne, TailleGetOne, CouleurGetOne } from "../../types";
import {
    getProduits,
    getStocks,
    getTailles,
    getCouleurs,
    getStockStats,
} from "../../actions";
import { SimplePagination } from "@/components/simple-pagination";
import { EmptyState } from "@/components/empty-state";

export const ProduitsView = () => {
    const [activeTab, setActiveTab] = useState("produits");
    const [showProduitDialog, setShowProduitDialog] = useState(false);
    const [showStockDialog, setShowStockDialog] = useState(false);

    // Produits
    const [produits, setProduits] = useState<ProduitGetOne[]>([]);
    const [produitsTotal, setProduitsTotal] = useState(0);
    const [produitsPage, setProduitsPage] = useState(1);
    const [produitsSearch, setProduitsSearch] = useState("");

    // Stock
    const [stocks, setStocks] = useState<StockGetOne[]>([]);
    const [stocksTotal, setStocksTotal] = useState(0);
    const [stocksPage, setStocksPage] = useState(1);

    // Helpers
    const [tailles, setTailles] = useState<TailleGetOne[]>([]);
    const [couleurs, setCouleurs] = useState<CouleurGetOne[]>([]);

    // Stats
    const [stats, setStats] = useState({
        totalStock: 0,
        stockFaible: 0,
        produitsActifs: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    const loadProduits = useCallback(async () => {
        const result = await getProduits({
            page: produitsPage,
            limit: 9,
            search: produitsSearch,
        });

        if (result.success && result.data) {
            setProduits(result.data.produits);
            setProduitsTotal(result.data.total);
        }
    }, [produitsPage, produitsSearch]);

    const loadStocks = useCallback(async () => {
        const result = await getStocks({
            page: stocksPage,
            limit: 9,
        });

        if (result.success && result.data) {
            setStocks(result.data.stocks);
            setStocksTotal(result.data.total);
        }
    }, [stocksPage]);

    const loadHelpers = async () => {
        const [taillesResult, couleursResult] = await Promise.all([
            getTailles(),
            getCouleurs(),
        ]);

        if (taillesResult.success && taillesResult.data) {
            setTailles(taillesResult.data);
        }

        if (couleursResult.success && couleursResult.data) {
            setCouleurs(couleursResult.data);
        }
    };

    const loadStats = async () => {
        const result = await getStockStats();
        if (result.success && result.data) {
            setStats(result.data);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([
                loadProduits(),
                loadStocks(),
                loadHelpers(),
                loadStats(),
            ]);
            setIsLoading(false);
        };
        init();
    }, [loadProduits, loadStocks]);

    const handleProduitSuccess = () => {
        setShowProduitDialog(false);
        loadProduits();
        loadStats();
    };

    const handleStockSuccess = () => {
        setShowStockDialog(false);
        loadStocks();
        loadStats();
    };

    const produitsPageCount = Math.ceil(produitsTotal / 9);
    const stocksPageCount = Math.ceil(stocksTotal / 9);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    // Vérifier si on a des produits avant d'afficher le contenu
    const hasProduits = produits.length > 0;

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header avec stats */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Produits & Stock</h1>
                        <p className="text-muted-foreground">
                            Gérez vos produits et leur stock
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Produits Actifs
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.produitsActifs}</div>
                            <p className="text-xs text-muted-foreground">
                                Types de produits disponibles
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Stock Total
                            </CardTitle>
                            <Box className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStock}</div>
                            <p className="text-xs text-muted-foreground">
                                Unités disponibles
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Alertes Stock
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.stockFaible}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Articles en stock faible
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="produits">Produits</TabsTrigger>
                    <TabsTrigger value="stock">Stock</TabsTrigger>
                </TabsList>

                {/* Onglet Produits */}
                <TabsContent value="produits" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un produit..."
                                value={produitsSearch}
                                onChange={(e) => {
                                    setProduitsSearch(e.target.value);
                                    setProduitsPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => setShowProduitDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau produit
                        </Button>
                    </div>

                    <ProduitGrid produits={produits} onUpdate={loadProduits} />

                    {produitsPageCount > 1 && (
                        <div className="flex justify-center">
                            <SimplePagination
                                currentPage={produitsPage}
                                totalPages={produitsPageCount}
                                onPageChange={setProduitsPage}
                            />
                        </div>
                    )}
                </TabsContent>

                {/* Onglet Stock */}
                <TabsContent value="stock" className="space-y-4">
                    {!hasProduits ? (
                        <EmptyState
                            title="Aucun produit disponible"
                            description="Créez d'abord des produits avant de gérer le stock"
                            action={
                                <Button onClick={() => {
                                    setActiveTab("produits");
                                    setShowProduitDialog(true);
                                }}>
                                    Créer un produit
                                </Button>
                            }
                        />
                    ) : (
                        <>
                            <div className="flex justify-end">
                                <Button onClick={() => setShowStockDialog(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter stock
                                </Button>
                            </div>

                            <StockGrid stocks={stocks} onUpdate={loadStocks} />

                            {stocksPageCount > 1 && (
                                <div className="flex justify-center">
                                    <SimplePagination
                                        currentPage={stocksPage}
                                        totalPages={stocksPageCount}
                                        onPageChange={setStocksPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <Dialog open={showProduitDialog} onOpenChange={setShowProduitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau produit</DialogTitle>
                    </DialogHeader>
                    <ProduitForm
                        onSuccess={handleProduitSuccess}
                        onCancel={() => setShowProduitDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter du stock</DialogTitle>
                    </DialogHeader>
                    <StockForm
                        produits={produits}
                        tailles={tailles}
                        couleurs={couleurs}
                        onSuccess={handleStockSuccess}
                        onCancel={() => setShowStockDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};
