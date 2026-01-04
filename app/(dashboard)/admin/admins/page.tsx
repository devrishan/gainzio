import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminStaff } from "@/services/admin";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminManagementPage() {
  const staff = await getAdminStaff();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Management</h1>
        <p className="text-sm text-muted-foreground">
          Create, update, and manage platform staff access.
        </p>
      </header>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username || "No Username"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {user.lastLoginAt
                    ? format(new Date(user.lastLoginAt), "MMM d, HH:mm")
                    : "Never"}
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
