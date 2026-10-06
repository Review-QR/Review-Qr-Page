import { requireActiveMerchant } from "@/lib/merchant-auth";
import MessageDesigner from "./message-designer";
import { getMerchantMessages } from "./actions";

export const dynamic = "force-dynamic";
export default async function MerchantMessagesPage() {
  const merchant = await requireActiveMerchant();
  const saved = await getMerchantMessages();
  return <MessageDesigner businessName={merchant.businessName} businessType={merchant.businessType} saved={saved} />;
}
