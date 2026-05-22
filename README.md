# PharmaGo Ionic MVP

Standalone Ionic Angular UI for a medical store / online pharmacy shopping flow with mock data and basic admin screens.

## Setup

```bash
cd frontend
npm install
npm run build
npm run lint
npm test
ionic serve
```

## Included

- Standalone pages and lazy routes with `loadComponent`
- Customer tabs flow: home, categories, cart, orders, profile
- Product listing, detail, checkout, addresses, auth, order success
- Admin dashboard, products, product form, categories, orders, order detail, users
- Shared mock services and reusable components

## Notes

- Data is mocked in `src/app/shared/data/mock-data.ts`
- Services are structured so API calls can replace `of(...)` responses later
- Checkout supports Cash on Delivery only
