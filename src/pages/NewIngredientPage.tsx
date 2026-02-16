import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INGREDIENT_UNITS } from "@/data/mockData";

const NewIngredientPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">إضافة مادة خام</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">اسم المادة</label>
              <Input placeholder="مثال: دجاج" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">وحدة القياس</label>
              <Select defaultValue="كغ">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INGREDIENT_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">سعر الشراء لكل وحدة</label>
              <Input type="number" placeholder="0" dir="ltr" />
            </div>
            <Button className="w-full" onClick={() => navigate("/ingredients")}>حفظ</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NewIngredientPage;
