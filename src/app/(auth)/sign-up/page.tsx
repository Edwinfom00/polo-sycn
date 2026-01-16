

import { auth } from '@/lib/auth';
import { SignUpView } from '@/modules/auth/ui/views/sign-up-view';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { filiere, classe } from '@/db/schema';
import { eq } from 'drizzle-orm';

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!!session) {
        redirect('/');
    }

    // Charger les filières et classes actives
    const [filieres, classes] = await Promise.all([
        db.select().from(filiere).where(eq(filiere.actif, true)),
        db.select().from(classe).where(eq(classe.actif, true)),
    ]);

    return (
        <SignUpView filieres={filieres} classes={classes} />
    )
}

export default Page