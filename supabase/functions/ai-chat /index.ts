import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, restaurantId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch restaurant data for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let contextData = "";

    if (restaurantId) {
      // Fetch restaurant info
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, city, default_currency, target_margin_pct")
        .eq("id", restaurantId)
        .single();

      // Fetch recipes with costs
      const { data: recipes } = await supabase
        .from("recipes")
        .select("name, category, selling_price, recipe_ingredients(quantity, ingredients(name, unit_price, unit))")
        .eq("restaurant_id", restaurantId);

      // Fetch operating costs
      const { data: costs } = await supabase
        .from("operating_costs")
        .select("name, cost_type, monthly_amount")
        .eq("restaurant_id", restaurantId);

      const totalOpCost = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
      const totalRecipes = recipes?.length ?? 1;
      const overheadPerDish = totalOpCost / totalRecipes;
      const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

      const recipeSummaries = (recipes ?? []).map(r => {
        const ingCost = r.recipe_ingredients?.reduce(
          (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
        ) ?? 0;
        const trueCost = ingCost + overheadPerDish;
        const margin = Number(r.selling_price) > 0 ? ((Number(r.selling_price) - trueCost) / Number(r.selling_price)) * 100 : 0;
        return `- ${r.name} (${r.category}): تكلفة المكونات=${ingCost.toFixed(0)}${currency}, حصة المصاريف=${overheadPerDish.toFixed(0)}${currency}, التكلفة الحقيقية=${trueCost.toFixed(0)}${currency}, سعر البيع=${r.selling_price}${currency}, الهامش=${margin.toFixed(0)}%`;
      }).join("\n");

      const costSummaries = (costs ?? []).map(c => 
        `- ${c.name} (${c.cost_type === "fixed" ? "ثابت" : "متغير"}): ${c.monthly_amount}${currency}/شهر`
      ).join("\n");

      contextData = `
بيانات المطعم:
- الاسم: ${restaurant?.name}
- المدينة: ${restaurant?.city}
- العملة: ${currency}
- هامش الربح المستهدف: ${restaurant?.target_margin_pct}%

المصاريف التشغيلية الشهرية (إجمالي: ${totalOpCost.toLocaleString()}${currency}):
${costSummaries || "لا توجد مصاريف مسجلة"}

الأطباق والتكاليف:
${recipeSummaries || "لا توجد أطباق مسجلة"}
`;
    }

    const systemPrompt = `أنت مساعد ذكي متخصص في تحليل تكاليف المطاعم وتسعير الأطباق. تتحدث بالعربية.

مهامك:
1. تحليل تكاليف الأطباق واقتراح تحسينات
2. اقتراح أسعار بيع مناسبة بناءً على التكلفة الحقيقية وهامش الربح المستهدف
3. تحديد الأطباق ذات الهوامش المنخفضة واقتراح حلول
4. تقديم نصائح لتقليل التكاليف وزيادة الربحية
5. مقارنة الأداء المالي بين الأطباق

قواعد مهمة:
- استخدم البيانات الفعلية للمطعم في تحليلاتك
- قدم أرقاماً محددة وواضحة
- اقترح حلولاً عملية وقابلة للتطبيق
- أجب بإيجاز ووضوح
- استخدم التنسيق المناسب (قوائم، جداول) لسهولة القراءة

${contextData ? "بيانات المطعم الحالية:\n" + contextData : "لا تتوفر بيانات للمطعم حالياً."}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار في استخدام المساعد الذكي." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
