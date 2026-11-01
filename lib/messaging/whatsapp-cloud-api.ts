import "server-only";

export interface WhatsAppCloudConfig {
  phoneNumberId?: string;
  accessToken?: string;
  businessAccountId?: string;
}

/**
 * Reads WhatsApp Cloud API configuration from environment variables
 */
export function getWhatsAppCloudConfig(): WhatsAppCloudConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim(),
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN?.trim(),
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim(),
  };
}

/**
 * Send an automated WhatsApp Greeting Poster with caption via Meta Cloud API
 */
export async function sendWhatsAppOccasionMessage(params: {
  recipientPhone: string;
  imageUrl?: string;
  captionText: string;
  templateName?: string;
  templateParams?: string[];
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getWhatsAppCloudConfig();

  if (!config.phoneNumberId || !config.accessToken) {
    return {
      success: false,
      error: "WhatsApp Cloud API credentials not configured (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN missing).",
    };
  }

  const cleanPhone = params.recipientPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const url = `https://graph.facebook.com/v20.0/${config.phoneNumberId}/messages`;

  try {
    let payload: Record<string, unknown>;

    if (params.imageUrl) {
      // Direct Image + Caption message
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "image",
        image: {
          link: params.imageUrl,
          caption: params.captionText,
        },
      };
    } else {
      // Text only message
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: false,
          body: params.captionText,
        },
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }

    const err = data?.error?.message || "WhatsApp delivery failed";
    return { success: false, error: err };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error contacting WhatsApp Cloud API",
    };
  }
}
