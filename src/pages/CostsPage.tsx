import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

interface Cost {
  id: string;
  name: string;
  amount: number;
  cost_type: string;
}

const fmt = (n: number) => n.toLocaleString("en-US");

const CostsPage = () => {
  const { restaurant } = useRestaurant();
  const { toast } = useToast();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [costType, setCostType] = useState("fixed");
  const [saving, setSaving] = useState(false);

  const fetchCosts = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("operating_costs")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });
    setCosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCosts(); }, [restaurant]);

  const openNew = () => { setEditId(null); setName(""); setAmount(""); setCostType("fixed"); setDialogOpen(true); };
  const openEdit = (c: Cost) => { setEditId(c.id); setName(c.name); setAmount(String(c.amount)); setCostType(c.cost_type); setDialogOpen(true); };

  const handleSave = async () => {
    if (!restaurant || !name.trim()) return;
    setSaving(true);
    const values = { name: name.trim(), amount: parseFloat(amount) || 0, cost_type: costType, restaurant_id: restaurant.id };
    if (editId) {
      const { error } = await supabase.from("operating_costs").update(values).eq("id", editId);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تم التحديث" });
    } else {
      const { error } = await supabase.from("operating_costs").insert(values);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تمت الإضافة" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchCosts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("operating_costs").delete().eq("id", id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else { toast({ title: "تم الحذف" }); fetchCosts(); }
  };

  const fixed = costs.filter((c) => c.cost_type === "fixed");
  const variable = costs.filter((c) => c.cost_type === "variable");
  const total = costs.reduce((s, c) => s + c.amount, 0);

  const CostTable = ({ items }: { items: Cost[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>المصروف</TableHead>
          <TableHead>المبلغ الشهري</TableHead>
          <TableHead className="w-24">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">لا توجد بيانات</TableCell></TableRow>
        ) : items.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>{fmt(c.amount)} د.ع</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">المصاريف التشغيلية الشهرية</h1>
            <p className="text-sm text-muted-foreground mt-1">تكاليف تشغيل المطعم الثابتة والمتغيرة</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 ml-1.5" />إضافة مصروف جديد</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <Tabs defaultValue="fixed">
              <TabsList>
                <TabsTrigger value="fixed">تكاليف ثابتة</TabsTrigger>
                <TabsTrigger value="variable">تكاليف متغيرة</TabsTrigger>
              </TabsList>
              <TabsContent value="fixed"><Card><CostTable items={fixed} /></Card></TabsContent>
              <TabsContent value="variable"><Card><CostTable items={variable} /></Card></TabsContent>
            </Tabs>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                إجمالي المصاريف الشهرية: <span className="text-lg font-bold text-foreground">{fmt(total)} د.ع</span>
              </p>
            </Card>
          </>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "تعديل مصروف" : "إضافة مصروف جديد"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">اسم المصروف</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: إيجار" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">المبلغ الشهري</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" dir="ltr" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">النوع</label>
                <Select value={costType} onValueChange={setCostType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">تكلفة ثابتة</SelectItem>
                    <SelectItem value="variable">تكلفة متغيرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CostsPage;
