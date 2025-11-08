import { StoreLayout } from "@/components/layout/StoreLayout";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, Check, X } from "lucide-react";

const StoreDropoffs = () => {
  const mockDropoffs = [
    {
      id: "1",
      sellerName: "Sarah Johnson",
      sellerEmail: "sarah@example.com",
      itemTitle: "Vintage Denim Jacket",
      category: "Outerwear",
      price: 45,
      condition: "Excellent",
      date: "2025-01-06",
    },
    {
      id: "2",
      sellerName: "Mike Chen",
      sellerEmail: "mike@example.com",
      itemTitle: "Summer Dress",
      category: "Dresses",
      price: 32,
      condition: "Good",
      date: "2025-01-06",
    },
  ];

  const isEmpty = mockDropoffs.length === 0;

  return (
    <StoreLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Drop-off Queue</h1>
          <p className="text-muted-foreground">
            {isEmpty ? "No pending drop-offs" : `${mockDropoffs.length} items awaiting processing`}
          </p>
        </div>

        {isEmpty ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title="No pending drop-offs"
            description="When sellers request to drop off items at your store, they'll appear here for processing"
            actionLabel="Refresh"
            actionHref="/store/dropoffs"
          />
        ) : (
          <div className="space-y-4">
            {mockDropoffs.map((dropoff) => (
              <Card key={dropoff.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {dropoff.itemTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {dropoff.sellerName} • {dropoff.date}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending Review</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Item Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{dropoff.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">€{dropoff.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Condition:</span>
                        <span className="font-medium">{dropoff.condition}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Seller Contact</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{dropoff.sellerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{dropoff.sellerEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Accept & Generate QR
                  </Button>
                  <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreDropoffs;
