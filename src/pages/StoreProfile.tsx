import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store, Mail, Phone, MapPin, Clock, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { storeService, StoreStats } from "@/services/store.service";
import type { Store as StoreType } from "@/services/store.service";

const StoreProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [store, setStore] = useState<StoreType | null>(null);
  const [stats, setStats] = useState<StoreStats>({
    itemsSoldThisMonth: 0,
    monthlyRevenue: 0,
    activeInventory: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    hours: "",
    description: "",
    ownerName: "",
  });

  useEffect(() => {
    if (user) {
      fetchStoreData();
    }
  }, [user]);

  const fetchStoreData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const storeData = await storeService.getStoreByOwnerId(user.id);
      
      if (!storeData) {
        // User doesn't own a store - this is okay, just don't show store data
        setStore(null);
        setIsLoading(false);
        return;
      }

      setStore(storeData);
      
      // Fetch stats
      const storeStats = await storeService.getStoreStats(storeData.id);
      setStats(storeStats);

      setFormData({
        name: storeData.name,
        email: storeData.email,
        phone: storeData.phone,
        address: storeData.address,
        hours: storeData.hours || '',
        description: storeData.description || '',
        ownerName: user.name || user.email || '',
      });
    } catch (error) {
      console.error('Error fetching store data:', error);
      // Don't show error toast for missing store, only for actual errors
      if (error && error.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: "Failed to load store data.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !store) return;

    setIsSaving(true);
    try {
      const updatedStore = await storeService.updateStore(store.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        hours: formData.hours,
        description: formData.description,
      });

      if (updatedStore) {
        setStore(updatedStore);
        toast({
          title: "store profile updated",
          description: "your changes have been saved successfully.",
        });
      } else {
        throw new Error('Failed to update store');
      }
    } catch (error) {
      console.error('Error saving store profile:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast({
      title: "logged out",
      description: "you have been successfully logged out.",
    });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">store profile</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !store ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center py-8">
                <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Store Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have a store associated with this account.
                </p>
                <Button onClick={() => navigate("/")}>
                  Go to Home
                </Button>
              </div>
            </Card>

            {/* Account Actions - Still allow logout */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                account actions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">log out</p>
                    <p className="text-sm text-muted-foreground">sign out of your account</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    log out
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Store Header */}
            <Card className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={store.logo || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    <Store className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {formData.name}
                  </h2>
                  <p className="text-muted-foreground">
                    partner since {new Date(store.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    change photo
                  </Button>
                </div>
              </div>
            </Card>

          {/* Store Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              store information
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">store name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">owner name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">business hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hours"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    saving...
                  </>
                ) : (
                  'save changes'
                )}
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              store stats
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{stats.itemsSoldThisMonth}</div>
                <p className="text-sm text-muted-foreground">items sold this month</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">€{stats.monthlyRevenue.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">monthly revenue</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{stats.activeInventory}</div>
                <p className="text-sm text-muted-foreground">active inventory</p>
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              account actions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">log out</p>
                  <p className="text-sm text-muted-foreground">sign out of your store account</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  log out
                </Button>
              </div>
            </div>
          </Card>
        </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreProfile;
