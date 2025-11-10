import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { itemService } from "@/services/item.service";
import { storeService, Store } from "@/services/store.service";
import { ItemCategory, ItemCondition } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, X, Loader2 } from "lucide-react";

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  // Form state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState<ItemCondition | "">("");
  const [price, setPrice] = useState("");
  const [storeId, setStoreId] = useState("");

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load available stores on mount
  useEffect(() => {
    const loadStores = async () => {
      setLoadingStores(true);
      const availableStores = await storeService.getActiveStores();
      setStores(availableStores);
      setLoadingStores(false);

      if (availableStores.length === 0) {
        toast({
          title: "No stores available",
          description: "There are currently no active stores. Please check back later.",
          variant: "destructive",
        });
      }
    };

    loadStores();
  }, [toast]);

  const handleImageUpload = (index: number, file: File) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages.filter(Boolean));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = reader.result as string;
      setImagePreviews(newPreviews.filter(Boolean));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload items",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!title || !description || !category || !size || !condition || !price || !storeId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const item = await itemService.createItem(user.id, {
        title,
        description,
        category: category as ItemCategory,
        brand: brand || undefined,
        size,
        color: color || undefined,
        condition: condition as ItemCondition,
        price: parseFloat(price),
        images,
        storeId,
      });

      toast({
        title: "Item uploaded successfully!",
        description: "Your item is now pending store approval.",
      });

      // Navigate to dashboard or item detail
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error uploading item:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return images.length > 0;
      case 2:
        return title && description && category && size && condition;
      case 3:
        return price && storeId;
      case 4:
        return true;
      default:
        return false;
    }
  };

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
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative">
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                    />
                    {imagePreviews[index] ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden group">
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center hover:border-primary transition-colors cursor-pointer group"
                      >
                        <div className="text-center">
                          <UploadIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {index === 0 ? "Upload Photo (Required)" : `Photo ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Item Details</h2>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Vintage Denim Jacket"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(val) => setCategory(val as ItemCategory)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tops">Tops</SelectItem>
                    <SelectItem value="Bottoms">Bottoms</SelectItem>
                    <SelectItem value="Dresses">Dresses</SelectItem>
                    <SelectItem value="Outerwear">Outerwear</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Shoes">Shoes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand (Optional)</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Levi's"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color (Optional)</Label>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., Blue"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={(val) => setCondition(val as ItemCondition)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item, including any flaws or special features..."
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
                <Label htmlFor="price">Your Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25.00"
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1.5">
                  You'll receive approximately {price ? (parseFloat(price) * 0.75).toFixed(2) : "0.00"}€ after store commission (20%) and platform fee (5%)
                </p>
              </div>

              <div>
                <Label htmlFor="store">Drop-off Store *</Label>
                <Select value={storeId} onValueChange={setStoreId} disabled={loadingStores}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={loadingStores ? "Loading stores..." : stores.length === 0 ? "No stores available" : "Select a thrift store"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} - {store.city} ({store.address})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Choose the store where you'll drop off your item
                </p>
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

              {/* Image Preview */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-semibold text-foreground">{title}</span>

                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground">{category}</span>

                  {brand && (
                    <>
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-semibold text-foreground">{brand}</span>
                    </>
                  )}

                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-semibold text-foreground">{size}</span>

                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-semibold text-foreground">{condition}</span>
                  
                  <span className="text-muted-foreground">Item Price:</span>
                  <span className="font-semibold text-foreground">€{parseFloat(price || "0").toFixed(2)}</span>
                  
                  <span className="text-muted-foreground">Hanger Fee:</span>
                  <span className="font-semibold text-foreground">€2.00</span>
                  
                  <span className="text-muted-foreground">Your Payout:</span>
                  <span className="font-semibold text-accent">€{(parseFloat(price || "0") * 0.75).toFixed(2)}</span>
                </div>

                {description && (
                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p className="text-sm text-foreground mt-1">{description}</p>
                  </div>
                )}

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
              disabled={step === 1 || isSubmitting}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit Item"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
