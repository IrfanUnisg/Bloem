import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { StatCard } from "@/components/cards/StatCard";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Package, TrendingUp, Users, Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { storeService } from "@/services/store.service";
import { itemService } from "@/services/item.service";
import { useToast } from "@/hooks/use-toast";
import { pageMetadata } from "@/lib/seo";

const StoreAnalytics = () => {
  const meta = pageMetadata.storeAnalytics();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    itemsSoldThisMonth: 0,
    monthlyRevenue: 0,
    activeInventory: 0,
  });
  const [inventoryBreakdown, setInventoryBreakdown] = useState({
    storeOwned: 0,
    consignment: 0,
    pendingDropoff: 0,
  });
  const [categoryData, setCategoryData] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get store owned by current user
      const store = await storeService.getStoreByOwnerId(user.id);
      
      if (!store) {
        toast({
          title: "No store found",
          description: "You don't have a store associated with your account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get store statistics
      const storeStats = await storeService.getStoreStats(store.id);
      setStats(storeStats);

      // Get all items for breakdown
      const allItems = await itemService.getItemsByStore(store.id);
      
      // Calculate inventory breakdown
      const storeOwned = allItems.filter(item => !item.is_consignment && item.status === 'FOR_SALE').length;
      const consignment = allItems.filter(item => item.is_consignment && item.status === 'FOR_SALE').length;
      const pendingDropoff = allItems.filter(item => item.status === 'PENDING_DROPOFF').length;
      
      setInventoryBreakdown({ storeOwned, consignment, pendingDropoff });

      // Calculate category distribution
      const categoryMap = new Map<string, number>();
      allItems.forEach(item => {
        if (item.status === 'FOR_SALE') {
          categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
        }
      });
      
      const categories = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setCategoryData(categories);

    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </StoreLayout>
    );
  }

  const averageSalePrice = stats.itemsSoldThisMonth > 0 
    ? stats.monthlyRevenue / stats.itemsSoldThisMonth 
    : 0;

  return (
    <StoreLayout>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={meta.robots} />
        <link rel="canonical" href={meta.canonicalUrl} />
      </Helmet>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sales Analytics</h1>
            <p className="text-muted-foreground">Track your store's performance</p>
          </div>
          <Select defaultValue="30days">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">This Month</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Monthly Revenue"
            value={`€${stats.monthlyRevenue.toFixed(2)}`}
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatCard
            label="Items Sold This Month"
            value={stats.itemsSoldThisMonth.toString()}
            icon={<Package className="h-6 w-6" />}
          />
          <StatCard
            label="Average Sale Price"
            value={`€${averageSalePrice.toFixed(2)}`}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <StatCard
            label="Active Inventory"
            value={stats.activeInventory.toString()}
            icon={<ShoppingBag className="h-6 w-6" />}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Categories</h3>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.category}</span>
                      <span className="font-medium text-foreground">{item.count} items</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(item.count / Math.max(...categoryData.map(c => c.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">For Sale</span>
                  <span className="font-medium text-foreground">{stats.activeInventory} items</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Pending Drop-off</span>
                  <span className="font-medium text-foreground">{inventoryBreakdown.pendingDropoff} items</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: stats.activeInventory > 0 
                        ? `${(inventoryBreakdown.pendingDropoff / (stats.activeInventory + inventoryBreakdown.pendingDropoff)) * 100}%`
                        : '0%'
                    }} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Sold This Month</span>
                  <span className="font-medium text-foreground">{stats.itemsSoldThisMonth} items</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: stats.activeInventory > 0 
                        ? `${(stats.itemsSoldThisMonth / (stats.activeInventory + stats.itemsSoldThisMonth)) * 100}%`
                        : '0%'
                    }} 
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Inventory Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Inventory Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Store-Owned Items</p>
              <p className="text-2xl font-bold text-foreground">{inventoryBreakdown.storeOwned}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready for sale</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Consignment Items</p>
              <p className="text-2xl font-bold text-foreground">{inventoryBreakdown.consignment}</p>
              <p className="text-xs text-muted-foreground mt-1">From sellers</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Pending Approval</p>
              <p className="text-2xl font-bold text-foreground">{inventoryBreakdown.pendingDropoff}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </div>
          </div>
        </Card>
      </div>
    </StoreLayout>
  );
};

export default StoreAnalytics;
