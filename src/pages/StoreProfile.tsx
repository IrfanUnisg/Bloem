import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const StoreProfile = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "vintage vibes",
    email: "hello@vintagevibes.nl",
    phone: "+31 20 123 4567",
    address: "prinsengracht 123, 1015 ea amsterdam",
    hours: "mon-sat: 10am-7pm, sun: 12pm-6pm",
    description: "curated vintage clothing and accessories from the 70s-90s. specializing in denim, leather jackets, and unique statement pieces.",
    ownerName: "jan de vries",
  });

  const handleSave = () => {
    toast({
      title: "store profile updated",
      description: "your changes have been saved successfully.",
    });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">store profile</h1>

        <div className="space-y-6">
          {/* Store Header */}
          <Card className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl">
                  <Store className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {formData.name}
                </h2>
                <p className="text-muted-foreground">partner since august 2024</p>
                <Button variant="outline" size="sm" className="mt-2">
                  change photo
                </Button>
              </div>
            </div>
          </Card>

          {/* Store Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              store information
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">store name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">owner name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">business hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hours"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave}>save changes</Button>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              store stats
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">342</div>
                <p className="text-sm text-muted-foreground">items sold this month</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">€8,240</div>
                <p className="text-sm text-muted-foreground">monthly revenue</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">156</div>
                <p className="text-sm text-muted-foreground">active inventory</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreProfile;
