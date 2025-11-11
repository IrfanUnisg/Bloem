import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Browse from "./pages/Browse";
import BrowseStores from "./pages/BrowseStores";
import ItemDetail from "./pages/ItemDetail";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
import StoreProfile from "./pages/StoreProfile";
import StoreInventory from "./pages/store/StoreInventory";
import StoreDropoffs from "./pages/store/StoreDropoffs";
import StoreAnalytics from "./pages/store/StoreAnalytics";
import StoreCheckout from "./pages/store/StoreCheckout";
import StoreMarketing from "./pages/store/StoreMarketing";
import AdminStores from "./pages/admin/AdminStores";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/browse-stores" element={<BrowseStores />} />
              <Route path="/browse/:id" element={<ItemDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/store-profile" element={<StoreProfile />} />
              <Route path="/store/inventory" element={<StoreInventory />} />
              <Route path="/store/dropoffs" element={<StoreDropoffs />} />
              <Route path="/store/analytics" element={<StoreAnalytics />} />
              <Route path="/store/checkout" element={<StoreCheckout />} />
              <Route path="/store/marketing" element={<StoreMarketing />} />
              <Route path="/admin/stores" element={<AdminStores />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/terms" element={<Terms />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
