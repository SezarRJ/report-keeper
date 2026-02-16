import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_RECIPES, MOCK_SALES_ROWS } from "@/data/mockData";

const SalesMatchingPage = () => {
  const navigate = useNavigate();

  // Unique raw dish names from imported sales
  const rawNames = [...new Set(MOCK_SALES_ROWS.map((r) => r.dishName))];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">مطابقة أسماء الأطباق</h1>
        <p className="text-sm text-muted-foreground">
          طابق أسماء الأطباق من ملف المبيعات مع وصفاتك المسجلة
        </p>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {rawNames.map((name) => (
              <div key={name} className="flex items-center gap-4">
                <span className="text-sm font-medium min-w-[120px]">{name}</span>
                <Select defaultValue={MOCK_RECIPES.find((r) => r.name === name)?.id ?? ""}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="اختر الوصفة المطابقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_RECIPES.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => navigate("/dashboard")}>حفظ المطابقة</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SalesMatchingPage;
