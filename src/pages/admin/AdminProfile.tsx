import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Mail, Phone, Shield, LogOut, Key, Activity } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "admin user",
    email: user?.email || "admin@bloem.app",
    phone: "+31 20 789 1234",
    role: "super admin",
    department: "platform operations",
  });

  const handleSave = () => {
    toast({
      title: "profile updated",
      description: "your changes have been saved successfully.",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "logged out",
      description: "you have been successfully logged out.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "password change initiated",
      description: "check your email for password reset instructions.",
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">admin profile</h1>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl bg-primary/10">
                  <Shield className="h-12 w-12 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {formData.name}
                  </h2>
                  <Badge variant="default" className="bg-primary">
                    <Shield className="h-3 w-3 mr-1" />
                    {formData.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">administrator since january 2024</p>
                <p className="text-sm text-muted-foreground">{formData.department}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  change photo
                </Button>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              personal information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="department">department</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave}>save changes</Button>
            </div>
          </Card>

          {/* Admin Permissions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              permissions & access
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">store management</p>
                    <p className="text-sm text-muted-foreground">approve and manage store applications</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">analytics access</p>
                    <p className="text-sm text-muted-foreground">view platform-wide analytics and reports</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">user support</p>
                    <p className="text-sm text-muted-foreground">manage support tickets and user issues</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">active</Badge>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              security settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">change password</p>
                  <p className="text-sm text-muted-foreground">update your account password</p>
                </div>
                <Button variant="outline" onClick={handleChangePassword}>
                  <Key className="mr-2 h-4 w-4" />
                  change password
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">add an extra layer of security</p>
                  </div>
                  <Button variant="outline">
                    enable 2fa
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">session management</p>
                    <p className="text-sm text-muted-foreground">view and manage active sessions</p>
                  </div>
                  <Button variant="outline">
                    view sessions
                  </Button>
                </div>
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
                  <p className="text-sm text-muted-foreground">sign out of your admin account</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  log out
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">activity log</p>
                    <p className="text-sm text-muted-foreground">view your recent admin activities</p>
                  </div>
                  <Button variant="outline">
                    view activity
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Admin Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              admin statistics
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">47</div>
                <p className="text-sm text-muted-foreground">stores approved</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">132</div>
                <p className="text-sm text-muted-foreground">tickets resolved</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">8.2k</div>
                <p className="text-sm text-muted-foreground">platform users</p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              recent activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">approved store application</p>
                  <p className="text-xs text-muted-foreground">urban threads - 2 hours ago</p>
                </div>
                <Badge variant="outline" className="text-xs">approved</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">resolved support ticket #2847</p>
                  <p className="text-xs text-muted-foreground">payment issue - 5 hours ago</p>
                </div>
                <Badge variant="outline" className="text-xs">resolved</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">reviewed platform analytics</p>
                  <p className="text-xs text-muted-foreground">monthly report - yesterday</p>
                </div>
                <Badge variant="outline" className="text-xs">viewed</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
