import { Link } from "react-router-dom";
import { ShoppingBag, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/bloem-logo.png";

interface HeaderProps {
  variant?: "public" | "authenticated" | "store" | "admin";
}

export function Header({
  variant = "public"
}: HeaderProps) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  
  return <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="bloem" className="h-12 md:h-16" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {variant === "public" && !user && <>
                <Link to="/sign-in">
                  <Button variant="ghost">sign in</Button>
                </Link>
                <Link to="/sign-up">
                  <Button>sign up</Button>
                </Link>
              </>}

            {variant === "authenticated" && <>
                <Link to="/cart" className="relative p-2">
                  <ShoppingBag className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
                  {totalItems > 0 && <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center font-medium text-foreground">
                      {totalItems}
                    </span>}
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>}

            {variant === "admin" && <>
                <Link to="/admin/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>}

            {variant === "store" && <>
                <Link to="/store-profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>}
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col space-y-4 mt-8">
                {variant === "public" && !user && <>
                    <Link to="/sign-in">
                      <Button variant="ghost" className="w-full justify-start h-11">sign in</Button>
                    </Link>
                    <Link to="/sign-up">
                      <Button className="w-full h-11">sign up</Button>
                    </Link>
                  </>}

                {variant === "authenticated" && <>
                    <Link to="/cart" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 h-11 flex items-center">
                      cart ({totalItems})
                    </Link>
                    <Link to="/profile" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 h-11 flex items-center">
                      profile
                    </Link>
                  </>}

                {variant === "admin" && <>
                    <Link to="/admin/profile" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 h-11 flex items-center">
                      profile
                    </Link>
                  </>}

                {variant === "store" && <>
                    <Link to="/store-profile" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 h-11 flex items-center">
                      profile
                    </Link>
                  </>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>;
}