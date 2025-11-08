import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ItemCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full mt-3" />
      </div>
    </Card>
  );
}
