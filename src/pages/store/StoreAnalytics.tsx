import { StoreLayout } from "@/components/layout/StoreLayout";
import { StatCard } from "@/components/cards/StatCard";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";

const StoreAnalytics = () => {
  return (
    <StoreLayout>
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
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Sales"
            value="€2,845"
            trend="up"
            trendValue="+18% from last month"
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatCard
            label="Items Sold"
            value="47"
            trend="up"
            trendValue="+12 items"
            icon={<Package className="h-6 w-6" />}
          />
          <StatCard
            label="Average Sale Price"
            value="€60.53"
            trend="up"
            trendValue="+€5.20"
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <StatCard
            label="Active Consignments"
            value="23"
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sales Over Time</h3>
            <div className="h-64 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Line Chart Placeholder
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Categories</h3>
            <div className="h-64 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Bar Chart Placeholder
            </div>
          </Card>
        </div>

        {/* Inventory Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Inventory Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Store-Owned Items</p>
              <p className="text-2xl font-bold text-foreground">156</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Consignment Items</p>
              <p className="text-2xl font-bold text-foreground">89</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Turnover Rate</p>
              <p className="text-2xl font-bold text-foreground">72%</p>
            </div>
          </div>
        </Card>
      </div>
    </StoreLayout>
  );
};

export default StoreAnalytics;
