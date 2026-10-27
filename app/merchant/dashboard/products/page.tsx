import { requireActiveMerchant } from "@/lib/merchant-auth";
import {
  getActiveProductCatalogue,
  getMerchantProductOrders,
} from "@/lib/product-orders/product-order-service";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";

export default async function MerchantProductsPage() {
  const merchant = await requireActiveMerchant();
  const [products, orders] = await Promise.all([
    getActiveProductCatalogue(),
    getMerchantProductOrders(merchant.businessId),
  ]);

  return (
    <div className="merchant-products-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ProductsClient
        merchant={{
          businessId: merchant.businessId,
          businessName: merchant.businessName,
          businessType: merchant.businessType,
          ownerName: merchant.ownerName,
          registeredMobile: merchant.registeredMobile,
          address: merchant.address,
          city: merchant.city,
          state: merchant.state,
          pincode: merchant.pincode,
          reviewLink: merchant.reviewLink,
        }}
        products={products}
        initialOrders={orders}
      />
    </div>
  );
}
