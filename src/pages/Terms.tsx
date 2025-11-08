import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="public" />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">terms and conditions</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. acceptance of terms</h2>
              <p className="text-muted-foreground">
                by accessing and using bloem, you accept and agree to be bound by the terms and provision of this agreement. if you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. use of service</h2>
              <p className="text-muted-foreground">
                bloem provides a platform for buying and selling second-hand clothing through local thrift stores. you agree to use the service only for lawful purposes and in accordance with these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. user accounts</h2>
              <p className="text-muted-foreground">
                you are responsible for maintaining the confidentiality of your account and password. you agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. seller responsibilities</h2>
              <p className="text-muted-foreground">
                sellers must provide accurate descriptions and photos of items. items must be clean and in the condition described. bloem reserves the right to remove listings that violate our policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. payments and fees</h2>
              <p className="text-muted-foreground">
                bloem charges a commission on sales and hanger rental fees as outlined in our pricing policy. sellers receive instant payouts upon sale completion. all transactions are processed securely through our payment partners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. intellectual property</h2>
              <p className="text-muted-foreground">
                the bloem platform and its original content, features, and functionality are owned by bloem and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. limitation of liability</h2>
              <p className="text-muted-foreground">
                bloem shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. changes to terms</h2>
              <p className="text-muted-foreground">
                we reserve the right to modify these terms at any time. we will notify users of any changes by posting the new terms on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. contact information</h2>
              <p className="text-muted-foreground">
                if you have any questions about these terms, please contact us through our contact page or email us at legal@bloem.ch.
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8">
              last updated: january 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
