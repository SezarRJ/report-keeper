import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_DISCOUNT_RULES } from "@/data/mockData";
import { Plus, Info } from "lucide-react";

const OffersRulesPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إعداد قواعد الخصومات</h1>
            <p className="text-sm text-muted-foreground mt-1">حدد قواعد الخصم بناءً على حجم المبيعات الأسبوعية</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-1.5" />إضافة قاعدة</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>إضافة قاعدة خصم</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الحد الأدنى للمبيعات الأسبوعية</label>
                  <Input type="number" placeholder="مثال: 100" dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">نسبة الخصم %</label>
                  <Input type="number" placeholder="مثال: 10" dir="ltr" />
                </div>
                <Button className="w-full" onClick={() => setOpen(false)}>حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحد الأدنى للمبيعات الأسبوعية</TableHead>
                <TableHead>نسبة الخصم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DISCOUNT_RULES.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.minWeeklySales} طبق</TableCell>
                  <TableCell>{r.discountPercent}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="bg-info/5 border-info/30">
          <CardContent className="py-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              العروض توصيات فقط ولا تُطبق تلقائياً. يتم عرض التوصيات في صفحة تفاصيل كل صحن.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OffersRulesPage;
