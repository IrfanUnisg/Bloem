import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const StoreMarketing = () => {
  const { toast } = useToast();
  const [emailCampaign, setEmailCampaign] = useState({
    subject: "",
    message: "",
  });

  const handleSendCampaign = () => {
    toast({
      title: "campaign sent",
      description: "your marketing campaign has been sent to all customers.",
    });
    setEmailCampaign({ subject: "", message: "" });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">marketing tools</h1>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">campaigns</TabsTrigger>
            <TabsTrigger value="analytics">analytics</TabsTrigger>
            <TabsTrigger value="customers">customers</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                create email campaign
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">subject line</Label>
                  <Input
                    id="subject"
                    placeholder="new arrivals this week!"
                    value={emailCampaign.subject}
                    onChange={(e) => setEmailCampaign({ ...emailCampaign, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">message</Label>
                  <Textarea
                    id="message"
                    placeholder="tell your customers about new items, special offers, or events..."
                    rows={6}
                    value={emailCampaign.message}
                    onChange={(e) => setEmailCampaign({ ...emailCampaign, message: e.target.value })}
                  />
                </div>

                <Button onClick={handleSendCampaign} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  send campaign
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  social media posts
                </h3>
                <p className="text-muted-foreground mb-4">
                  automatically generate social media content to promote your latest inventory.
                </p>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  create post
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  loyalty program
                </h3>
                <p className="text-muted-foreground mb-4">
                  reward your frequent customers with exclusive offers and discounts.
                </p>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  manage rewards
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">campaign reach</h3>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">1,234</p>
                <p className="text-sm text-muted-foreground mt-1">emails sent this month</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">open rate</h3>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">34.5%</p>
                <p className="text-sm text-muted-foreground mt-1">+5.2% from last month</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">conversion rate</h3>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">12.8%</p>
                <p className="text-sm text-muted-foreground mt-1">customers who made a purchase</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                recent campaigns
              </h3>
              <div className="space-y-4">
                {[
                  { name: "summer sale", sent: "152", opened: "58", clicked: "23" },
                  { name: "new arrivals", sent: "152", opened: "62", clicked: "28" },
                  { name: "weekend special", sent: "152", opened: "45", clicked: "15" },
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">sent to {campaign.sent} customers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {campaign.opened} opened • {campaign.clicked} clicked
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                customer list
              </h3>
              <p className="text-muted-foreground mb-6">
                manage your customer database and segment audiences for targeted campaigns.
              </p>
              
              <div className="space-y-4">
                {[
                  { name: "anna müller", email: "anna@example.ch", purchases: 8 },
                  { name: "hans meier", email: "hans@example.ch", purchases: 5 },
                  { name: "lisa schmidt", email: "lisa@example.ch", purchases: 12 },
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{customer.purchases} purchases</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-6">
                view all customers
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StoreLayout>
  );
};

export default StoreMarketing;
