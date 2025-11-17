/**
 * SEO Metadata Configuration for Bloem
 * Maintains consistent, sustainable brand voice across all public pages
 */

export interface SEOMetadata {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: "index,follow" | "noindex,follow" | "noindex,nofollow";
  structuredData?: Record<string, any>;
  keywords?: string;
}

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://bloem.shop";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export const seoConfig = {
  siteName: "Bloem",
  siteDescription:
    "Effortless second-hand fashion meets local thrift stores. Buy, sell, and discover sustainable style in your community.",
  twitterHandle: "@bloemshop",
};

/**
 * Generate SEO metadata for any page
 */
export const generateMetadata = (
  override: Partial<SEOMetadata>
): SEOMetadata => {
  const defaultMetadata: SEOMetadata = {
    title: "Bloem — Effortless Second-hand Fashion & Local Thrift Stores",
    description:
      "Discover sustainable fashion by connecting with local thrift shops. Buy, sell, and explore second-hand clothes in your community.",
    ogTitle: "Bloem — Effortless Second-hand Fashion & Local Thrift Stores",
    ogDescription:
      "Discover sustainable fashion by connecting with local thrift shops.",
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl: BASE_URL,
    twitterCard: "summary_large_image",
    twitterImage: DEFAULT_OG_IMAGE,
    canonicalUrl: BASE_URL,
    robots: "index,follow",
    keywords:
      "thrift stores, second-hand fashion, sustainable fashion, local shopping, circular economy",
  };

  return {
    ...defaultMetadata,
    ...override,
    ogTitle: override.ogTitle || override.title || defaultMetadata.ogTitle,
    ogDescription:
      override.ogDescription ||
      override.description ||
      defaultMetadata.ogDescription,
    ogImage: override.ogImage || DEFAULT_OG_IMAGE,
  };
};

/**
 * Structured Data (JSON-LD) Generators
 */
export const structuredData = {
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bloem",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description: seoConfig.siteDescription,
    sameAs: [
      "https://twitter.com/bloemshop",
      "https://instagram.com/bloemshop",
      "https://facebook.com/bloemshop",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      url: `${BASE_URL}/contact`,
    },
  }),

  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bloem",
    url: BASE_URL,
    description: seoConfig.siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/browse?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }),

  collectionPage: (title: string, description: string, url: string) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: description,
    url: url,
  }),

  faqPage: (faqItems: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }),
};

/**
 * Page-specific metadata configurations
 */
export const pageMetadata = {
  home: (): SEOMetadata =>
    generateMetadata({
      title: "Bloem — Effortless Second-hand Fashion & Local Thrift Stores",
      description:
        "Discover sustainable fashion by connecting with local thrift shops. Buy, sell, and explore second-hand clothes in your community.",
      canonicalUrl: `${BASE_URL}/`,
      robots: "index,follow",
    }),

  about: (): SEOMetadata =>
    generateMetadata({
      title: "About Bloem — Sustainable Fashion Platform",
      description:
        "Learn how Bloem is building trust, sustainability, and opportunity in second-hand fashion through local thrift communities.",
      ogTitle: "About Bloem — Sustainable Fashion Platform",
      ogDescription:
        "We're making sustainable fashion accessible, transparent, and profitable for everyone.",
      canonicalUrl: `${BASE_URL}/about`,
    }),

  browse: (): SEOMetadata =>
    generateMetadata({
      title: "Browse Second-hand Fashion — Bloem",
      description:
        "Explore thousands of pre-loved items from local thrift shops. Find your next favorite piece sustainably.",
      canonicalUrl: `${BASE_URL}/browse`,
      robots: "index,follow",
    }),

  browseStores: (): SEOMetadata =>
    generateMetadata({
      title: "Discover Local Thrift Stores — Bloem",
      description:
        "Connect with nearby thrift stores offering unique, sustainable fashion. Browse inventories and discover local gems.",
      canonicalUrl: `${BASE_URL}/browse-stores`,
      robots: "index,follow",
    }),

  contact: (): SEOMetadata =>
    generateMetadata({
      title: "Contact Bloem — Get Support",
      description:
        "Have questions? Reach out to our team. We're here to help with any inquiries about sustainable fashion or our platform.",
      canonicalUrl: `${BASE_URL}/contact`,
    }),

  faq: (): SEOMetadata =>
    generateMetadata({
      title: "FAQ — Bloem",
      description:
        "Find answers to common questions about buying, selling, and managing thrift stores on Bloem.",
      canonicalUrl: `${BASE_URL}/faq`,
    }),

  terms: (): SEOMetadata =>
    generateMetadata({
      title: "Terms & Conditions — Bloem",
      description: "Read Bloem's terms and conditions for using our platform.",
      canonicalUrl: `${BASE_URL}/terms`,
      robots: "index,follow",
    }),

  signUp: (): SEOMetadata =>
    generateMetadata({
      title: "Sign Up — Bloem",
      description: "Join Bloem to start buying or selling sustainable fashion.",
      canonicalUrl: `${BASE_URL}/sign-up`,
      robots: "noindex,follow",
    }),

  signIn: (): SEOMetadata =>
    generateMetadata({
      title: "Sign In — Bloem",
      description: "Sign in to your Bloem account.",
      canonicalUrl: `${BASE_URL}/sign-in`,
      robots: "noindex,follow",
    }),

  itemDetail: (itemName?: string, itemStore?: string): SEOMetadata =>
    generateMetadata({
      title: itemName
        ? `${itemName} — Bloem Second-hand Fashion`
        : "Product Details — Bloem",
      description: itemStore
        ? `Find this unique second-hand item at ${itemStore} on Bloem.`
        : "Explore this sustainable fashion find on Bloem.",
      canonicalUrl: `${BASE_URL}/item`,
    }),

  dashboard: (): SEOMetadata =>
    generateMetadata({
      title: "Dashboard — Bloem",
      description: "Manage your Bloem account and orders.",
      canonicalUrl: `${BASE_URL}/dashboard`,
      robots: "noindex,follow",
    }),

  notFound: (): SEOMetadata =>
    generateMetadata({
      title: "Page Not Found — Bloem",
      description: "The page you're looking for doesn't exist.",
      canonicalUrl: `${BASE_URL}/404`,
      robots: "noindex,follow",
    }),
};
