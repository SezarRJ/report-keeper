import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";

const CATEGORIES = ["أطباق رئيسية", "مقبلات", "سلطات", "حلويات", "مشروبات", "شوربات"];

interface Ingredient { id: string; name: string; unit: string; price_per_unit: number; }
interface IngRow { ingredientId: string; quantity: string; }

const NewRecipePage = () => {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [sellingPrice, setSellingPrice] = useState("");
  const [rows, setRows] = useState<IngRow[]>([{ ingredientId: "", quantity: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!restaurant) return;
    supabase.from("ingredients").select("*").eq("restaurant_id", restaurant.id).then(({ data }) => {
      setIngredients(data || []);
    });
  }, [restaurant]);

  const addRow = () => setRows([...rows, { ingredientId: "", quantity: "" }]);
  const removeRow = (i: number) => { if (rows.length > 1) setRows(rows.filter((_, idx) => idx !== i)); };
  const updateRow = (i: number, field: keyof IngRow, value: string) => {
    const copy = [...rows]; copy[i] = { ...copy[i], [field]: value }; setRows(copy);
  };

  const totalCost = rows.reduce((sum, r) => {
    const ing = ingredients.find((m) => m.id === r.ingredientId);
    const qty = parseFloat(r.quantity) || 0;
    return sum + (ing ? ing.price_per_unit * qty : 0);
  }, 0);

  const handleSave = async () => {
    if (!restaurant || !name.trim()) return;
    setSaving(true);
    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({ name: name.trim(), category, selling_price: parseFloat(sellingPrice) || 0, restaurant_id: restaurant.id })
      .select()
      .single();

    if (error || !recipe) {
      toast({ title: "خطأ", description: error?.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    const validRows = rows.filter(r => r.ingredientId && parseFloat(r.quantity) > 0);
    if (validRows.length > 0) {
      await supabase.from("recipe_ingredients").insert(
        validRows.map(r => ({ recipe_id: recipe.id, ingredient_id: r.ingredientId, quantity: parseFloat(r.quantity) }))
      );
    }

    toast({ title: "تمت إضافة الوصفة" });
    setSaving(false);
    navigate("/recipes");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">إضافة وصفة جديدة</h1>
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">اسم الصحن</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: شاورما دجاج" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">التصنيف</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">سعر البيع</label>
              <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0" dir="ltr" className="max-w-xs" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">المكونات</label>
                <Button variant="outline" size="sm" onClick={addRow}><Plus className="h-3 w-3 ml-1" />إضافة مكون</Button>
              </div>
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Select value={row.ingredientId} onValueChange={(v) => updateRow(idx, "ingredientId", v)}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="اختر المادة الخام" /></SelectTrigger>
                      <SelectContent>
                        {ingredients.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input className="w-24" type="number" placeholder="الكمية" value={row.quantity} onChange={(e) => updateRow(idx, "quantity", e.target.value)} dir="ltr" />
                    <Button variant="ghost" size="icon" onClick={() => removeRow(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <p className="text-sm text-muted-foreground">
                  تكلفة المكونات الحالية: <span className="font-bold text-foreground">{totalCost.toLocaleString("en-US")} د.ع</span>
                </p>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}حفظ
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NewRecipePage;
