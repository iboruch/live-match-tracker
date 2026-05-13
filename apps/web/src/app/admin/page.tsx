import { api } from "@/lib/api";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const matches = await api.listMatches().catch(() => []);

  return <AdminClient initialMatches={matches} />;
}
