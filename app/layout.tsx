import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | UTI Care",
    default: "UTI Care - Gestão Inteligente de UTI",
  },
  description: "Sistema avançado de gerenciamento de clínicas de UTI e leitos hospitalares. Desenvolvido para otimizar o dia a dia dos profissionais de saúde e garantir o melhor cuidado aos pacientes.",
  applicationName: "UTI Care",
  authors: [{ name: "UTI Care Team" }],
  keywords: ["UTI", "Gestão Hospitalar", "Controle de Leitos", "Saúde", "Gestão de Pacientes", "Sistema Médico"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
