import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPlatformAnalytics } from "@/data/mockAnalytics";
import { Users, Store, TrendingUp, Euro, Package, Clock } from "lucide-react";

const AdminAnalytics = () => {
  const analytics = mockPlatformAnalytics;

  return (
    <AdminLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Platform Analytics</h1>
            <p className="text-muted-foreground">Overview of Bloem's performance and growth</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Sellers & buyers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Partner Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalStores}</div>
                <p className="text-xs text-muted-foreground mt-1">Verified thrift shops</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Total sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{(analytics.totalRevenue / 1000).toFixed(0)}k</div>
                <p className="text-xs text-muted-foreground mt-1">All-time GMV</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeListings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Available items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingVerifications}</div>
                <p className="text-xs text-muted-foreground mt-1">Store applications</p>
              </CardContent>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly active user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end gap-4">
                {analytics.userGrowth.map((data, idx) => {
                  const maxUsers = Math.max(...analytics.userGrowth.map(d => d.users));
                  const height = (data.users / maxUsers) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80" style={{ height: `${height}%` }}></div>
                      <div className="text-xs font-medium text-muted-foreground mt-3">{data.month}</div>
                      <div className="text-sm font-semibold text-foreground">{data.users.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Store Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Stores</CardTitle>
              <CardDescription>Revenue and inventory metrics by store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.storePerformance.map((store, idx) => {
                  const maxRevenue = Math.max(...analytics.storePerformance.map(s => s.revenue));
                  const revenueWidth = (store.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{store.name}</div>
                            <div className="text-sm text-muted-foreground">{store.items} items</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">€{store.revenue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${revenueWidth}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
