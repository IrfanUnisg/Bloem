import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StoreCard } from "@/components/cards/StoreCard";
import { Upload, ShoppingBag, DollarSign, TrendingUp, MapPin, Heart } from "lucide-react";
const Index = () => {
  const features = [{
    icon: <DollarSign className="h-6 w-6" />,
    title: "For Sellers",
    description: "Instant payouts, zero listing fees, and complete transparency. Track every item from upload to sale."
  }, {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "For Buyers",
    description: "Browse local thrift inventory online. Try before you buy with in-store pickup and fitting."
  }, {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "For Stores",
    description: "Digital inventory management, automated sales tracking, and powerful marketing tools."
  }];
  const mockStores = [{
    name: "Vintage Vibes",
    address: "123 Main St, Amsterdam",
    distance: "0.5 km",
    hours: "Mon-Sat: 10AM-7PM"
  }, {
    name: "Retro Revival",
    address: "456 Canal Street, Amsterdam",
    distance: "1.2 km",
    hours: "Tue-Sun: 11AM-8PM"
  }, {
    name: "Thrift Haven",
    address: "789 Market Lane, Amsterdam",
    distance: "2.0 km",
    hours: "Daily: 9AM-6PM"
  }];
  return <div className="min-h-screen flex flex-col">
      <Header variant="public" />
      
      {/* Hero Section */}
      <section className="relative bg-primary py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-accent fill-current" />
              <span className="text-sm text-white font-medium">Sustainable Fashion Starts Local</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Future of Second-Hand Shopping
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Connect with local thrift shops, sell your clothes instantly, and shop sustainably—all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up?role=seller">
                <Button size="lg" variant="secondary" className="text-base">
                  <Upload className="mr-2 h-5 w-5" />
                  sign up as user
                </Button>
              </Link>
              <Link to="/sign-up?role=store">
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  sign up as store
                </Button>
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-6">
              <span className="font-semibold">12,450</span> items sold locally this month
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're selling, buying, or managing a store, Bloem makes sustainable fashion effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From closet to cash in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[{
            step: "1",
            title: "Upload",
            description: "Take photos and list your items"
          }, {
            step: "2",
            title: "Drop Off",
            description: "Bring items to your chosen thrift store"
          }, {
            step: "3",
            title: "Sell",
            description: "Store displays and sells your items"
          }, {
            step: "4",
            title: "Get Paid",
            description: "Receive instant payout when sold"
          }].map((item, index) => <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Local Stores
            </h2>
            <p className="text-lg text-muted-foreground">
              Partner thrift shops in your area
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {mockStores.map((store, index) => <StoreCard key={index} {...store} />)}
          </div>

          <div className="text-center mt-8">
            <Link to="/browse-stores">
              <Button variant="outline" size="lg">
                <MapPin className="mr-2 h-5 w-5" />
                view all stores
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Sustainable Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers, buyers, and thrift stores making fashion more sustainable.
          </p>
          <Link to="/sign-up">
            <Button size="lg" variant="secondary" className="text-base">get started free</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;