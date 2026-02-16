import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Receipt, TrendingUp, DollarSign } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) => (
  <Card className="glass-card animate-fade-in">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { dishes, expenses } = useStore();

  const totalDishCost = dishes.reduce((sum, d) => sum + d.totalCost, 0);
  const totalRevenue = dishes.reduce((sum, d) => sum + d.sellingPrice, 0);
  const totalProfit = dishes.reduce((sum, d) => sum + d.profit, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على تكاليف وأرباح المطعم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="عدد الأطباق"
            value={dishes.length.toString()}
            icon={UtensilsCrossed}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            title="إجمالي التكاليف"
            value={`${totalDishCost.toFixed(2)} د.ع`}
            icon={DollarSign}
            color="bg-destructive/10 text-destructive"
          />
          <StatCard
            title="إجمالي الأرباح"
            value={`${totalProfit.toFixed(2)} د.ع`}
            icon={TrendingUp}
            color="bg-success/10 text-success"
          />
          <StatCard
            title="إجمالي المصاريف"
            value={`${totalExpenses.toFixed(2)} د.ع`}
            icon={Receipt}
            color="bg-warning/10 text-warning"
          />
        </div>

        {dishes.length === 0 && expenses.length === 0 && (
          <Card className="glass-card p-12 text-center">
            <p className="text-muted-foreground text-lg">
              ابدأ بإضافة أطباق ومصاريف لتتبع أرباح مطعمك
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
