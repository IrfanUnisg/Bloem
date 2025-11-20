import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { MobileCartButton } from "@/components/MobileCartButton";
import { ItemCard } from "@/components/cards/ItemCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { itemService } from "@/services/item.service";
import { ItemWithRelations } from "@/types";
import { Filter, ShoppingBag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pageMetadata } from "@/lib/seo";

const Browse = () => {
  const meta = pageMetadata.browse();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const totalItems = user ? cart.totalItems : 0;
  const { toast } = useToast();

  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["Tops", "Bottoms", "Dresses", "Outerwear", "Accessories", "Shoes"];
  const sizes = ["XS", "S", "M", "L", "XL"];
  const conditions = ["Like New", "Excellent", "Good", "Fair"];

  useEffect(() => {
    fetchItems();
  }, [selectedCategories, selectedSizes, selectedConditions, priceRange]);

  // Refresh items when user navigates back to Browse page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also fetch when component mounts
    fetchItems();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        status: 'FOR_SALE',
        limit: 50,
        offset: 0
      };

      if (selectedCategories.length > 0) {
        // Fetch for each category and combine
        const categoryPromises = selectedCategories.map(cat => 
          itemService.browseItems({ ...filters, category: cat })
        );
        const categoryResults = await Promise.all(categoryPromises);
        let allItems = categoryResults.flat();
        
        // Filter out user's own items and ensure only FOR_SALE items
        allItems = allItems.filter(item => 
          item.status === 'FOR_SALE' && (!user || (item as any).seller_id !== user.id)
        );
        
        setItems(allItems);
      } else {
        if (priceRange[0] > 0) filters.minPrice = priceRange[0];
        if (priceRange[1] < 100) filters.maxPrice = priceRange[1];

        const fetchedItems = await itemService.browseItems(filters);
        
        // Apply client-side filters for size and condition
        let filtered = fetchedItems;
        
        // Extra safety filter: ensure no RESERVED, SOLD, or REMOVED items
        filtered = filtered.filter(item => 
          item.status === 'FOR_SALE'
        );
        
        // Filter out user's own items
        if (user) {
          filtered = filtered.filter(item => (item as any).seller_id !== user.id);
        }
        
        if (selectedSizes.length > 0) {
          filtered = filtered.filter(item => selectedSizes.includes(item.size));
        }
        
        if (selectedConditions.length > 0) {
          filtered = filtered.filter(item => selectedConditions.includes(item.condition));
        }

        setItems(filtered);
      }
    } catch (error: any) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error loading items",
        description: error.message || "Failed to load items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedConditions([]);
    setPriceRange([0, 100]);
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={meta.robots} />
        <link rel="canonical" href={meta.canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={meta.ogTitle} />
        <meta property="og:description" content={meta.ogDescription} />
        <meta property="og:image" content={meta.ogImage} />
        <meta property="og:url" content={meta.ogUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={meta.twitterCard} />
        <meta name="twitter:title" content={meta.ogTitle} />
        <meta name="twitter:description" content={meta.ogDescription} />
        <meta name="twitter:image" content={meta.twitterImage} />
      </Helmet>
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 md:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">browse inventory</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {isLoading ? "Loading..." : `${sortedItems.length} unique finds from local thrift stores`}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <Link to="/cart" className="relative flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center font-medium text-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto sm:w-48 h-10 md:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">newest first</SelectItem>
                <SelectItem value="price-low">price: low to high</SelectItem>
                <SelectItem value="price-high">price: high to low</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Mobile Filter Drawer */}
            <MobileFilterDrawer
              categories={categories}
              sizes={sizes}
              conditions={conditions}
              selectedCategories={selectedCategories}
              selectedSizes={selectedSizes}
              selectedConditions={selectedConditions}
              priceRange={priceRange as [number, number]}
              onCategoryChange={toggleCategory}
              onSizeChange={toggleSize}
              onConditionChange={toggleCondition}
              onPriceChange={setPriceRange}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  </h3>
                </div>

                {/* Category */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={category} className="text-sm cursor-pointer">
                          {category.toLowerCase()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">size</h4>
                  <div className="space-y-2">
                    {sizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={size}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => toggleSize(size)}
                        />
                        <Label htmlFor={size} className="text-sm cursor-pointer">
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">condition</h4>
                  <div className="space-y-2">
                    {conditions.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => toggleCondition(condition)}
                        />
                        <Label htmlFor={condition} className="text-sm cursor-pointer">
                          {condition.toLowerCase()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">price range</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>€{priceRange[0]}</span>
                    <span>€{priceRange[1]}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  clear filters
                </Button>
              </div>
            </aside>

            {/* Items Grid */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {sortedItems.length > 0 ? (
                      sortedItems.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => navigate(`/browse/${item.id}`)} 
                          className="cursor-pointer"
                        >
                          <ItemCard variant="browse" item={item} />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No items found matching your filters.</p>
                      </div>
                    )}
                  </div>

                  {/* Load More */}
                  {sortedItems.length >= 50 && (
                    <div className="text-center mt-12">
                      <Button variant="outline" size="lg">
                        Load More Items
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile floating cart button */}
        <MobileCartButton />
    </DashboardLayout>
  );
};

export default Browse;
