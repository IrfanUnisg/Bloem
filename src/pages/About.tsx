import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Heart, Users, Leaf, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "sustainability first",
      description: "we believe in reducing waste and promoting circular fashion through local communities.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "community driven",
      description: "connecting sellers, buyers, and thrift stores to create a thriving local ecosystem.",
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "eco-conscious",
      description: "every item sold through bloem is a step towards a more sustainable future.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "transparent & fair",
      description: "instant payouts, no hidden fees, and complete visibility for all parties.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="public" />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                about bloem
              </h1>
              <p className="text-xl text-white/90">
                we're on a mission to make sustainable fashion accessible, transparent, and profitable for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                our story
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  bloem was born from a simple observation: thrift stores are overflowing with potential, but they lack the digital tools to thrive in today's market.
                </p>
                <p>
                  we saw sellers struggling with uncertainty about payouts, buyers unable to browse local inventory online, and stores managing everything manually with paper tags and handwritten logs.
                </p>
                <p>
                  so we built bloem—a platform that digitizes the entire second-hand shopping experience while keeping the heart of local community intact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                our values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                these principles guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                our impact
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">12,450+</div>
                  <p className="text-muted-foreground">items sold locally</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">45+</div>
                  <p className="text-muted-foreground">partner stores</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">€180k+</div>
                  <p className="text-muted-foreground">paid to sellers</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
