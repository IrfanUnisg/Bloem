import { Link } from "react-router-dom";
import logo from "@/assets/bloem-logo.png";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="bloem" className="h-16" />
            </div>
            <p className="text-sm text-muted-foreground">
              empowering sustainable fashion through local thrift communities.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  about us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  q&a
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bloem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
