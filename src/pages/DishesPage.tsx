import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Dish, Ingredient, DISH_CATEGORIES, UNITS } from "@/types";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

const emptyIngredient = (): Ingredient => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: 0,
  unit: "كغ",
  costPerUnit: 0,
});

const DishesPage = () => {
  const { dishes, addDish, updateDish, deleteDish } = useStore();
  const [open, setOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(DISH_CATEGORIES[0]);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);

  const resetForm = () => {
    setName("");
    setCategory(DISH_CATEGORIES[0]);
    setSellingPrice(0);
    setIngredients([emptyIngredient()]);
    setEditingDish(null);
  };

  const openEdit = (dish: Dish) => {
    setEditingDish(dish);
    setName(dish.name);
    setCategory(dish.category);
    setSellingPrice(dish.sellingPrice);
    setIngredients(dish.ingredients.length > 0 ? dish.ingredients : [emptyIngredient()]);
    setOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم الطبق");
      return;
    }

    const totalCost = ingredients.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);
    const profit = sellingPrice - totalCost;
    const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    const dish: Dish = {
      id: editingDish?.id || crypto.randomUUID(),
      name,
      category,
      sellingPrice,
      ingredients: ingredients.filter((i) => i.name.trim()),
      totalCost,
      profit,
      profitMargin,
    };

    if (editingDish) {
      updateDish(dish);
      toast.success("تم تحديث الطبق بنجاح");
    } else {
      addDish(dish);
      toast.success("تم إضافة الطبق بنجاح");
    }

    resetForm();
    setOpen(false);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الأطباق</h1>
            <p className="text-muted-foreground mt-1">إدارة تكاليف الأطباق ومكوناتها</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-2" />إضافة طبق</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDish ? "تعديل الطبق" : "إضافة طبق جديد"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">اسم الطبق</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: كباب مشوي" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">التصنيف</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DISH_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">سعر البيع</label>
                  <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">المكونات</label>
                    <Button variant="outline" size="sm" onClick={() => setIngredients([...ingredients, emptyIngredient()])}>
                      <Plus className="h-3 w-3 ml-1" />إضافة مكون
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <div key={ing.id} className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
                        <Input placeholder="اسم المكون" value={ing.name} onChange={(e) => updateIngredient(idx, "name", e.target.value)} />
                        <Input type="number" placeholder="الكمية" value={ing.quantity || ""} onChange={(e) => updateIngredient(idx, "quantity", Number(e.target.value))} />
                        <Select value={ing.unit} onValueChange={(v) => updateIngredient(idx, "unit", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {UNITS.map((u) => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="السعر" value={ing.costPerUnit || ""} onChange={(e) => updateIngredient(idx, "costPerUnit", Number(e.target.value))} />
                        <Button variant="ghost" size="icon" onClick={() => removeIngredient(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    التكلفة: <span className="font-bold text-foreground">{ingredients.reduce((s, i) => s + i.quantity * i.costPerUnit, 0).toFixed(2)} د.ع</span>
                  </div>
                  <Button onClick={handleSave}>{editingDish ? "تحديث" : "حفظ"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {dishes.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <p className="text-muted-foreground">لا توجد أطباق بعد. ابدأ بإضافة طبق جديد.</p>
          </Card>
        ) : (
          <Card className="glass-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطبق</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>التكلفة</TableHead>
                  <TableHead>سعر البيع</TableHead>
                  <TableHead>الربح</TableHead>
                  <TableHead>هامش الربح</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dishes.map((dish) => (
                  <TableRow key={dish.id} className="animate-fade-in">
                    <TableCell className="font-medium">{dish.name}</TableCell>
                    <TableCell>{dish.category}</TableCell>
                    <TableCell>{dish.totalCost.toFixed(2)} د.ع</TableCell>
                    <TableCell>{dish.sellingPrice.toFixed(2)} د.ع</TableCell>
                    <TableCell className={dish.profit >= 0 ? "text-success" : "text-destructive"}>
                      {dish.profit.toFixed(2)} د.ع
                    </TableCell>
                    <TableCell>{dish.profitMargin.toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(dish)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteDish(dish.id); toast.success("تم حذف الطبق"); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default DishesPage;
