import { eq } from "drizzle-orm";
import { getChatGPTUser } from "./chatgpt-auth";
import ClientHome from "./client-home";
import { getDb } from "../db";
import { users } from "../db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  if (user) {
    const db = getDb();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    } else {
      await db
        .update(users)
        .set({
          email: user.email,
          displayName: user.displayName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }
  }

  return <ClientHome user={user} />;
}
