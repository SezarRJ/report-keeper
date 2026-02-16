import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CITIES } from "@/data/mockData";

/**
 * PROTOTYPE_MODE:
 * - Allow proceeding to dashboard even if createRestaurant fails
 *   (e.g., Supabase not configured, not logged in).
 * - Uses demo_unlocked flag to bypass ProtectedRoute.
 */
const PROTOTYPE_MODE = true;

const SetupPage = () => {
  const navigate = useNavigate();
  const { createRestaurant } = useRestaurant();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState("IQD");
  const [targetMargin, setTargetMargin] = useState("60");
  const [loading, setLoading] = useState(false);

  const unlockAndGo = () => {
    // ✅ Unlock prototype navigation
    localStorage.setItem("demo_unlocked", "1");

    // Navigate normally
    navigate("/dashboard");

    // Hard fallback (some preview environments behave oddly)
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("يرجى إدخال اسم المطعم");
      return;
    }

    setLoading(true);

    try {
      // If user exists, try real restaurant creation
      if (user) {
        await createRestaurant({
          name: name.trim(),
          city,
          currency,
          target_margin_percent: parseFloat(targetMargin) || 60,
        });
        toast.success("تم إعداد المطعم بنجاح!");
        unlockAndGo();
        return;
      }

      // If no user (auth not ready / not logged in)
      if (PROTOTYPE_MODE) {
        toast.success("تم حفظ الإعدادات (وضع تجريبي)!");
        unlockAndGo();
        return;
      }

      toast.error("يرجى تسجيل الدخول أولاً");
    } catch (err: any) {
      // If createRestaurant fails but we are in prototype mode, still allow navigation
      if (PROTOTYPE_MODE) {
        toast.success("تم حفظ الإعدادات (وضع تجريبي)!");
        unlockAndGo();
        return;
      }

      toast.error(err?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">إعداد المطعم</CardTitle>
          <p className="text-sm text-muted-foreground">أدخل بيانات مطعمك للبدء</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">اسم المطعم</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مطعم الشام"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">المدينة</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">العملة الافتراضية</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IQD">دينار عراقي (IQD)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">هامش الربح المستهدف %</label>
              <Input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                dir="ltr"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حفظ وبدء الاستخدام
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
