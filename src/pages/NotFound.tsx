import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <p className="text-lg text-muted-foreground">الصفحة غير موجودة</p>
      <Button asChild>
        <Link to="/dashboard">العودة للرئيسية</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
