"use client";

import {
    HomeIcon,
    UserIcon,
    ShoppingCartIcon,
    CreditCardIcon,
    TruckIcon,
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
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";

const menuItems = [
    {
        icon: HomeIcon,
        label: "Accueil",
        href: "/etudiant"
    },
    {
        icon: UserIcon,
        label: "Mon Profil",
        href: "/etudiant/profil"
    },
    {
        icon: ShoppingCartIcon,
        label: "Mes Commandes",
        href: "/etudiant/commandes"
    },
    {
        icon: CreditCardIcon,
        label: "Mes Paiements",
        href: "/etudiant/paiements"
    },
    {
        icon: TruckIcon,
        label: "Mes Livraisons",
        href: "/etudiant/livraisons"
    },
];

export const EtudiantSidebar = () => {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/etudiant" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logo.png" height={100} width={100} alt="logo" />
                    <div>
                        <p className="text-2xl font-semibold">PoloSync</p>
                        <p className="text-xs text-muted-foreground">Espace Étudiant</p>
                    </div>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-10 text-[#5D6B68]" />
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68] from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                            pathname === item.href && "bg-linear-to-r/oklch border-[#5D6B68]/10"
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
