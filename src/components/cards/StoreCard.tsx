import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
interface StoreCardProps {
  name: string;
  address: string;
  distance?: string;
  hours?: string;
  image?: string;
}
export function StoreCard({
  name,
  address,
  distance,
  hours,
  image
}: StoreCardProps) {
  return <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[3/2] bg-muted overflow-hidden">
        {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Store Image
          </div>}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2">{name}</h3>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{address}</span>
          </div>
          {hours && <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{hours}</span>
            </div>}
          {distance && <p className="font-medium text-foreground">{distance} away</p>}
        </div>

        <Button variant="outline" className="w-full">view inventory</Button>
      </div>
    </Card>;
}