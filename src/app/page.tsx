import { getCurrentUser } from '@/lib/auth-utils';
import { redirectByRole } from '@/lib/redirect-by-role';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Vérifier si l'utilisateur est connecté
  const user = await getCurrentUser();

  // Si connecté, rediriger vers le dashboard selon le rôle
  if (user) {
    redirectByRole(user.role as any);
  }

  // Sinon, rediriger vers la page de connexion
  redirect('/sign-in');
}
