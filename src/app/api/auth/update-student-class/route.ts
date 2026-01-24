import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { user, classe } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Vérifier la session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { filiereId, niveau, classe: classeName } = body;

        if (!filiereId || !niveau || !classeName) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Créer le nom complet de la classe (ex: "L3 Info A")
        const nomComplet = `${niveau} ${classeName}`;
        const code = `${niveau}-${classeName.replace(/\s+/g, '-').toUpperCase()}`;

        // Vérifier si la classe existe déjà
        let existingClasse = await db
            .select()
            .from(classe)
            .where(
                and(
                    eq(classe.filiereId, filiereId),
                    eq(classe.code, code)
                )
            )
            .limit(1);

        let classeId: string;

        if (existingClasse.length > 0) {
            // La classe existe déjà
            classeId = existingClasse[0].id;
        } else {
            // Créer une nouvelle classe
            const [newClasse] = await db
                .insert(classe)
                .values({
                    nom: nomComplet,
                    code: code,
                    niveau: niveau,
                    filiereId: filiereId,
                    actif: true,
                })
                .returning();

            classeId = newClasse.id;
        }

        // Mettre à jour la classe de l'utilisateur
        await db
            .update(user)
            .set({ classeId })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la classe:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
