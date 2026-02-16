import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("en-US");

interface Recipe { id: string; name: string; category: string; selling_price: number; }
interface RecipeIng { ingredient_id: string; quantity: number; name: string; unit: string; price_per_unit: number; cost: number; }
interface Competitor { id: string; competitor_name: string; price: number; }

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { restaurant } = useRestaurant();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeIngs, setRecipeIngs] = useState<RecipeIng[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [totalCosts, setTotalCosts] = useState(0);
  const [discountRules, setDiscountRules] = useState<{ min_weekly_sales: number; discount_percent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [weeklySales, setWeeklySales] = useState("");
  const [compOpen, setCompOpen] = useState(false);
  const [compName, setCompName] = useState("");
  const [compPrice, setCompPrice] = useState("");
  const [compSaving, setCompSaving] = useState(false);

  useEffect(() => {
    if (!id || !restaurant) return;
    const load = async () => {
      const [recipeRes, riRes, compRes, costsRes, rulesRes] = await Promise.all([
        supabase.from("recipes").select("*").eq("id", id).maybeSingle(),
        supabase.from("recipe_ingredients").select("ingredient_id, quantity, ingredients(name, unit, price_per_unit)").eq("recipe_id", id),
        supabase.from("competitor_prices").select("*").eq("recipe_id", id),
        supabase.from("operating_costs").select("amount").eq("restaurant_id", restaurant.id),
        supabase.from("volume_discount_rules").select("min_weekly_sales, discount_percent").eq("restaurant_id", restaurant.id),
      ]);

      if (recipeRes.data) {
        setRecipe(recipeRes.data as Recipe);
        setSellingPrice(recipeRes.data.selling_price);
      }

      const ings: RecipeIng[] = (riRes.data || []).map((ri: any) => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        name: ri.ingredients?.name || "",
        unit: ri.ingredients?.unit || "",
        price_per_unit: ri.ingredients?.price_per_unit || 0,
        cost: ri.quantity * (ri.ingredients?.price_per_unit || 0),
      }));
      setRecipeIngs(ings);
      setCompetitors((compRes.data || []) as Competitor[]);
      setTotalCosts((costsRes.data || []).reduce((s: number, c: any) => s + c.amount, 0));
      setDiscountRules((rulesRes.data || []) as any[]);
      setLoading(false);
    };
    load();
  }, [id, restaurant]);

  if (loading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  if (!recipe) {
    return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground text-lg">الصحن غير موجود</p></div></AppLayout>;
  }

  const ingredientCost = recipeIngs.reduce((s, i) => s + i.cost, 0);
  const recipeCount = 1; // simplified
  const overheadShare = recipeCount > 0 ? totalCosts / Math.max(recipeCount, 1) : 0;
  const trueCost = ingredientCost + overheadShare;
  const profit = sellingPrice - trueCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const breakEven = profit > 0 ? Math.ceil(totalCosts / profit) : 0;

  const weeklyQty = parseInt(weeklySales) || 0;
  const applicableRule = [...discountRules].sort((a, b) => b.min_weekly_sales - a.min_weekly_sales).find((r) => weeklyQty >= r.min_weekly_sales);
  const discountPercent = applicableRule?.discount_percent ?? 0;
  const newPrice = sellingPrice * (1 - discountPercent / 100);
  const newProfit = newPrice - trueCost;
  const newMargin = newPrice > 0 ? (newProfit / newPrice) * 100 : 0;
  const isSafe = newMargin > 20;

  const handleAddCompetitor = async () => {
    if (!compName.trim()) return;
    setCompSaving(true);
    const { error } = await supabase.from("competitor_prices").insert({
      recipe_id: id!,
      competitor_name: compName.trim(),
      price: parseFloat(compPrice) || 0,
    });
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else {
      toast({ title: "تمت الإضافة" });
      const { data } = await supabase.from("competitor_prices").select("*").eq("recipe_id", id!);
      setCompetitors((data || []) as Competitor[]);
    }
    setCompSaving(false);
    setCompOpen(false);
    setCompName("");
    setCompPrice("");
  };

  const handleUpdatePrice = async () => {
    const { error } = await supabase.from("recipes").update({ selling_price: sellingPrice }).eq("id", id!);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else toast({ title: "تم تحديث السعر" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">تفاصيل الصحن: {recipe.name}</h1>
        <Tabs defaultValue="cost">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted p-1 text-xs sm:text-sm">
            <TabsTrigger value="cost">التكلفة الحقيقية</TabsTrigger>
            <TabsTrigger value="pricing">التسعير ونقطة التعادل</TabsTrigger>
            <TabsTrigger value="competitors">أسعار المنافسين</TabsTrigger>
            <TabsTrigger value="offers">العروض المقترحة</TabsTrigger>
          </TabsList>

          <TabsContent value="cost">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">المكونات</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead>المادة</TableHead><TableHead>الكمية</TableHead><TableHead>التكلفة</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {recipeIngs.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">لا توجد مكونات</TableCell></TableRow>
                      ) : recipeIngs.map((ing) => (
                        <TableRow key={ing.ingredient_id}>
                          <TableCell>{ing.name}</TableCell>
                          <TableCell>{ing.quantity} {ing.unit}</TableCell>
                          <TableCell>{fmt(Math.round(ing.cost))} د.ع</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">تكلفة المكونات</p>
                    <p className="text-lg font-bold">{fmt(Math.round(ingredientCost))} د.ع</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">حصة المصاريف التشغيلية</p>
                    <p className="text-lg font-bold">{fmt(Math.round(overheadShare))} د.ع</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">التكلفة الحقيقية</p>
                    <p className="text-lg font-bold text-primary">{fmt(Math.round(trueCost))} د.ع</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1.5 block">سعر البيع الحالي</label>
                    <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} dir="ltr" className="max-w-xs" />
                  </div>
                  <Button onClick={handleUpdatePrice} size="sm">حفظ السعر</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">هامش الربح</p>
                    <p className={`text-lg font-bold ${margin >= 50 ? "text-success" : "text-warning"}`}>{margin.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">الربح لكل صحن</p>
                    <p className={`text-lg font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>{fmt(Math.round(profit))} د.ع</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">نقطة التعادل الشهرية</p>
                    <p className="text-lg font-bold">{breakEven} طبق</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-end">
                  <Dialog open={compOpen} onOpenChange={setCompOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm"><Plus className="h-4 w-4 ml-1" />إضافة منافس</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>إضافة سعر منافس</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div><label className="text-sm font-medium mb-1.5 block">اسم المنافس</label><Input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="مثال: مطعم النجمة" /></div>
                        <div><label className="text-sm font-medium mb-1.5 block">السعر</label><Input type="number" value={compPrice} onChange={(e) => setCompPrice(e.target.value)} placeholder="0" dir="ltr" /></div>
                        <Button className="w-full" onClick={handleAddCompetitor} disabled={compSaving}>
                          {compSaving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}حفظ
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {competitors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد بيانات منافسين</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>المنافس</TableHead><TableHead>السعر</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {competitors.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.competitor_name}</TableCell>
                          <TableCell>{fmt(c.price)} د.ع</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">المبيعات هذا الأسبوع</label>
                  <Input type="number" value={weeklySales} onChange={(e) => setWeeklySales(e.target.value)} placeholder="عدد الأطباق المباعة" dir="ltr" className="max-w-xs" />
                </div>
                {weeklyQty > 0 && (
                  <Card className={`border-2 ${isSafe ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">التوصية</h3>
                        <Badge variant={isSafe ? "default" : "destructive"} className={isSafe ? "bg-success" : ""}>{isSafe ? "عرض آمن" : "غير آمن"}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div><p className="text-xs text-muted-foreground">خصم مقترح</p><p className="font-bold">{discountPercent}%</p></div>
                        <div><p className="text-xs text-muted-foreground">السعر الجديد</p><p className="font-bold">{fmt(Math.round(newPrice))} د.ع</p></div>
                        <div><p className="text-xs text-muted-foreground">الهامش الجديد</p><p className={`font-bold ${isSafe ? "text-success" : "text-destructive"}`}>{newMargin.toFixed(1)}%</p></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {weeklyQty > 0 && !applicableRule && (
                  <p className="text-sm text-muted-foreground">لا توجد قاعدة خصم مطابقة لعدد المبيعات الحالي.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RecipeDetailPage;
