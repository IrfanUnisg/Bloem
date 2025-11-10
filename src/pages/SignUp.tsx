import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Store, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<"seller" | "store" | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    ownerName: "",
    businessHours: "",
    acceptedTerms: false,
  });

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate(user.role === "store" ? "/store/inventory" : "/dashboard");
    }

    // Check for role in URL
    const roleParam = searchParams.get("role");
    if (roleParam === "seller" || roleParam === "store") {
      setSelectedRole(roleParam);
    }
  }, [searchParams, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "passwords don't match",
        description: "please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    const name = selectedRole === "seller" 
      ? `${formData.firstName} ${formData.lastName}`
      : formData.firstName; // Store name for store accounts

    const result = await signup(
      name, 
      formData.email, 
      formData.password, 
      selectedRole,
      formData.phone,
      selectedRole === "store" ? formData.address : undefined
    );
    
    if (result.success) {
      toast({
        title: "account created!",
        description: "welcome to bloem. redirecting you now...",
      });
      // Auto-redirect after successful signup
      setTimeout(() => {
        navigate(selectedRole === "store" ? "/store/inventory" : "/dashboard");
      }, 1000);
    } else {
      toast({
        title: "sign up failed",
        description: result.error || "something went wrong. please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="public" />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {!selectedRole ? (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">join bloem</h1>
                <p className="text-muted-foreground">choose how you'd like to use bloem</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className={cn(
                    "p-8 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2",
                    "hover:border-primary"
                  )}
                  onClick={() => setSelectedRole("seller")}
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                    <User className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground text-center mb-3">
                    seller/buyer
                  </h2>
                  <p className="text-muted-foreground text-center text-sm">
                    sell your clothes and browse local thrift inventory
                  </p>
                </Card>

                <Card
                  className={cn(
                    "p-8 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2",
                    "hover:border-primary"
                  )}
                  onClick={() => setSelectedRole("store")}
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                    <Store className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground text-center mb-3">
                    thrift store
                  </h2>
                  <p className="text-muted-foreground text-center text-sm">
                    manage inventory and grow your business digitally
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="p-8">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRole(null)}
                  className="mb-4"
                >
                  ← back
                </Button>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {selectedRole === "seller" ? "create your account" : "register your store"}
                </h1>
                <p className="text-muted-foreground">
                  {selectedRole === "seller"
                    ? "start selling and shopping sustainably"
                    : "join our network of partner thrift stores"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedRole === "seller" ? (
                  <>
                    {/* Title Selection */}
                    <div>
                      <Label>title</Label>
                      <div className="flex gap-4 mt-2">
                        {["mr.", "ms.", "mx."].map((title) => (
                          <label key={title} className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={formData.title === title}
                              onCheckedChange={() => setFormData({ ...formData, title })}
                            />
                            <span className="text-sm">{title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* First and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">first name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="anna"
                        className="mt-1.5"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                      </div>
                      <div>
                        <Label htmlFor="lastName">last name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="müller"
                        className="mt-1.5"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+41 79 123 45 67"
                      className="mt-1.5"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Store Name */}
                    <div>
                      <Label htmlFor="storeName">store name</Label>
                    <Input
                      id="storeName"
                      type="text"
                      placeholder="vintage zürich"
                      className="mt-1.5"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    </div>

                    {/* Owner Name */}
                    <div>
                      <Label htmlFor="ownerName">owner name</Label>
                    <Input
                      id="ownerName"
                      type="text"
                      placeholder="hans meier"
                      className="mt-1.5"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                    />
                    </div>

                    {/* Store Address */}
                    <div>
                      <Label htmlFor="address">store address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="bahnhofstrasse 45, 8001 zürich"
                      className="mt-1.5"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+41 44 123 45 67"
                      className="mt-1.5"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    </div>

                    {/* Business Hours */}
                    <div>
                      <Label htmlFor="businessHours">business hours</Label>
                      <Input
                        id="businessHours"
                        type="text"
                        placeholder="mon-sat: 10am-7pm"
                        className="mt-1.5"
                        value={formData.businessHours}
                        onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <Label htmlFor="email">email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="anna.mueller@example.ch"
                      className="mt-1.5"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptedTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptedTerms: checked as boolean })}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                    i agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline" target="_blank">
                      terms and conditions
                    </Link>
                  </Label>
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={isLoading || !formData.acceptedTerms}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      creating account...
                    </>
                  ) : (
                    "create account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">already have an account? </span>
                <Link to="/sign-in" className="text-primary hover:underline font-medium">
                  sign in
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SignUp;
