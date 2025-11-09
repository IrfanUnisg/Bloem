---
title: Bloem — Product Requirements (Knowledge File)
version: 1.0
author: Irfan
date: 2025-11-07
status: Approved for MVP
tags: [Second-hand, Thrift Shops, Inventory Management, Sustainability, Marketplace, Stripe, QR Codes]
---

# Summary
Bloem is a digital platform connecting sellers and buyers of second-hand clothing while supporting independent thrift shops with inventory management. It enables seamless consignment sales, real-time inventory insights, and instant seller payouts. The app targets urban Gen Z users focused on sustainable shopping and local thrift stores seeking digitization and marketing solutions.

---

## Vision, Mission & Problem Statement

### Vision  
Empower thrift shops and Gen Z consumers to embrace sustainable fashion through a digitized, transparent, and seamless second-hand marketplace.

### Mission  
Create a trusted digital platform that connects sellers, buyers, and thrift stores, enabling effortless consignment sales, efficient inventory management, instant payouts, and data-driven marketing.

### Problem Statement  
Thrift shops currently rely on manual inventory methods and have limited digital presence. Sellers face payout uncertainty, and buyers lack convenient access to local inventory. Bloem solves these problems by digitizing inventory, simplifying sales, and enhancing local discovery to promote sustainability.

### Strategic Goals  
- Reduce manual administrative tasks by at least 30% through digital inventory and self-service.  
- Increase store sales by 15–30% via enhanced marketing and transparency.  
- Boost customer footfall by 10–25% with improved buyer awareness.  
- Maintain high seller trust with instant payouts.  
- Promote sustainable shopping habits among urban Gen Z.

---

## Users & Roles

### Sellers/Buyers (Hybrid Account)  
- Upload items (photos, descriptions, prices).  
- Select drop-off thrift store and pay hanger rental fees.  
- Track items: for sale, sold, or pending drop-off.  
- Browse and purchase local inventory online; arrange for pickup or in-store try-on.  
- Receive immediate payouts upon sale completion.

### Stores (Owners and Staff)  
- Manage store-owned and consigned inventory digitally.  
- Process seller drop-offs and print QR codes for tagging.  
- Scan QR codes for in-store sales; auto-update inventory.  
- Monitor sales analytics and item performance.  
- Send targeted marketing to shoppers based on trends.

### Bloem Admin Team  
- Verify store authenticity and set subscription, commission, and fee rates.  
- Oversee payouts via Stripe for sellers and stores.  
- Provide customer support and dispute resolution.  
- Monitor platform security and operations.

---

## User Experience Flows

### Seller Journey  
1. Upload photos and item details.  
2. Choose drop-off store; pay hanger rental fee.  
3. Physically drop off items.  
4. Track sales via dashboard.  
5. Receive instant payouts.

### Buyer Journey  
1. Browse local thrift inventory.  
2. Reserve or buy items through app.  
3. Pickup in store or purchase after trying on.

### Store Staff Journey  
1. Add/update inventory (store-owned and consigned).  
2. Handle seller drop-offs and print QR tags.  
3. Process in-store sales using QR scanning.  
4. Analyze sales and optimize rack space.  
5. Send marketing campaigns.

---

## Functional Requirements

### Must-Have  
- Real-time digital inventory management.  
- Unified seller/buyer account with listing creation and management.  
- Store-side inventory management and QR code generation/scanning.  
- Instant payouts via Stripe integration.  
- Analytics dashboards for stores and sellers.  
- Basic marketing communication tools.  
- Admin control panel for store verification, pricing, commissions, support.

### Nice-to-Have  
- AI-assisted listing creation with reverse image search.  
- Automated marketing via social media trend scraping.  
- Advanced ecommerce features like pricing optimization, loyalty programs.

---

## Technology Architecture

- Frontend: Cross-platform mobile and web applications.  
- Backend: Cloud-hosted API and databases for user, inventory, and payment data.  
- Core services: Authentication, payment processing with Stripe, QR code generation, analytics.  
- CI/CD pipeline for deployment and testing.  
- Security: Role-based access, data encryption, fraud prevention.

---

## Design System

- Background: Use #F7F4F2 (CSS var --background: 30 25% 96%) as the warm, inviting canvas.
- Accent Hierarchy:
Primary Purple (#6B22B1) for calls-to-action, primary interactions, and brand moments.
Light Purple (#B79CED) for secondary actions, hover states, and supporting UI elements.
Lime Green (#BED35C) for success states, highlights, and accent details.
Dark Charcoal for all text, ensuring WCAG AA compliant contrast.
- Card Treatment: White cards (#FFFFFF) on a cream background with soft, subtle shadows to provide depth without harshness.
- Consistent component library: buttons, forms, modals, lists, QR code display.  
- Accessibility standards compliance.

---

## External References

- Stripe API for payment and payout processing.  
- Competitors: Vinted, Depop (differentiated by focus on local, physical try-ons).  
- Relevant design systems and sustainable fashion branding.

---


---