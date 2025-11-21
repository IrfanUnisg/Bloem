import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { itemService } from "@/services/item.service";
import { storeService } from "@/services/store.service";
import { ItemCategory, ItemCondition } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, X, Loader2, Package, ArrowLeft } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

const AddStoreItem = () => {
  const meta = pageMetadata.addStoreItem();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

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

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load store ID on mount
  useState(() => {
    const loadStore = async () => {
      if (!user) return;
      
      try {
        const store = await storeService.getStoreByOwnerId(user.id);
        if (!store) {
          toast({
            title: "No store found",
            description: "You don't have a store associated with your account.",
            variant: "destructive",
          });
          navigate("/store/inventory");
          return;
        }
        setStoreId(store.id);
      } catch (error) {
        console.error("Error loading store:", error);
        toast({
          title: "Error",
          description: "Failed to load store information.",
          variant: "destructive",
        });
        navigate("/store/inventory");
      }
    };

    loadStore();
  });

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
    if (!user || !storeId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!title || !description || !category || !size || !condition || !price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create item - the service will automatically detect that this is a store-owned item
      // because the sellerId (user.id) matches the store's ownerId
      await itemService.createItem(user.id, {
        title,
        description,
        category: category as ItemCategory,
        brand: brand || undefined,
        size,
        color: color || undefined,
        condition: condition as ItemCondition,
        price: parseFloat(price),
        images,
        storeId, // Using the store's own ID
      });

      toast({
        title: "Item added successfully!",
        description: "Your store item is now listed for sale.",
      });

      // Navigate back to inventory
      navigate("/store/inventory");
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast({
        title: "Failed to add item",
        description: error.message || "Failed to add item. Please try again.",
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
        return price;
      default:
        return false;
    }
  };

  if (!storeId) {
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
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={meta.robots} />
        <link rel="canonical" href={meta.canonicalUrl} />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/store/inventory")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Add Store Item</h1>
              <p className="text-muted-foreground">Add inventory directly to your store</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((num) => (
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
              {num < 3 && (
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
          {/* Step 1: Photos */}
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

          {/* Step 2: Details */}
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

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Set Your Price</h2>

              <div>
                <Label htmlFor="price">Your Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="25.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1.5">
                  This is a store-owned item, so you keep all proceeds (no commission fees)
                </p>
              </div>

              {/* Summary */}
              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold text-foreground mb-3">Item Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium">{condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{size}</span>
                  </div>
                  {brand && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-medium">{brand}</span>
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Selling Price:</span>
                    <span className="font-bold text-primary">€{price || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-primary">Store-Owned</span>
                  </div>
                </div>
              </Card>

              
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
            {step < 3 ? (
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
                    Adding Item...
                  </>
                ) : (
                  "Add to Inventory"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </StoreLayout>
  );
};

export default AddStoreItem;
