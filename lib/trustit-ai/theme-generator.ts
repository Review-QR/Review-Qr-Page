import { getThemeVisualPrompts } from "./qr-design-theme";
import type { ThemeGenerator } from "./provider-contracts";

export const qrThemeGenerator: ThemeGenerator = {
  promptsFor: getThemeVisualPrompts,
};
