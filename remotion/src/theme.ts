import { loadFont as loadDisplay } from "@remotion/google-fonts/Oswald";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

// Loading fonts at module scope registers them with Remotion's delayRender so
// the first frame isn't captured before the font is ready. Restrict weights and
// subsets so renders don't fan out into dozens of font network requests.
const display = loadDisplay("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] });

/**
 * The single brand-swap surface. Fork this file to re-skin every composition.
 */
export const theme = {
  fonts: {
    display: display.fontFamily, // headlines, titles
    body: body.fontFamily, // supporting copy, captions
  },
  colors: {
    bg: "#161616",
    surface: "#1f1f1f",
    text: "#ffffff",
    muted: "#a3a3a3",
    accent: "#ffc800",
    accentText: "#161616",
  },
  sizes: {
    h1: 96,
    h2: 68,
    body: 40,
    caption: 34,
    kicker: 30,
    /** Big-number stat card. Intentionally large; use a shorter value string if it overflows. */
    stat: 320,
  },
  /** Bottom safe-area padding for caption overlay (accounts for mobile UI chrome). */
  safeAreaBottom: 260,
  radius: 28,
  pad: 72,
} as const;

export type Theme = typeof theme;
