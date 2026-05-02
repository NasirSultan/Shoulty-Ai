import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from "./providers";

const siteUrl = "https://shoutlyai.com";

const seoSchemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "Shoutly AI",
            url: siteUrl,
            logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/images/logo.png`,
            },
        },
        {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            url: siteUrl,
            name: "Shoutly AI",
            publisher: {
                "@id": `${siteUrl}/#organization`,
            },
            inLanguage: "en",
        },
        {
            "@type": "SoftwareApplication",
            "@id": `${siteUrl}/#software`,
            name: "Shoutly AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: siteUrl,
            description:
                "AI-powered social media automation. Generate 365 days of posts, reels, and captions in minutes.",
            offers: {
                "@type": "Offer",
                price: "29.00",
                priceCurrency: "USD",
            },
        },
        {
            "@type": "Product",
            "@id": `${siteUrl}/#product`,
            name: "Shoutly AI",
            description:
                "AI-powered social media automation. Generate 365 days of posts, reels, and captions in minutes.",
            image: `${siteUrl}/images/logo.png`,
            brand: {
                "@type": "Brand",
                name: "Shoutly AI",
            },
            offers: {
                "@type": "Offer",
                url: siteUrl,
                priceCurrency: "USD",
                price: "29.00",
                availability: "https://schema.org/InStock",
            },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "154",
            },
        },
        {
            "@type": "FAQPage",
            "@id": `${siteUrl}/#faq`,
            mainEntity: [
                {
                    "@type": "Question",
                    name: "What is Shoutly AI?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Shoutly AI is a social media automation tool that generates a full year of branded content, reels, captions, and hashtags from a single prompt.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can I schedule posts to multiple platforms?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, you can auto-schedule posts across Instagram, TikTok, LinkedIn, Facebook, X, YouTube, and Threads.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How much does Shoutly AI cost?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Pricing starts at $29/month. We also offer a free trial with no credit card required.",
                    },
                },
            ],
        },
    ],
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
        canonical: "./",
    },
    openGraph: {
        title: "Shoutly AI - One Prompt, 365 Days of Content",
        description:
            "AI-powered social media automation for modern businesses. Generate a full year of branded posts, reels, and captions from a single prompt.",
        url: siteUrl,
        siteName: "Shoutly AI",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Shoutly AI - One Prompt, 365 Days of Content",
        description:
            "Generate and schedule a year of branded social media content in minutes.",
        creator: "@shoutlyai",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
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
                        __html: JSON.stringify(seoSchemaGraph),
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
