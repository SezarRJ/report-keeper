import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_SALES_ROWS } from "@/data/mockData";
import { Upload, FileSpreadsheet } from "lucide-react";

const SalesImportPage = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">استيراد ملف المبيعات</h1>

        {!showPreview ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">اسحب الملف هنا أو اضغط للاختيار</p>
                <p className="text-sm text-muted-foreground mt-1">يدعم ملفات CSV و Excel</p>
              </div>
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <FileSpreadsheet className="h-4 w-4 ml-1.5" />اختيار ملف
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="bg-success/5 border-success/30">
              <CardContent className="py-3">
                <p className="text-sm">تم تحميل الملف بنجاح — {MOCK_SALES_ROWS.length} صفوف</p>
              </CardContent>
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم الصحن</TableHead>
                    <TableHead>الكمية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SALES_ROWS.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.dishName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => navigate("/sales/mapping")}>
                التالي: مطابقة الأعمدة
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SalesImportPage;
