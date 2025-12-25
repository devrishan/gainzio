"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck } from "lucide-react";

interface ReferralLevel {
  level: number;
  userId: string;
  referralCode: string;
  username: string | null;
  phone: string;
}

interface ReferralTreeProps {
  tree: ReferralLevel[];
}

export function ReferralTree({ tree }: ReferralTreeProps) {
  const l1Referrals = tree.filter((r) => r.level === 1);
  const l2Referrals = tree.filter((r) => r.level === 2);
  const l3Referrals = tree.filter((r) => r.level === 3);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral Tree
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          View your complete referral network across all levels
        </p>
      </div>

      {/* Level 1 */}
      {l1Referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-600">
                Level 1
              </Badge>
              Direct Referrals ({l1Referrals.length})
            </CardTitle>
            <CardDescription>Users you directly referred</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {l1Referrals.map((referral) => (
                <div
                  key={referral.userId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {referral.username || `User ${referral.phone.slice(-4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{referral.referralCode}</p>
                  </div>
                  <UserCheck className="h-4 w-4 text-blue-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level 2 */}
      {l2Referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/20 text-green-600">
                Level 2
              </Badge>
              Indirect Referrals ({l2Referrals.length})
            </CardTitle>
            <CardDescription>Users referred by your Level 1 referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {l2Referrals.map((referral) => (
                <div
                  key={referral.userId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {referral.username || `User ${referral.phone.slice(-4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{referral.referralCode}</p>
                  </div>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level 3 */}
      {l3Referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-600">
                Level 3
              </Badge>
              Extended Network ({l3Referrals.length})
            </CardTitle>
            <CardDescription>Users referred by your Level 2 referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {l3Referrals.map((referral) => (
                <div
                  key={referral.userId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {referral.username || `User ${referral.phone.slice(-4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{referral.referralCode}</p>
                  </div>
                  <UserCheck className="h-4 w-4 text-purple-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tree.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No referrals yet. Start sharing your referral code to build your network!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

