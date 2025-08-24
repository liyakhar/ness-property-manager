import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { LanguageProvider } from "@/contexts/language-context";
import { locales } from "@/i18n/config";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LanguageProvider>{children}</LanguageProvider>
    </NextIntlClientProvider>
  );
}
