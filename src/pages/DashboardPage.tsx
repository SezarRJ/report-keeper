import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { ChefHat, TrendingUp, Target, Plus, Upload, Loader2 } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("en-US");

interface RecipeSummary { id: string; name: string; selling_price: number; ingredient_cost: number; margin: number; }

const DashboardPage = () => {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [totalCosts, setTotalCosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant) return;
    const load = async () => {
      const [recipesRes, costsRes] = await Promise.all([
        supabase.from("recipes").select("id, name, selling_price").eq("restaurant_id", restaurant.id),
        supabase.from("operating_costs").select("amount").eq("restaurant_id", restaurant.id),
      ]);

      const recipesData = recipesRes.data || [];
      const costs = (costsRes.data || []).reduce((s: number, c: any) => s + c.amount, 0);
      setTotalCosts(costs);

      if (recipesData.length === 0) { setRecipes([]); setLoading(false); return; }

      const { data: riData } = await supabase
        .from("recipe_ingredients")
        .select("recipe_id, quantity, ingredients(price_per_unit)")
        .in("recipe_id", recipesData.map(r => r.id));

      const costMap: Record<string, number> = {};
      (riData || []).forEach((ri: any) => {
        costMap[ri.recipe_id] = (costMap[ri.recipe_id] || 0) + ri.quantity * (ri.ingredients?.price_per_unit || 0);
      });

      setRecipes(recipesData.map(r => {
        const ingCost = costMap[r.id] || 0;
        const margin = r.selling_price > 0 ? ((r.selling_price - ingCost) / r.selling_price * 100) : 0;
        return { ...r, ingredient_cost: ingCost, margin };
      }));
      setLoading(false);
    };
    load();
  }, [restaurant]);

  if (loading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  const totalDishes = recipes.length;
  const avgMargin = totalDishes > 0 ? recipes.reduce((s, r) => s + r.margin, 0) / totalDishes : 0;
  const avgProfit = totalDishes > 0 ? recipes.reduce((s, r) => s + (r.selling_price - r.ingredient_cost), 0) / totalDishes : 0;
  const breakEven = avgProfit > 0 ? Math.ceil(totalCosts / avgProfit) : 0;
  const topDishes = [...recipes].sort((a, b) => b.margin - a.margin).slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الأطباق</CardTitle>
              <ChefHat className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{totalDishes}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">متوسط هامش الربح</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">نقطة التعادل الشهرية</CardTitle>
              <Target className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{breakEven} طبق</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">إجراءات سريعة</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/ingredients")}><Plus className="h-4 w-4 ml-1.5" />إضافة مادة خام</Button>
            <Button variant="outline" onClick={() => navigate("/recipes/new")}><Plus className="h-4 w-4 ml-1.5" />إضافة وصفة</Button>
            <Button variant="outline" onClick={() => navigate("/sales/import")}><Upload className="h-4 w-4 ml-1.5" />استيراد المبيعات</Button>
          </CardContent>
        </Card>

        {topDishes.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">أكثر الأطباق ربحاً</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDishes.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                      <span className="font-medium text-sm">{r.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-success">{r.margin.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
