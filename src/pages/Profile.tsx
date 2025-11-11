import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Mail, Phone, MapPin, CreditCard, Trash2, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userProfileService, UserProfile, UserStats } from "@/services/user-profile.service";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalEarnings: 0,
    itemsSold: 0,
    itemsActive: 0,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    topSize: "",
    bottomSize: "",
    shoeSize: "",
    iban: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [userProfile, userStats] = await Promise.all([
        userProfileService.getUserProfile(user.id),
        userProfileService.getUserStats(user.id),
      ]);

      if (userProfile) {
        setProfile(userProfile);
        // Split name into first and last name
        const nameParts = userProfile.name?.split(' ') || ['', ''];
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          topSize: userProfile.topSize || '',
          bottomSize: userProfile.bottomSize || '',
          shoeSize: userProfile.shoeSize || '',
          iban: userProfile.bankAccount || '',
        });
      }
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      const updatedProfile = await userProfileService.updateUserProfile(user.id, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.address,
        topSize: formData.topSize,
        bottomSize: formData.bottomSize,
        shoeSize: formData.shoeSize,
        bankAccount: formData.iban,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "profile updated",
          description: "your changes have been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "logged out",
      description: "you have been successfully logged out.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const success = await userProfileService.deleteAccount(user.id);
      
      if (success) {
        toast({
          title: "account deleted",
          description: "your account has been permanently deleted.",
          variant: "destructive",
        });
        setTimeout(() => {
          logout();
          navigate("/");
        }, 1500);
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">my profile</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !profile ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Unable to load profile data.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="p-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-muted-foreground">
                  member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              personal information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">first name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">last name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

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

              <div className="space-y-2 md:col-span-2">
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

              {/* Size Information */}
              <div className="space-y-2 md:col-span-2">
                <h4 className="font-medium text-foreground mb-3">size preferences</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topSize">top size</Label>
                    <Select value={formData.topSize} onValueChange={(value) => setFormData({ ...formData, topSize: value })}>
                      <SelectTrigger id="topSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">xs</SelectItem>
                        <SelectItem value="s">s</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="xl">xl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bottomSize">bottom size</Label>
                    <Select value={formData.bottomSize} onValueChange={(value) => setFormData({ ...formData, bottomSize: value })}>
                      <SelectTrigger id="bottomSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">xs</SelectItem>
                        <SelectItem value="s">s</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="xl">xl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shoeSize">shoe size (eu)</Label>
                    <Input
                      id="shoeSize"
                      value={formData.shoeSize}
                      onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                    />
                  </div>
                </div>
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

          {/* Payment Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              payment information
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="iban">bank account (iban)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="pl-10"
                    placeholder="CH93 0076 2011 6238 5295 7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This account will be used for receiving payouts from sold items
                </p>
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
                  'save payment info'
                )}
              </Button>
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
                  <p className="text-sm text-muted-foreground">sign out of your account</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  log out
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">delete account</p>
                    <p className="text-sm text-muted-foreground">permanently remove your account and all data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        delete account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          this action cannot be undone. this will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          delete account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              your stats
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{stats.itemsSold}</div>
                <p className="text-sm text-muted-foreground">items sold</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">€{stats.totalEarnings.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">total earnings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{stats.itemsActive}</div>
                <p className="text-sm text-muted-foreground">active listings</p>
              </div>
            </div>
          </Card>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
