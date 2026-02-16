import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Wheat, Loader2 } from "lucide-react";

const UNITS = ["كغ", "غرام", "لتر", "مل", "حبة", "ملعقة", "كوب"];

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  price_per_unit: number;
}

const fmt = (n: number) => n.toLocaleString("en-US");

const IngredientsPage = () => {
  const { restaurant } = useRestaurant();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("كغ");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchIngredients = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("ingredients")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });
    setIngredients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredients();
  }, [restaurant]);

  const openNew = () => {
    setEditId(null);
    setName("");
    setUnit("كغ");
    setPrice("");
    setDialogOpen(true);
  };

  const openEdit = (ing: Ingredient) => {
    setEditId(ing.id);
    setName(ing.name);
    setUnit(ing.unit);
    setPrice(String(ing.price_per_unit));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!restaurant || !name.trim()) return;
    setSaving(true);
    const values = {
      name: name.trim(),
      unit,
      price_per_unit: parseFloat(price) || 0,
      restaurant_id: restaurant.id,
    };

    if (editId) {
      const { error } = await supabase.from("ingredients").update(values).eq("id", editId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); }
      else { toast({ title: "تم التحديث" }); }
    } else {
      const { error } = await supabase.from("ingredients").insert(values);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); }
      else { toast({ title: "تمت الإضافة" }); }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchIngredients();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); }
    else { toast({ title: "تم الحذف" }); fetchIngredients(); }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">المواد الخام</h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة المواد الخام وأسعارها</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 ml-1.5" />إضافة مادة خام</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : ingredients.length === 0 ? (
          <Card className="p-12 text-center">
            <Wheat className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد مواد خام بعد. ابدأ بإضافة مادة جديدة.</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المادة</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead className="w-24">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell>{ing.unit}</TableCell>
                    <TableCell>{fmt(ing.price_per_unit)} د.ع</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(ing)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ing.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "تعديل مادة خام" : "إضافة مادة خام"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">اسم المادة</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: دجاج" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">وحدة القياس</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">سعر الشراء لكل وحدة</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" dir="ltr" />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default IngredientsPage;
