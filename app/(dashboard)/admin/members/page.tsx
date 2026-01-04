import Link from "next/link";
import { getAdminMembers } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function MemberManagementPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const { users, pagination } = await getAdminMembers(searchParams);

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Member Management</h1>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total members registered.
          </p>
        </div>
      </header>

      <div className="flex items-center gap-4">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            type="search"
            placeholder="Search by email, username, or phone..."
            className="pl-9"
            defaultValue={searchParams.search}
          />
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username || "No Username"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    {user.phone && <span className="text-xs text-muted-foreground">{user.phone}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>₹{user.walletBalance.toLocaleString()}</TableCell>
                <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {user.lastLoginAt
                    ? format(new Date(user.lastLoginAt), "MMM d, HH:mm")
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/members/${user.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
