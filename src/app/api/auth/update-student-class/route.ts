import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
        const { classeId } = body;

        if (!classeId) {
            return NextResponse.json(
                { error: 'classeId est requis' },
                { status: 400 }
            );
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
