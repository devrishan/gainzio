import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
    const campaigns = await prisma.adCampaign.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            zones: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Ad Campaigns</h1>
                <Link href="/admin/ads/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Campaign
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Zones</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>Clicks</TableHead>
                                <TableHead>CTR</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        No active campaigns found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigns.map((campaign) => {
                                    const ctr = campaign.views > 0 ? ((campaign.clicks / campaign.views) * 100).toFixed(2) : "0.00";
                                    return (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="font-medium">{campaign.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={campaign.isActive ? "default" : "secondary"}>
                                                    {campaign.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {campaign.zones.map(z => (
                                                        <Badge key={z.id} variant="outline" className="text-xs">{z.name}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                                    {campaign.views.toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MousePointer2 className="w-3 h-3 text-muted-foreground" />
                                                    {campaign.clicks.toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>{ctr}%</TableCell>
                                            <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/ads/${campaign.id}/edit`}>
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
