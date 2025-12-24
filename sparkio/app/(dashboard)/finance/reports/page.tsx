"use client";

import { TrendingUp, Download, Calendar, BarChart3, PieChart, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock reports data
const mockReports = [
  {
    id: "1",
    name: "Monthly Payout Report",
    type: "payouts",
    period: "January 2024",
    generatedDate: "2024-01-31",
    size: "2.4 MB",
    format: "PDF",
  },
  {
    id: "2",
    name: "Settlement Summary",
    type: "settlements",
    period: "Q4 2023",
    generatedDate: "2024-01-15",
    size: "1.8 MB",
    format: "Excel",
  },
  {
    id: "3",
    name: "Transaction Analysis",
    type: "transactions",
    period: "December 2023",
    generatedDate: "2024-01-01",
    size: "3.2 MB",
    format: "PDF",
  },
  {
    id: "4",
    name: "Revenue Report",
    type: "revenue",
    period: "January 2024",
    generatedDate: "2024-01-31",
    size: "1.5 MB",
    format: "Excel",
  },
];

const mockMetrics = {
  totalRevenue: 2456800,
  totalPayouts: 1845000,
  netProfit: 611800,
  growthRate: 12.4,
  topPartner: "ABC Marketing Agency",
  avgSettlementTime: "2.3 days",
};

export default function FinanceReportsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and download financial reports</p>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </header>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border border-white/5 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{mockMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-white/5 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payouts</CardTitle>
            <BarChart3 className="h-4 w-4 text-teal-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{mockMetrics.totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid out</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-white/5 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <PieChart className="h-4 w-4 text-teal-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{mockMetrics.netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">After payouts</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-white/5 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{mockMetrics.growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate New Report */}
      <Card className="rounded-xl border border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Generate New Report</CardTitle>
          <CardDescription className="text-muted-foreground">Create a custom financial report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Report Type</label>
              <Select>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payouts">Payout Report</SelectItem>
                  <SelectItem value="settlements">Settlement Report</SelectItem>
                  <SelectItem value="transactions">Transaction Report</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="partner">Partner Commission Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Period</label>
              <Select>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Format</label>
              <Select>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Include</label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Charts
                </Button>
                <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Details
                </Button>
                <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Summary
                </Button>
              </div>
            </div>
          </div>
          <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="rounded-xl border border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Recent Reports</CardTitle>
          <CardDescription className="text-muted-foreground">Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.period} · {report.format} · {report.size}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generated: {new Date(report.generatedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

