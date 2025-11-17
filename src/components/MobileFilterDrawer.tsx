import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface MobileFilterDrawerProps {
  categories: string[];
  sizes: string[];
  conditions: string[];
  selectedCategories: string[];
  selectedSizes: string[];
  selectedConditions: string[];
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onSizeChange: (size: string) => void;
  onConditionChange: (condition: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

/**
 * MobileFilterDrawer
 * Provides a slide-out filter panel optimized for touch on mobile (375px+)
 * Keeps filters accessible without cluttering the main browse view
 */
export function MobileFilterDrawer({
  categories,
  sizes,
  conditions,
  selectedCategories,
  selectedSizes,
  selectedConditions,
  priceRange,
  onCategoryChange,
  onSizeChange,
  onConditionChange,
  onPriceChange,
  onClearFilters,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount = 
    selectedCategories.length +
    selectedSizes.length +
    selectedConditions.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative h-11 w-11 md:hidden"
          aria-label={`Filters ${activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}`}
        >
          <Filter className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center font-bold text-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="sticky top-0 flex items-center justify-between bg-background border-b p-4 z-10">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <button 
            onClick={() => setOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)] px-4 py-6 space-y-6">
          {/* Category */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2 h-10">
                  <Checkbox
                    id={`mobile-cat-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => onCategoryChange(category)}
                  />
                  <Label 
                    htmlFor={`mobile-cat-${category}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {category.toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">size</h3>
            <div className="space-y-2">
              {sizes.map((size) => (
                <div key={size} className="flex items-center space-x-2 h-10">
                  <Checkbox
                    id={`mobile-size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => onSizeChange(size)}
                  />
                  <Label 
                    htmlFor={`mobile-size-${size}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">condition</h3>
            <div className="space-y-2">
              {conditions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2 h-10">
                  <Checkbox
                    id={`mobile-cond-${condition}`}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={() => onConditionChange(condition)}
                  />
                  <Label 
                    htmlFor={`mobile-cond-${condition}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {condition.toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">price range</h3>
            <div className="mb-4">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceChange(value as [number, number])}
                max={100}
                step={5}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <span>€{priceRange[0]}</span>
                <span>€{priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer with action buttons */}
        <div className="sticky bottom-0 border-t bg-background p-4 space-y-2">
          {activeFilterCount > 0 && (
            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={onClearFilters}
            >
              clear filters
            </Button>
          )}
          <Button 
            className="w-full h-11"
            onClick={() => setOpen(false)}
          >
            apply filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
