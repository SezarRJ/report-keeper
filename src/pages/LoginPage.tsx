import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChefHat, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
              <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">كلمة المرور</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              {isSignUp ? "إنشاء حساب" : "دخول"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "لديك حساب؟ " : "ليس لديك حساب؟ "}
              <button type="button" className="text-primary hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
