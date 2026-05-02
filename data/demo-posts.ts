export interface DemoPost {
    id: string;
    text: string;
    image: {
        imageUrl: string;
    };
    source: "LLM" | "STOCK";
    industry?: string;
}

export const DEMO_POSTS: DemoPost[] = [
    {
        id: "demo-1",
        text: "Start your day with a perfect cup of coffee. ☕️✨ #CoffeeLovers #MorningVibes",
        image: { imageUrl: "/images/coffee.jpg" },
        source: "STOCK",
        industry: "Food & Beverage"
    },
    {
        id: "demo-2",
        text: "Push your limits and achieve your goals. 🏋️‍♂️💪 #FitnessMotivation #NoExcuses",
        image: { imageUrl: "/images/sport.jpg" },
        source: "STOCK",
        industry: "Fitness"
    },
    {
        id: "demo-3",
        text: "Collaboration is the key to success. 🤝🚀 #TeamWork #OfficeLife",
        image: { imageUrl: "/images/team-office.png" },
        source: "STOCK",
        industry: "Business"
    },
    {
        id: "demo-4",
        text: "Reach for the stars. 🌌✨ #Inspiration #SkyGazing",
        image: { imageUrl: "/images/sky.jpg" },
        source: "STOCK",
        industry: "Travel"
    },
    {
        id: "demo-5",
        text: "Believe in yourself and you will be unstoppable. 🌟🔥 #Motivation #Success",
        image: { imageUrl: "/images/motivation.jpg" },
        source: "STOCK",
        industry: "Coaching"
    },
    {
        id: "demo-6",
        text: "Enjoy the little things in life. ☀️🌴 #Vacation #ChillVibes",
        image: { imageUrl: "/images/holiday1.jpg" },
        source: "STOCK",
        industry: "Lifestyle"
    },
    {
        id: "demo-7",
        text: "Modern aesthetics for modern homes. 🏠✨ #InteriorDesign #HomeDecor",
        image: { imageUrl: "/images/img1.jpeg" },
        source: "STOCK",
        industry: "Real Estate"
    },
    {
        id: "demo-8",
        text: "Sustainable fashion for a better future. 🌿👗 #EcoFriendly #Fashion",
        image: { imageUrl: "/images/img2.jpeg" },
        source: "STOCK",
        industry: "E-commerce"
    }
];
