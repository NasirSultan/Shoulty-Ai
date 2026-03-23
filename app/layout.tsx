import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from "./providers";

const siteUrl = "https://shoutlyai.com";

const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Shoutly AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
        "AI-powered social media automation. Generate 365 days of posts, reels, and captions in minutes.",
    offers: {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
    },
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    preload: false,
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    preload: false,
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Shoutly AI - AI Social Media Automation | One Prompt, 365 Days of Content",
        template: "%s | Shoutly AI",
    },
    description:
        "Generate a full year of branded social media posts, reels, captions, and hashtags in minutes. Auto-schedule across Instagram, TikTok, LinkedIn, Facebook, X, YouTube, and Threads.",
    keywords: [
        "AI social media tool",
        "social media automation",
        "AI content generator",
        "social media scheduler",
        "AI caption generator",
    ],
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Shoutly AI - One Prompt, 365 Days of Content",
        description:
            "AI-powered social media automation for modern businesses. Generate and schedule content faster.",
        url: siteUrl,
        siteName: "Shoutly AI",
        type: "website",
        images: [
            {
                url: "/images/logo.png",
                width: 1200,
                height: 630,
                alt: "Shoutly AI",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Shoutly AI - One Prompt, 365 Days of Content",
        description:
            "Generate and schedule a year of social media content in minutes.",
        images: ["/images/logo.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
    verification: {
        google: "fHEJxSycq3bjrigwO3r8q9hvq-wfbMISHi8lGqeR4fA",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(softwareApplicationSchema),
                    }}
                />
                <Providers>
                    <Header />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
