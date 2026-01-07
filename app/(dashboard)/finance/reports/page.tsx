"use client";

import { TrendingUp, Download, Calendar, BarChart3, PieChart, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { generateFinancialReportPDF, ReportType } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

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

// Helper to generate mock data based on report type
const getMockData = (type: ReportType) => {
  switch (type) {
    case 'payouts':
      return Array.from({ length: 15 }, (_, i) => ({
        id: `PO-${1000 + i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        recipient: `User ${i + 1}`,
        amount: `₹${(Math.random() * 5000).toFixed(2)}`,
        status: i % 5 === 0 ? 'Failed' : 'Success',
      }));
    case 'settlements':
      return Array.from({ length: 10 }, (_, i) => ({
        id: `SET-${2000 + i}`,
        date: `2024-01-${String(i * 2 + 1).padStart(2, '0')}`,
        merchant: `Merchant ${i + 1}`,
        amount: `₹${(Math.random() * 10000).toFixed(2)}`,
        fees: `₹${(Math.random() * 500).toFixed(2)}`,
        net: `₹${(Math.random() * 9500).toFixed(2)}`,
      }));
    case 'transactions':
      return Array.from({ length: 20 }, (_, i) => ({
        id: `TXN-${3000 + i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        type: i % 2 === 0 ? 'Credit' : 'Debit',
        amount: `₹${(Math.random() * 2000).toFixed(2)}`,
        status: 'Completed',
        reference: `REF-${Math.floor(Math.random() * 10000)}`,
      }));
    case 'revenue':
      return Array.from({ length: 10 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        source: i % 2 === 0 ? 'Subscription' : 'Commission',
        gross: `₹${(Math.random() * 8000).toFixed(2)}`,
        deductions: `₹${(Math.random() * 500).toFixed(2)}`,
        net: `₹${(Math.random() * 7500).toFixed(2)}`,
      }));
    default:
      return [];
  }
};

export default function FinanceReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('payouts');
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (selectedFormat !== 'pdf') {
      toast({
        title: "Format not supported",
        description: "Only PDF generation is currently supported.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // detailed mock data generation
      const data = getMockData(selectedType);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      generateFinancialReportPDF(selectedType, data, selectedPeriod);

      toast({
        title: "Report Generated",
        description: `Your ${selectedType} report has been downloaded.`,
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating the report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and download financial reports</p>
        </div>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          <FileText className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Report"}
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
              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val as ReportType)}
              >
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
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
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
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Report"}
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
