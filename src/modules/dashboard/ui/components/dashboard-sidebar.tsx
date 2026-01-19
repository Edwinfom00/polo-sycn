"use client";

import {
    UsersIcon,
    PackageIcon,
    ShoppingCartIcon,
    CreditCardIcon,
    TruckIcon,
    BarChartIcon,
    SettingsIcon,
    GraduationCapIcon
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

import { DashboardUserButton } from "./dashboard-user-button";


const mainMenu = [
    {
        icon: BarChartIcon,
        label: "Dashboard",
        href: "/super-admin"
    },
];

const adminMenu = [
    {
        icon: UsersIcon,
        label: "Utilisateurs",
        href: "/super-admin/admin/users"
    },
    {
        icon: GraduationCapIcon,
        label: "Classes & Filières",
        href: "/super-admin/admin/classes"
    },
    {
        icon: PackageIcon,
        label: "Produits & Stock",
        href: "/super-admin/admin/products"
    },
];

const operationsMenu = [
    {
        icon: ShoppingCartIcon,
        label: "Commandes",
        href: "/super-admin/orders"
    },
    {
        icon: CreditCardIcon,
        label: "Paiements",
        href: "/super-admin/payments"
    },
    {
        icon: TruckIcon,
        label: "Livraisons",
        href: "/super-admin/deliveries"
    },
    {
        icon: UsersIcon,
        label: "Étudiants",
        href: "/super-admin/etudiants"
    },
];

const settingsMenu = [
    {
        icon: SettingsIcon,
        label: "Paramètres",
        href: "/super-admin/settings"
    },
];

export const DashboadSidebar = () => {

    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/super-admin" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logo.png" height={100} width={100} alt="logo" />
                    <div>
                        <p className="text-2xl font-semibold">TWYZ</p>
                        <p className="text-xs text-muted-foreground">Super Admin</p>
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

                {/* Menu administration */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
                        Administration
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminMenu.map((item) => (
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

                {/* Menu paramètres */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsMenu.map((item) => (
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
    )
}
