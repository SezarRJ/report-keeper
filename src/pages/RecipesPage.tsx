import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Plus, ChefHat, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipeRow {
  id: string;
  name: string;
  category: string;
  selling_price: number;
  ingredient_cost: number;
}

const fmt = (n: number) => n.toLocaleString("en-US");

const RecipesPage = () => {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    if (!restaurant) return;
    // Fetch recipes with their ingredient costs
    const { data: recipesData } = await supabase
      .from("recipes")
      .select("id, name, category, selling_price")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    if (!recipesData) { setLoading(false); return; }

    // Fetch all recipe_ingredients with ingredient prices
    const recipeIds = recipesData.map(r => r.id);
    const { data: riData } = await supabase
      .from("recipe_ingredients")
      .select("recipe_id, quantity, ingredient_id, ingredients(price_per_unit)")
      .in("recipe_id", recipeIds.length > 0 ? recipeIds : ["none"]);

    const costMap: Record<string, number> = {};
    (riData || []).forEach((ri: any) => {
      const cost = ri.quantity * (ri.ingredients?.price_per_unit || 0);
      costMap[ri.recipe_id] = (costMap[ri.recipe_id] || 0) + cost;
    });

    setRecipes(recipesData.map(r => ({
      ...r,
      ingredient_cost: costMap[r.id] || 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchRecipes(); }, [restaurant]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else { toast({ title: "تم الحذف" }); fetchRecipes(); }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">الوصفات</h1>
            <p className="text-sm text-muted-foreground mt-1">قائمة وصفات المطعم وتكاليفها</p>
          </div>
          <Button asChild>
            <Link to="/recipes/new"><Plus className="h-4 w-4 ml-1.5" />إضافة وصفة جديدة</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : recipes.length === 0 ? (
          <Card className="p-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد وصفات بعد.</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصحن</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>تكلفة المكونات</TableHead>
                  <TableHead>الهامش</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((r) => {
                  const margin = r.selling_price > 0 ? ((r.selling_price - r.ingredient_cost) / r.selling_price * 100) : 0;
                  return (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/recipes/${r.id}`)}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell><Badge variant="secondary">{r.category}</Badge></TableCell>
                      <TableCell>{fmt(r.ingredient_cost)} د.ع</TableCell>
                      <TableCell>
                        <span className={margin >= 50 ? "text-success font-semibold" : "text-warning font-semibold"}>
                          {margin.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(r.id, e)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default RecipesPage;
