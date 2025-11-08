import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, X } from "lucide-react";

const Upload = () => {
  const [step, setStep] = useState(1);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Item</h1>
          <p className="text-muted-foreground">List your item for consignment sale</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {num}
              </div>
              {num < 4 && (
                <div
                  className={`h-1 w-16 md:w-24 ${
                    step > num ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Upload Photos</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add up to 4 photos of your item
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="text-center">
                      <UploadIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Upload Photo {num}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Item Details</h2>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tops">Tops</SelectItem>
                    <SelectItem value="bottoms">Bottoms</SelectItem>
                    <SelectItem value="dresses">Dresses</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="e.g., Levi's" className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">XS</SelectItem>
                    <SelectItem value="s">S</SelectItem>
                    <SelectItem value="m">M</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Like New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Pricing & Store</h2>

              <div>
                <Label htmlFor="price">Your Price (€)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="25.00"
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1.5">
                  You'll receive this amount when the item sells
                </p>
              </div>

              <div>
                <Label htmlFor="store">Drop-off Store</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a thrift store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store1">Vintage Vibes - 0.5 km away</SelectItem>
                    <SelectItem value="store2">Retro Revival - 1.2 km away</SelectItem>
                    <SelectItem value="store3">Thrift Haven - 2.0 km away</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground mb-2">Hanger Rental Fee</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  One-time fee for displaying your item in the store
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hanger rental</span>
                  <span className="font-semibold text-foreground">€2.00</span>
                </div>
              </Card>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Review & Submit</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Item Price:</span>
                  <span className="font-semibold text-foreground">€25.00</span>
                  
                  <span className="text-muted-foreground">Hanger Fee:</span>
                  <span className="font-semibold text-foreground">€2.00</span>
                  
                  <span className="text-muted-foreground">Store:</span>
                  <span className="font-semibold text-foreground">Vintage Vibes</span>
                  
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground">Tops</span>
                </div>

                <Card className="bg-accent/10 border-accent/20 p-4">
                  <p className="text-sm text-foreground">
                    <strong>Next Steps:</strong> After submitting, bring your item to the selected store.
                    You'll receive a notification when it's accepted and displayed.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button>
                Submit Item
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
