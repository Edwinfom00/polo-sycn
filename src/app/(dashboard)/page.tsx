import { requireAuth } from "@/lib/auth-utils";
import { HomeView } from "@/modules/home/ui/views/home-view";

const Page = async () => {
  const user = await requireAuth();

  return (
    <HomeView user={{
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user as any).role
    }} />
  );
};

export default Page;