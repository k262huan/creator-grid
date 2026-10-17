import { UserButton } from "@clerk/nextjs";

import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const { user, workspace } = await initializeCurrentUserWorkspace();

  return (
    <main>
      <header>
        <div>
          <p>CreatorGrid</p>
          <h1>{workspace.name}</h1>
          <p>{user.email}</p>
        </div>
        <UserButton />
      </header>
      <section>
        <h2>Plan, produce, and publish with clarity.</h2>
        <p>Your workspace is ready. Create your first content item to get started.</p>
      </section>
    </main>
  );
}
