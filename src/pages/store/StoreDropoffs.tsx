import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { storeService } from "@/services/store.service";
import { itemService } from "@/services/item.service";
import { useToast } from "@/hooks/use-toast";
import { ItemWithRelations } from "@/types";

const StoreDropoffs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dropoffs, setDropoffs] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDropoffs();
  }, [user]);

  const loadDropoffs = async () => {
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

      // Get items with PENDING_DROPOFF status for this store
      const pendingItems = await itemService.getItemsByStore(store.id, "PENDING_DROPOFF");
      setDropoffs(pendingItems);
    } catch (error) {
      console.error("Error loading dropoffs:", error);
      toast({
        title: "Error loading dropoffs",
        description: "Failed to load pending dropoffs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (itemId: string) => {
    setProcessingId(itemId);
    try {
      // Update item status to FOR_SALE and set listedAt timestamp
      await itemService.updateItemStatus(itemId, "FOR_SALE");
      
      toast({
        title: "Item accepted!",
        description: "The item is now listed for sale in your store.",
      });

      // Reload dropoffs
      await loadDropoffs();
    } catch (error) {
      console.error("Error accepting item:", error);
      toast({
        title: "Error accepting item",
        description: "Failed to accept the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (itemId: string) => {
    setProcessingId(itemId);
    try {
      // Update item status to REMOVED
      await itemService.updateItemStatus(itemId, "REMOVED");
      
      toast({
        title: "Item rejected",
        description: "The seller will be notified of the rejection.",
      });

      // Reload dropoffs
      await loadDropoffs();
    } catch (error) {
      console.error("Error rejecting item:", error);
      toast({
        title: "Error rejecting item",
        description: "Failed to reject the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const isEmpty = dropoffs.length === 0;

  if (loading) {
    return (
      <StoreLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Drop-off Queue</h1>
          <p className="text-muted-foreground">
            {isEmpty ? "No pending drop-offs" : `${dropoffs.length} items awaiting processing`}
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
            {dropoffs.map((dropoff) => (
              <Card key={dropoff.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {dropoff.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {dropoff.seller?.name || 'Unknown'} • {new Date(dropoff.createdAt).toLocaleDateString()}
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
                        <span className="font-medium">€{dropoff.price.toFixed(2)}</span>
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
                        <span className="font-medium">{dropoff.seller?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{dropoff.seller?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {dropoff.images && dropoff.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Photos</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {dropoff.images.slice(0, 4).map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`${dropoff.title} ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => handleAccept(dropoff.id)}
                    disabled={processingId === dropoff.id}
                  >
                    {processingId === dropoff.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Accept & List for Sale
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleReject(dropoff.id)}
                    disabled={processingId === dropoff.id}
                  >
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
