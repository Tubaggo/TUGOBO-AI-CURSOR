import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "@/lib/i18n/config";

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    timeZone: "Europe/Istanbul",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
