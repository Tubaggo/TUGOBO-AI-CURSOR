"use client";

import { NextIntlClientProvider } from "next-intl";
import type { PanelLocale } from "@/lib/i18n/config";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

const MESSAGES: Record<PanelLocale, typeof tr> = { tr, en };

export function PanelIntlProvider({
  locale,
  children,
}: {
  locale: PanelLocale;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
