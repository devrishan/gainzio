import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getAuthenticatedUser } from "@/lib/api-auth"; // Ensure this path is correct or use getAuthUser logic if server action
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
    const zones = await prisma.adZone.findMany();

    async function createCampaign(formData: FormData) {
        "use server";

        const name = formData.get("name") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const targetUrl = formData.get("targetUrl") as string;
        const zoneIds = formData.getAll("zones") as string[];
        const dailyBudget = formData.get("dailyBudget") ? parseInt(formData.get("dailyBudget") as string) : null;
        const totalBudget = formData.get("totalBudget") ? parseInt(formData.get("totalBudget") as string) : null;

        if (!name || !imageUrl || !targetUrl) {
            // Basic validation
            return;
        }

        await prisma.adCampaign.create({
            data: {
                name,
                imageUrl,
                targetUrl,
                dailyBudget,
                totalBudget,
                zones: {
                    connect: zoneIds.map(id => ({ id }))
                }
            }
        });

        revalidatePath("/admin/ads");
        redirect("/admin/ads");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Campaign</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createCampaign} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Campaign Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Summer Sale 2024" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input id="imageUrl" name="imageUrl" placeholder="https://..." required />
                            <p className="text-xs text-muted-foreground">Direct link to the banner image.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetUrl">Target URL</Label>
                            <Input id="targetUrl" name="targetUrl" placeholder="https://..." required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dailyBudget">Daily Budget (Views)</Label>
                                <Input id="dailyBudget" name="dailyBudget" type="number" placeholder="Optional" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalBudget">Total Budget (Views)</Label>
                                <Input id="totalBudget" name="totalBudget" type="number" placeholder="Optional" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Target Zones</Label>
                            <div className="grid grid-cols-2 gap-2 border rounded-lg p-4">
                                {zones.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No zones defined. Please create zones in DB first.</p>}
                                {zones.map(zone => (
                                    <div key={zone.id} className="flex items-center space-x-2">
                                        <Checkbox id={`zone-${zone.id}`} name="zones" value={zone.id} />
                                        <Label htmlFor={`zone-${zone.id}`} className="font-normal cursor-pointer">
                                            {zone.name} <span className="text-xs text-muted-foreground">({zone.width}x{zone.height})</span>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href="/admin/ads">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Create Campaign</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
