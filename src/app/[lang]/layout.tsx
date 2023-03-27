import "@/app/globals.css";
import React from "react";
import Image from "next/image";
import NavBar from "@/layout/NavBar";
import { Container } from "@/components/ChakraUI";
import { Provider } from "@/components/ChakraUI/Provider";
import { getAppData } from "@/i18n";

type RootLayoutProps = {
  params: {
    lang: string;
  };
  children: React.ReactNode;
};
export default async function RootLayout({
  params,
  children,
}: RootLayoutProps) {
  const { lang } = params;
  const { locale, pathname, i18n } = await getAppData();

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <title>ChatDiffusion</title>
        <meta name="description" content="ChatDiffusion" />
        <meta
          name="keywords"
          content="GitHub Copilot, Prompt Programming, Prompt, Stable Diffusion"
        />
      </head>
      <body>
        <Provider>
          {/* https://github.com/vercel/next.js/issues/42292 */}
          <div className="fixed bg-white left-0 right-0 top-0 z-50">
            {/* @ts-expect-error Async Server Component */}
            <NavBar locale={lang} />
          </div>
          <Container
            marginTop="72px"
            maxW="8xl"
            p={{ md: "2rem", base: "1rem" }}
          >
            {children}
          </Container>
        </Provider>
      </body>
    </html>
  );
}
