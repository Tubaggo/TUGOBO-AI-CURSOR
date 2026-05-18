export const locales = ["tr", "en"] as const;
export type PanelLocale = (typeof locales)[number];

/** Turkish is the primary product language for hotel operations. */
export const defaultLocale: PanelLocale = "tr";
