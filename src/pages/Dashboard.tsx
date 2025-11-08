import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ItemCard } from "@/components/cards/ItemCard";
import { StatCard } from "@/components/cards/StatCard";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, DollarSign, TrendingUp, Upload } from "lucide-react";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const mockListings = Array(6).fill(null).map((_, i) => ({
    id: String(i + 1),
    title: `My Item ${i + 1}`,
    price: Math.floor(Math.random() * 50) + 10,
    status: ["for sale", "sold", "pending"][i % 3],
    storeName: "Vintage Vibes"
  }));
  const mockTransactions = [{
    date: "2025-01-05",
    item: "Vintage Denim Jacket",
    amount: 45,
    status: "Completed"
  }, {
    date: "2025-01-03",
    item: "Summer Dress",
    amount: 32,
    status: "Completed"
  }, {
    date: "2024-12-28",
    item: "Leather Boots",
    amount: 58,
    status: "Completed"
  }];
  return <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and track your sales</p>
          </div>
          <Link to="/upload">
            <Button>upload item<Upload className="mr-2 h-4 w-4" />
            
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            {/* Filter Tabs */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="for-sale">For Sale</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Items Grid */}
            {mockListings.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockListings.map(item => <ItemCard key={item.id} variant="dashboard" {...item} />)}
              </div> : <EmptyState icon={<Package className="h-8 w-8" />} title="No items yet" description="Start selling by uploading your first item" actionLabel="Upload Item" actionHref="/upload" />}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Earnings" value="€135" trend="up" trendValue="+12% from last month" icon={<DollarSign className="h-6 w-6" />} />
              <StatCard label="Pending Payouts" value="€0" icon={<Package className="h-6 w-6" />} />
              <StatCard label="Items Sold" value="3" trend="up" trendValue="+2 this month" icon={<TrendingUp className="h-6 w-6" />} />
            </div>

            {/* Transaction History */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Transaction History</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((transaction, index) => <TableRow key={index}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.item}</TableCell>
                        <TableCell className="font-medium">€{transaction.amount}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default Dashboard;