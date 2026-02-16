import { useRef } from "react";
import { useStore } from "@/store/useStore";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileUp, FileText, FileSpreadsheet } from "lucide-react";
import {
  exportDishesToPDF,
  exportDishesToExcel,
  exportExpensesToPDF,
  exportExpensesToExcel,
  importDishesFromExcel,
  importExpensesFromExcel,
} from "@/lib/exportUtils";
import { toast } from "sonner";

const ReportsPage = () => {
  const { dishes, expenses, importDishes, importExpenses } = useStore();
  const dishFileRef = useRef<HTMLInputElement>(null);
  const expenseFileRef = useRef<HTMLInputElement>(null);

  const handleImportDishes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importDishesFromExcel(file);
      importDishes(imported);
      toast.success(`تم استيراد ${imported.length} طبق بنجاح`);
    } catch {
      toast.error("فشل في استيراد الملف. تأكد من صيغة الملف.");
    }
    e.target.value = "";
  };

  const handleImportExpenses = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importExpensesFromExcel(file);
      importExpenses(imported);
      toast.success(`تم استيراد ${imported.length} مصروف بنجاح`);
    } catch {
      toast.error("فشل في استيراد الملف. تأكد من صيغة الملف.");
    }
    e.target.value = "";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">التقارير</h1>
          <p className="text-muted-foreground mt-1">استيراد وتصدير تقارير التكاليف والمصاريف</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dishes Export */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                تصدير تقرير الأطباق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                عدد الأطباق: <span className="font-bold text-foreground">{dishes.length}</span>
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (dishes.length === 0) { toast.error("لا توجد أطباق للتصدير"); return; }
                    exportDishesToPDF(dishes);
                    toast.success("تم تصدير التقرير بصيغة PDF");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 ml-2" />PDF
                </Button>
                <Button
                  onClick={() => {
                    if (dishes.length === 0) { toast.error("لا توجد أطباق للتصدير"); return; }
                    exportDishesToExcel(dishes);
                    toast.success("تم تصدير التقرير بصيغة Excel");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 ml-2" />Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Export */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                تصدير تقرير المصاريف
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                عدد المصاريف: <span className="font-bold text-foreground">{expenses.length}</span>
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (expenses.length === 0) { toast.error("لا توجد مصاريف للتصدير"); return; }
                    exportExpensesToPDF(expenses);
                    toast.success("تم تصدير التقرير بصيغة PDF");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 ml-2" />PDF
                </Button>
                <Button
                  onClick={() => {
                    if (expenses.length === 0) { toast.error("لا توجد مصاريف للتصدير"); return; }
                    exportExpensesToExcel(expenses);
                    toast.success("تم تصدير التقرير بصيغة Excel");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 ml-2" />Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dishes Import */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-success" />
                استيراد أطباق من Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                ارفع ملف Excel يحتوي على أعمدة: اسم الطبق، التصنيف، التكلفة، سعر البيع
              </p>
              <input ref={dishFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportDishes} />
              <Button onClick={() => dishFileRef.current?.click()} className="w-full">
                <FileUp className="h-4 w-4 ml-2" />اختر ملف Excel
              </Button>
            </CardContent>
          </Card>

          {/* Expenses Import */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-success" />
                استيراد مصاريف من Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                ارفع ملف Excel يحتوي على أعمدة: الوصف، التصنيف، المبلغ، التاريخ
              </p>
              <input ref={expenseFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExpenses} />
              <Button onClick={() => expenseFileRef.current?.click()} className="w-full">
                <FileUp className="h-4 w-4 ml-2" />اختر ملف Excel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
