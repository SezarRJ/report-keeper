import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns = ["التاريخ", "اسم الصحن", "الكمية", "السعر", "الملاحظات"];

const SalesMappingPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">مطابقة الأعمدة</h1>
        <p className="text-sm text-muted-foreground">حدد الأعمدة المناسبة من ملف المبيعات</p>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">اختر عمود التاريخ</label>
              <Select defaultValue="التاريخ">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">اختر عمود اسم الصحن</label>
              <Select defaultValue="اسم الصحن">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">اختر عمود الكمية</label>
              <Select defaultValue="الكمية">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => navigate("/sales/matching")}>
              استيراد البيانات
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SalesMappingPage;
