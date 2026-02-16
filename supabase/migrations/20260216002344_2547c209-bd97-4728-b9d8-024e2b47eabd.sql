
-- ==========================================
-- 1. RESTAURANTS TABLE
-- ==========================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  currency TEXT NOT NULL DEFAULT 'IQD',
  target_margin_percent NUMERIC NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own restaurant"
  ON public.restaurants FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert their own restaurant"
  ON public.restaurants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own restaurant"
  ON public.restaurants FOR UPDATE TO authenticated
  USING (auth.uid() = owner_user_id);

-- ==========================================
-- 2. OPERATING COSTS TABLE
-- ==========================================
CREATE TABLE public.operating_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  cost_type TEXT NOT NULL DEFAULT 'fixed' CHECK (cost_type IN ('fixed', 'variable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operating_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own restaurant costs"
  ON public.operating_costs FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()));

-- ==========================================
-- 3. INGREDIENTS TABLE
-- ==========================================
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'كغ',
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own restaurant ingredients"
  ON public.ingredients FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()));

-- ==========================================
-- 4. RECIPES TABLE
-- ==========================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'أطباق رئيسية',
  selling_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own restaurant recipes"
  ON public.recipes FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()));

-- ==========================================
-- 5. RECIPE INGREDIENTS TABLE
-- ==========================================
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recipe ingredients"
  ON public.recipe_ingredients FOR ALL TO authenticated
  USING (recipe_id IN (SELECT r.id FROM public.recipes r JOIN public.restaurants res ON r.restaurant_id = res.id WHERE res.owner_user_id = auth.uid()))
  WITH CHECK (recipe_id IN (SELECT r.id FROM public.recipes r JOIN public.restaurants res ON r.restaurant_id = res.id WHERE res.owner_user_id = auth.uid()));

-- ==========================================
-- 6. COMPETITOR PRICES TABLE
-- ==========================================
CREATE TABLE public.competitor_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitor_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own competitor prices"
  ON public.competitor_prices FOR ALL TO authenticated
  USING (recipe_id IN (SELECT r.id FROM public.recipes r JOIN public.restaurants res ON r.restaurant_id = res.id WHERE res.owner_user_id = auth.uid()))
  WITH CHECK (recipe_id IN (SELECT r.id FROM public.recipes r JOIN public.restaurants res ON r.restaurant_id = res.id WHERE res.owner_user_id = auth.uid()));

-- ==========================================
-- 7. VOLUME DISCOUNT RULES TABLE
-- ==========================================
CREATE TABLE public.volume_discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  min_weekly_sales INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.volume_discount_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own discount rules"
  ON public.volume_discount_rules FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()));

-- ==========================================
-- 8. MAPPING PROFILES TABLE
-- ==========================================
CREATE TABLE public.mapping_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_column TEXT,
  dish_name_column TEXT,
  quantity_column TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mapping_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mapping profiles"
  ON public.mapping_profiles FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()));

-- ==========================================
-- 9. SALES IMPORTS TABLE
-- ==========================================
CREATE TABLE public.sales_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  file_name TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mapping_profile_id UUID REFERENCES public.mapping_profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'mapped', 'matched', 'completed'))
);
ALTER TABLE public.sales_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sales imports"
  ON public.sales_imports FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_user_id = auth.uid()));

-- ==========================================
-- 10. SALES ROWS TABLE
-- ==========================================
CREATE TABLE public.sales_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.sales_imports(id) ON DELETE CASCADE,
  raw_dish_name TEXT NOT NULL,
  matched_recipe_id UUID REFERENCES public.recipes(id),
  sale_date DATE,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sales rows"
  ON public.sales_rows FOR ALL TO authenticated
  USING (import_id IN (SELECT si.id FROM public.sales_imports si JOIN public.restaurants res ON si.restaurant_id = res.id WHERE res.owner_user_id = auth.uid()))
  WITH CHECK (import_id IN (SELECT si.id FROM public.sales_imports si JOIN public.restaurants res ON si.restaurant_id = res.id WHERE res.owner_user_id = auth.uid()));

-- ==========================================
-- UPDATE TIMESTAMP TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operating_costs_updated_at BEFORE UPDATE ON public.operating_costs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
