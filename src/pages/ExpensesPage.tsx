import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Expense, EXPENSE_CATEGORIES } from "@/types";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => {
    setDescription("");
    setCategory(EXPENSE_CATEGORIES[0]);
    setAmount(0);
    setDate(new Date().toISOString().split("T")[0]);
    setEditing(null);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setDescription(exp.description);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(exp.date);
    setOpen(true);
  };

  const handleSave = () => {
    if (!description.trim()) {
      toast.error("يرجى إدخال وصف المصروف");
      return;
    }
    const expense: Expense = {
      id: editing?.id || crypto.randomUUID(),
      description,
      category,
      amount,
      date,
    };
    if (editing) {
      updateExpense(expense);
      toast.success("تم تحديث المصروف");
    } else {
      addExpense(expense);
      toast.success("تم إضافة المصروف");
    }
    resetForm();
    setOpen(false);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">المصاريف</h1>
            <p className="text-muted-foreground mt-1">تتبع مصاريف المطعم التشغيلية</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-2" />إضافة مصروف</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "تعديل المصروف" : "إضافة مصروف جديد"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">الوصف</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف المصروف" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">التصنيف</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">المبلغ</label>
                    <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">التاريخ</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave}>{editing ? "تحديث" : "حفظ"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {expenses.length > 0 && (
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground">إجمالي المصاريف: <span className="text-lg font-bold text-foreground">{total.toFixed(2)} د.ع</span></p>
          </Card>
        )}

        {expenses.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <p className="text-muted-foreground">لا توجد مصاريف بعد.</p>
          </Card>
        ) : (
          <Card className="glass-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوصف</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id} className="animate-fade-in">
                    <TableCell className="font-medium">{exp.description}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>{exp.amount.toFixed(2)} د.ع</TableCell>
                    <TableCell>{exp.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(exp)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteExpense(exp.id); toast.success("تم حذف المصروف"); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ExpensesPage;
