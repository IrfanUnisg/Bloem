import { StoreLayout } from "@/components/layout/StoreLayout";
import { ItemCard } from "@/components/cards/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, QrCode, Grid, List } from "lucide-react";

const StoreInventory = () => {
  const mockInventory = Array(8).fill(null).map((_, i) => ({
    id: String(i + 1),
    title: `Inventory Item ${i + 1}`,
    price: Math.floor(Math.random() * 50) + 10,
    type: (i % 2 === 0 ? "consignment" : "store-owned") as "consignment" | "store-owned",
    condition: "Good",
    status: "for sale",
  }));

  return (
    <StoreLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your store and consignment items</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Process Drop-off
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Store Item
            </Button>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory..." className="pl-10" />
          </div>
          <Tabs defaultValue="grid" className="ml-4">
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="consignment">Consignment</TabsTrigger>
            <TabsTrigger value="store">Store-Owned</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Grid View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockInventory.map((item) => (
            <ItemCard key={item.id} variant="store" {...item} />
          ))}
        </div>

        {/* Table View (hidden by default, toggled by view switch) */}
        <div className="border rounded-lg overflow-hidden hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "consignment" ? "default" : "secondary"}>
                      {item.type === "consignment" ? "Consignment" : "Store"}
                    </Badge>
                  </TableCell>
                  <TableCell>€{item.price}</TableCell>
                  <TableCell>{item.condition}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreInventory;
