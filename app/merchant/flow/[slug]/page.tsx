import fs from "fs";
import path from "path";
import FlowControllerClient, { ScreenMeta } from "../flow-controller-client";

export const dynamic = "force-dynamic";

function getManifest(): ScreenMeta[] {
  try {
    const filePath = path.join(process.cwd(), "public", "stitch", "merchant-screens-manifest.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as ScreenMeta[];
  } catch (error) {
    console.error("Failed to read merchant screens manifest", error);
    return [];
  }
}

export default async function MerchantFlowSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const screens = getManifest();

  const currentScreen = screens.find((s) => s.slug === slug) || screens[0] || {
    index: 1,
    slug: "merchant_registration_welcome",
    title: "Merchant Registration Welcome",
    moduleId: "MOD-01",
    moduleName: "Registration & Onboarding",
    prevSlug: null,
    nextSlug: "step_1_basic_business_details_mobile_verification",
    htmlPath: "/stitch/merchant/merchant_registration_welcome/code.html",
    pngPath: "/stitch/merchant/merchant_registration_welcome/screen.png",
  };

  return <FlowControllerClient currentScreen={currentScreen} allScreens={screens} />;
}
