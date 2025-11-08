import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      category: "for sellers",
      questions: [
        {
          q: "how do i get paid?",
          a: "you receive instant payouts as soon as your item sells. payments are processed automatically through our secure payment system within minutes of the sale.",
        },
        {
          q: "what fees do i pay?",
          a: "bloem charges a small service fee on each sale (typically 15-20%) plus a nominal hanger rental fee when you drop off items. there are no listing fees.",
        },
        {
          q: "what if my item doesn't sell?",
          a: "items typically stay in stores for 60 days. if unsold, you can pick them up, donate them, or have the store dispose of them responsibly.",
        },
        {
          q: "how do i know which store to choose?",
          a: "you can browse partner stores on our platform and see their locations, specialties, and customer ratings to find the best fit for your items.",
        },
      ],
    },
    {
      category: "for buyers",
      questions: [
        {
          q: "can i try items before buying?",
          a: "absolutely! reserve items online and try them on in-store before completing your purchase. this is one of our key features.",
        },
        {
          q: "how do i find items near me?",
          a: "use our browse feature with location filters to see all available items at thrift stores in your area.",
        },
        {
          q: "what's your return policy?",
          a: "since all items are second-hand and you can try them on in-store, we generally don't accept returns. however, if there's a significant issue not disclosed in the listing, contact support.",
        },
        {
          q: "are items authenticated?",
          a: "while stores inspect items for quality, authentication of designer goods varies by store. check individual store policies or contact them directly for specific items.",
        },
      ],
    },
    {
      category: "for stores",
      questions: [
        {
          q: "how much does bloem cost for stores?",
          a: "we offer flexible subscription plans based on your store size and volume. contact our sales team for a custom quote.",
        },
        {
          q: "do i need special equipment?",
          a: "you'll need a device with internet access and a QR code scanner (most smartphones work great). we provide QR code printers as part of your subscription.",
        },
        {
          q: "how does inventory management work?",
          a: "all inventory is tracked digitally in real-time. when items arrive, scan them in. when they sell, scan them out. it's that simple.",
        },
        {
          q: "can i still sell my own store inventory through bloem?",
          a: "yes! bloem supports both consignment items and store-owned inventory, all managed through the same system.",
        },
      ],
    },
    {
      category: "general",
      questions: [
        {
          q: "which cities is bloem available in?",
          a: "we're currently live in amsterdam with plans to expand to rotterdam, utrecht, and den haag in 2025. sign up to get notified when we launch in your city.",
        },
        {
          q: "is bloem only for clothing?",
          a: "primarily yes, but many stores also accept accessories like bags, shoes, and jewelry. check with individual stores for their specific categories.",
        },
        {
          q: "how do you ensure quality?",
          a: "partner stores inspect all items before accepting them. sellers provide detailed descriptions and photos. buyers can inspect items in person before purchasing.",
        },
        {
          q: "how is bloem different from other platforms?",
          a: "unlike pure online marketplaces, we connect the digital and physical worlds. you get the convenience of online browsing with the security of in-person try-ons, all while supporting local businesses.",
        },
      ],
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
                frequently asked questions
              </h1>
              <p className="text-xl text-white/90">
                find answers to common questions about bloem
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
              {faqs.map((category, idx) => (
                <div key={idx}>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, qIdx) => (
                      <AccordionItem
                        key={qIdx}
                        value={`${idx}-${qIdx}`}
                        className="border rounded-lg px-6"
                      >
                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
