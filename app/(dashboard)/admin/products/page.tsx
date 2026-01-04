import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminProducts } from "@/services/admin";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const { products, pagination } = await getAdminProducts(searchParams);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Product Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {pagination.total} user suggested products.
        </p>
      </header>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Suggested By</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.productName}</span>
                    <span className="text-xs text-muted-foreground">{product.category || "Uncategorized"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{product.platform}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{product.user.username}</span>
                    <span className="text-xs text-muted-foreground">{product.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {product.amount ? `₹${product.amount}` : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === "approved" ? "default" : "secondary"}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {format(new Date(product.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
