
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Define types for our report data
export type ReportType = 'payouts' | 'settlements' | 'transactions' | 'revenue' | 'partner';

interface ReportData {
    title: string;
    period: string;
    generatedDate: Date;
    data: any[];
    headers: string[];
}

export const generateFinancialReportPDF = (
    type: ReportType,
    data: any[],
    period: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // -- Header Section --
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('Financial Report', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 30);

    // -- Report Details --
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, pageWidth - 14, 35);

    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, 14, 45);
    doc.text(`Period: ${period}`, 14, 52);

    // -- Table Content --
    let tableHeaders: string[] = [];
    let tableBody: any[][] = [];

    switch (type) {
        case 'payouts':
            tableHeaders = ['ID', 'Date', 'Recipient', 'Amount', 'Status'];
            tableBody = data.map(item => [
                item.id,
                item.date,
                item.recipient,
                item.amount,
                item.status
            ]);
            break;
        case 'settlements':
            tableHeaders = ['Settlement ID', 'Date', 'Merchant', 'Amount', 'Fees', 'Net'];
            tableBody = data.map(item => [
                item.id,
                item.date,
                item.merchant,
                item.amount,
                item.fees,
                item.net
            ]);
            break;
        case 'transactions':
            tableHeaders = ['Txn ID', 'Date', 'Type', 'Amount', 'Status', 'Reference'];
            tableBody = data.map(item => [
                item.id,
                item.date,
                item.type,
                item.amount,
                item.status,
                item.reference
            ]);
            break;
        case 'revenue':
            tableHeaders = ['Date', 'Source', 'Gross Amount', 'Deductions', 'Net Revenue'];
            tableBody = data.map(item => [
                item.date,
                item.source,
                item.gross,
                item.deductions,
                item.net
            ]);
            break;
        default:
            tableHeaders = ['Column 1', 'Column 2', 'Column 3'];
            tableBody = data.map(item => [item.col1, item.col2, item.col3]);
    }

    autoTable(doc, {
        startY: 60,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166] }, // Teal-500
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // -- Footer --
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Use a clean filename
    const filename = `${type}_report_${period.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(filename);
};
