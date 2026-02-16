import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SetupPage from "./pages/SetupPage";
import DashboardPage from "./pages/DashboardPage";
import CostsPage from "./pages/CostsPage";
import IngredientsPage from "./pages/IngredientsPage";
// NewIngredientPage removed - ingredients managed via dialog in IngredientsPage
import RecipesPage from "./pages/RecipesPage";
import NewRecipePage from "./pages/NewRecipePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import OffersRulesPage from "./pages/OffersRulesPage";
import SalesImportPage from "./pages/SalesImportPage";
import SalesMappingPage from "./pages/SalesMappingPage";
import SalesMatchingPage from "./pages/SalesMatchingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
              <Route path="/costs" element={<Protected><CostsPage /></Protected>} />
              <Route path="/ingredients" element={<Protected><IngredientsPage /></Protected>} />
              <Route path="/ingredients/new" element={<Navigate to="/ingredients" replace />} />
              <Route path="/recipes" element={<Protected><RecipesPage /></Protected>} />
              <Route path="/recipes/new" element={<Protected><NewRecipePage /></Protected>} />
              <Route path="/recipes/:id" element={<Protected><RecipeDetailPage /></Protected>} />
              <Route path="/offers/rules" element={<Protected><OffersRulesPage /></Protected>} />
              <Route path="/sales/import" element={<Protected><SalesImportPage /></Protected>} />
              <Route path="/sales/mapping" element={<Protected><SalesMappingPage /></Protected>} />
              <Route path="/sales/matching" element={<Protected><SalesMatchingPage /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
