export default function Head() {
    const title =
        "Shoutly AI | AI Social Media Automation & 365 Days of Content";
    const description =
        "Shoutly AI is an AI social media automation platform that generates 365 days of branded posts, reels, captions, and a social media calendar in minutes.";
    const image = "https://shoutlyai.com/opengraph-image";
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://shoutlyai.com/#organization",
                name: "Shoutly AI",
                url: "https://shoutlyai.com/",
                logo: "https://shoutlyai.com/images/logo.png",
            },
            {
                "@type": "SoftwareApplication",
                "@id": "https://shoutlyai.com/#software",
                name: "Shoutly AI",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                url: "https://shoutlyai.com/",
                description,
                offers: {
                    "@type": "Offer",
                    price: "29",
                    priceCurrency: "USD",
                },
            },
            {
                "@type": "FAQPage",
                "@id": "https://shoutlyai.com/#faq",
                mainEntity: [
                    {
                        "@type": "Question",
                        name: "How does Shoutly AI generate 365 days of social media content?",
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: "Shoutly AI uses your industry, brand voice, and content goals to generate a full year of posts, reels, captions, and hashtags in minutes.",
                        },
                    },
                    {
                        "@type": "Question",
                        name: "Can I schedule posts across multiple social media platforms?",
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: "Yes. Shoutly AI is built for social media automation and supports planning and scheduling workflows across Instagram, LinkedIn, Facebook, X, YouTube, and more.",
                        },
                    },
                    {
                        "@type": "Question",
                        name: "Is the content customized for my industry?",
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: "Yes. The platform creates industry-specific templates and AI content tailored to business categories such as fitness, restaurants, real estate, and other local services.",
                        },
                    },
                    {
                        "@type": "Question",
                        name: "Do I need design or copywriting experience to use Shoutly AI?",
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: "No. Shoutly AI is designed for non-designers and business owners, with ready-to-use templates, automated captions, and a guided content workflow.",
                        },
                    },
                ],
            },
        ],
    };

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href="https://shoutlyai.com/" />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Shoutly AI" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content="https://shoutlyai.com/" />
            <meta property="og:image" content={image} />
            <meta property="og:image:alt" content="Shoutly AI social media automation platform" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </>
    );
}
