import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Check, X, Clock, Store } from "lucide-react";

interface StoreApplication {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const mockApplications: StoreApplication[] = [
  {
    id: "app1",
    storeName: "Urban Threads",
    ownerName: "Maria Garcia",
    email: "maria@urbanthreads.nl",
    address: "Prinsengracht 234",
    city: "Amsterdam",
    phone: "+31 20 555 0606",
    submittedAt: "2025-01-14",
    status: "pending",
  },
  {
    id: "app2",
    storeName: "Retro Corner",
    ownerName: "Jan de Vries",
    email: "jan@retrocorner.nl",
    address: "Westerstraat 89",
    city: "Amsterdam",
    phone: "+31 20 555 0707",
    submittedAt: "2025-01-13",
    status: "pending",
  },
  {
    id: "app3",
    storeName: "Eco Fashion Hub",
    ownerName: "Sara Johnson",
    email: "sara@ecofashion.nl",
    address: "Nieuwmarkt 45",
    city: "Amsterdam",
    phone: "+31 20 555 0808",
    submittedAt: "2025-01-10",
    status: "approved",
  },
];

const AdminStores = () => {
  const [applications, setApplications] = useState(mockApplications);
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = (id: string) => {
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status: "approved" as const } : app)
    );
  };

  const handleReject = (id: string) => {
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status: "rejected" as const } : app)
    );
  };

  const filteredApplications = applications.filter(app =>
    app.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;

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
                            <Button size="sm" onClick={() => handleApprove(app.id)}>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>
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
