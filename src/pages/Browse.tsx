import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ItemCard } from "@/components/cards/ItemCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { mockItems } from "@/data/mockItems";
import { Filter, ShoppingBag } from "lucide-react";

const Browse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalItems } = user ? useCart() : { totalItems: 0 };
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [maxDistance, setMaxDistance] = useState(10);
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["jackets", "coats", "dresses", "tops", "pants", "sweaters", "shoes", "skirts"];
  const sizes = ["xs", "s", "m", "l", "xl"];
  const conditions = ["new with tags", "like new", "good", "fair"];

  // Filter items to show only items for sale
  const availableItems = mockItems.filter(item => item.status === "for_sale");
  
  const filteredItems = availableItems.filter(item => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(item.size);
    const priceMatch = item.price >= priceRange[0] && item.price <= priceRange[1];
    return categoryMatch && sizeMatch && priceMatch;
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
    setMaxDistance(10);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={user ? "authenticated" : "public"} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">browse inventory</h1>
              <p className="text-muted-foreground">discover unique finds from local thrift stores</p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/cart" className="relative">
                  <ShoppingBag className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">newest first</SelectItem>
                  <SelectItem value="price-low">price: low to high</SelectItem>
                  <SelectItem value="price-high">price: high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
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
                          {category}
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
                          {condition}
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

                {/* Distance */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">distance</h4>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(val) => setMaxDistance(val[0])}
                    max={20}
                    step={1}
                    className="mb-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    within {maxDistance} km
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  clear filters
                </Button>
              </div>
            </aside>

            {/* Items Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div key={item.id} onClick={() => navigate(`/browse/${item.id}`)} className="cursor-pointer">
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
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Browse;
