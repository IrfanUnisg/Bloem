import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Scan, ShoppingBag, CreditCard, CheckCircle, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { storeService } from "@/services/store.service";
import { itemService } from "@/services/item.service";
import { ItemWithRelations } from "@/types";

const StoreCheckout = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState("");
  const [scannedItems, setScannedItems] = useState<ItemWithRelations[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    loadStore();
  }, [user]);

  const loadStore = async () => {
    if (!user) return;
    const store = await storeService.getStoreByOwnerId(user.id);
    if (store) {
      setStoreId(store.id);
    }
  };

  const handleScanQR = async () => {
    if (!storeId) {
      toast({
        title: "Store not found",
        description: "You don't have a store associated with your account.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try to find item by QR code in the database
      // For now, we'll search by ID since QR code lookup needs a custom query
      const allItems = await itemService.getItemsByStore(storeId, "FOR_SALE");
      const foundItem = allItems.find(item => 
        item.id === qrCode || item.qrCode === qrCode
      );
      
      if (foundItem) {
        // Check if item already in cart
        if (scannedItems.find(item => item.id === foundItem.id)) {
          toast({
            title: "Item already scanned",
            description: "This item is already in the current transaction.",
            variant: "destructive",
          });
          return;
        }

        setScannedItems(prev => [...prev, foundItem]);
        setQrCode("");
        toast({
          title: "Item scanned",
          description: `${foundItem.title} added to transaction.`,
        });
      } else {
        toast({
          title: "Item not found",
          description: "Invalid QR code or item not available for sale at this store.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scanning item:', error);
      toast({
        title: "Error",
        description: "Failed to scan item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "Item removed from transaction.",
    });
  };

  const handleProcessPayment = async () => {
    if (scannedItems.length === 0) {
      toast({
        title: "No items",
        description: "Please scan items before processing payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // In real implementation, this would:
      // 1. Create an order
      // 2. Update item statuses to SOLD
      // 3. Process payment
      // 4. Generate transaction records
      
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update item statuses to SOLD
      for (const item of scannedItems) {
        await itemService.updateItemStatus(item.id, "SOLD");
      }
      
      toast({
        title: "Payment successful",
        description: `Transaction completed. Total: €${totalAmount.toFixed(2)}`,
      });
      
      // Clear transaction
      setScannedItems([]);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = scannedItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.21; // 21% VAT
  const totalAmount = subtotal + tax;

  return (
    <StoreLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Scan item QR codes to process customer purchases</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Scanner Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Item QR Code
                </CardTitle>
                <CardDescription>Enter or scan the QR code from the item tag</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter QR code or item ID..."
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleScanQR()}
                    className="flex-1"
                  />
                  <Button onClick={handleScanQR} disabled={!qrCode}>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Scan QR codes from item tags. Items must be from your store and listed for sale.
                </p>
              </CardContent>
            </Card>

            {/* Scanned Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Items ({scannedItems.length})
                </CardTitle>
                <CardDescription>Items in current transaction</CardDescription>
              </CardHeader>
              <CardContent>
                {scannedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No items scanned yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Scan QR codes to add items</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scannedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            <Badge variant="outline" className="text-xs">Size {item.size}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">€{item.price}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive mt-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax (21% VAT)</span>
                    <span className="font-medium text-foreground">€{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">€{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleProcessPayment}
                  disabled={scannedItems.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Process Payment
                    </>
                  )}
                </Button>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground text-sm mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-accent" />
                    Payment Methods
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Accepts: Cash, Card (PIN), Contactless, Mobile Pay
                  </p>
                </div>

                {scannedItems.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScannedItems([])}
                  >
                    Clear Transaction
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCheckout;
