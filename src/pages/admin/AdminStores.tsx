import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Check, X, Clock, Store, Loader2 } from "lucide-react";
import { adminService, StoreApplication } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

const AdminStores = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<StoreApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await adminService.getStoreApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: "Error loading applications",
        description: "Failed to load store applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const success = await adminService.approveStore(id);
      
      if (success) {
        toast({
          title: "Store approved!",
          description: "The store is now active and can accept items.",
        });
        await loadApplications(); // Reload data
      } else {
        throw new Error('Approval failed');
      }
    } catch (error) {
      toast({
        title: "Error approving store",
        description: "Failed to approve the store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const success = await adminService.rejectStore(id);
      
      if (success) {
        toast({
          title: "Store rejected",
          description: "The store owner will be notified.",
        });
        await loadApplications(); // Reload data
      } else {
        throw new Error('Rejection failed');
      }
    } catch (error) {
      toast({
        title: "Error rejecting store",
        description: "Failed to reject the store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Store Management</h1>
            <p className="text-muted-foreground">Review and approve store applications</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Require action</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Verified partners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Store Applications</CardTitle>
                  <CardDescription>Manage store verification requests</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-6">
                  {filteredApplications.filter(a => a.status === "pending").map(app => (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{app.storeName}</h3>
                              <Badge variant="secondary">{app.status}</Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                              <div><span className="font-medium">Owner:</span> {app.ownerName}</div>
                              <div><span className="font-medium">Email:</span> {app.email}</div>
                              <div><span className="font-medium">Address:</span> {app.address}, {app.city}</div>
                              <div><span className="font-medium">Phone:</span> {app.phone}</div>
                              <div><span className="font-medium">Submitted:</span> {app.submittedAt}</div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(app.id)}
                              disabled={processingId === app.id}
                            >
                              {processingId === app.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleReject(app.id)}
                              disabled={processingId === app.id}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredApplications.filter(a => a.status === "pending").length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No pending applications
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4 mt-6">
                  {filteredApplications.filter(a => a.status === "approved").map(app => (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{app.storeName}</h3>
                          <Badge variant="default">Approved</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                          <div><span className="font-medium">Owner:</span> {app.ownerName}</div>
                          <div><span className="font-medium">Email:</span> {app.email}</div>
                          <div><span className="font-medium">Address:</span> {app.address}, {app.city}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredApplications.map(app => (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{app.storeName}</h3>
                          <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                            {app.status}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                          <div><span className="font-medium">Owner:</span> {app.ownerName}</div>
                          <div><span className="font-medium">Email:</span> {app.email}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStores;
