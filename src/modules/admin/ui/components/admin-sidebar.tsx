"use client";

import {
    HomeIcon,
    ShoppingCartIcon,
    CreditCardIcon,
    TruckIcon,
    PackageIcon,
    BarChartIcon,
    UsersIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";

const mainMenu = [
    {
        icon: HomeIcon,
        label: "Accueil",
        href: "/admin"
    },
];

const operationsMenu = [
    {
        icon: ShoppingCartIcon,
        label: "Commandes",
        href: "/admin/commandes"
    },
    {
        icon: CreditCardIcon,
        label: "Paiements",
        href: "/admin/paiements"
    },
    {
        icon: TruckIcon,
        label: "Livraisons",
        href: "/admin/livraisons"
    },
    {
        icon: PackageIcon,
        label: "Stock",
        href: "/admin/stock"
    },
    {
        icon: UsersIcon,
        label: "Étudiants",
        href: "/admin/etudiants"
    },
];

const reportsMenu = [
    {
        icon: BarChartIcon,
        label: "Rapports",
        href: "/admin/rapports"
    },
];

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/admin" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logo.png" height={100} width={100} alt="logo" />
                    <div>
                        <p className="text-2xl font-semibold">TWYZ</p>
                        <p className="text-xs text-muted-foreground">Administration</p>
                    </div>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-10" />
            </div>
            <SidebarContent>
                {/* Menu principal */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            "h-10 hover:bg-sidebar-accent/50 border border-transparent hover:border-sidebar-accent",
                                            pathname === item.href && "bg-sidebar-accent border-sidebar-accent"
                                        )}
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-5" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="opacity-10" />
                </div>

                {/* Menu opérations */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
                        Opérations
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {operationsMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            "h-10 hover:bg-sidebar-accent/50 border border-transparent hover:border-sidebar-accent",
                                            pathname.startsWith(item.href) && "bg-sidebar-accent border-sidebar-accent"
                                        )}
                                        isActive={pathname.startsWith(item.href)}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-5" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="opacity-10" />
                </div>

                {/* Menu rapports */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {reportsMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            "h-10 hover:bg-sidebar-accent/50 border border-transparent hover:border-sidebar-accent",
                                            pathname === item.href && "bg-sidebar-accent border-sidebar-accent"
                                        )}
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-5" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-white">
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    );
};
