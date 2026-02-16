import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Dish, Expense } from "@/types";

// We need to declare the autoTable method on jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportDishesToExcel = (dishes: Dish[]) => {
  const data = dishes.map((d) => ({
    "اسم الطبق": d.name,
    "التصنيف": d.category,
    "التكلفة": d.totalCost,
    "سعر البيع": d.sellingPrice,
    "الربح": d.profit,
    "هامش الربح %": Number(d.profitMargin.toFixed(1)),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الأطباق");
  XLSX.writeFile(wb, "تقرير_الأطباق.xlsx");
};

export const exportExpensesToExcel = (expenses: Expense[]) => {
  const data = expenses.map((e) => ({
    "الوصف": e.description,
    "التصنيف": e.category,
    "المبلغ": e.amount,
    "التاريخ": e.date,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "المصاريف");
  XLSX.writeFile(wb, "تقرير_المصاريف.xlsx");
};

export const exportDishesToPDF = (dishes: Dish[]) => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("Dishes Cost Report", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString("ar-IQ")}`, 105, 28, { align: "center" });

  doc.autoTable({
    startY: 35,
    head: [["Profit %", "Profit", "Price", "Cost", "Category", "Dish"]],
    body: dishes.map((d) => [
      d.profitMargin.toFixed(1) + "%",
      d.profit.toFixed(2),
      d.sellingPrice.toFixed(2),
      d.totalCost.toFixed(2),
      d.category,
      d.name,
    ]),
    styles: { halign: "center", fontSize: 9 },
    headStyles: { fillColor: [217, 119, 30] },
  });

  doc.save("dishes_report.pdf");
};

export const exportExpensesToPDF = (expenses: Expense[]) => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("Expenses Report", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString("ar-IQ")}`, 105, 28, { align: "center" });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  doc.autoTable({
    startY: 35,
    head: [["Date", "Amount", "Category", "Description"]],
    body: expenses.map((e) => [
      e.date,
      e.amount.toFixed(2),
      e.category,
      e.description,
    ]),
    styles: { halign: "center", fontSize: 9 },
    headStyles: { fillColor: [217, 119, 30] },
    foot: [["", total.toFixed(2), "", "Total"]],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  doc.save("expenses_report.pdf");
};

export const importDishesFromExcel = (file: File): Promise<Dish[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws);

        const dishes: Dish[] = json.map((row) => {
          const totalCost = Number(row["التكلفة"] || row["Cost"] || 0);
          const sellingPrice = Number(row["سعر البيع"] || row["Price"] || 0);
          const profit = sellingPrice - totalCost;
          return {
            id: crypto.randomUUID(),
            name: row["اسم الطبق"] || row["Dish"] || "",
            category: row["التصنيف"] || row["Category"] || "أطباق رئيسية",
            sellingPrice,
            ingredients: [],
            totalCost,
            profit,
            profitMargin: sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0,
          };
        });

        resolve(dishes.filter((d) => d.name));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const importExpensesFromExcel = (file: File): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws);

        const expenses: Expense[] = json.map((row) => ({
          id: crypto.randomUUID(),
          description: row["الوصف"] || row["Description"] || "",
          category: row["التصنيف"] || row["Category"] || "أخرى",
          amount: Number(row["المبلغ"] || row["Amount"] || 0),
          date: row["التاريخ"] || row["Date"] || new Date().toISOString().split("T")[0],
        }));

        resolve(expenses.filter((ex) => ex.description));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
