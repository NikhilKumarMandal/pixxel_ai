export type PLAN = {
    id: string;
    title: string;
    tokens: number;
    price: number;
    originalPrice?: number;
    badge?: string;
    isLimitedTimeOffer?: boolean;
    buttonText: string;
    features: string[];
};



const featuresX: string[] = [
    "15 images",
    "Edit Image",
    "Generate Image",
    "Remove bg image",
    "Upscale Image",
]

const featuresY: string[] = [
    "90 images",
    "Edit Image",
    "Generate Image",
    "Remove bg image",
    "Upscale Image",
    "Priority support"
]

const featuresZ: string[] = [
    "140 images",
    "Edit Image",
    "Generate Image",
    "Remove bg image",
    "Upscale Image",
    "Priority support"
]



// Convert token usage to an array of strings
// const usageFeatures = Object.entries(TOKEN_USAGE).map(
//   ([service, usage]) => `${service}: ${usage}`
// );

// Plans array with shared features
export const PLANS: PLAN[] = [
    {
        id: "silver",
        title: "Silver",
        tokens: 30,
        price: 5,
        originalPrice: 12,
        isLimitedTimeOffer: true,
        buttonText: "Continue with Silver",
        features: featuresX,
    },
    {
        id: "gold",
        title: "Gold",
        tokens: 180,
        price: 15,
        originalPrice:30 ,
        badge: "Most Popular",
        isLimitedTimeOffer: true,
        buttonText: "Continue with Gold",
        features: featuresY,
    },
    {
        id: "platinum",
        title: "Platinum",
        tokens:280,
        price: 20,
        originalPrice: 40,
        isLimitedTimeOffer: true,
        buttonText: "Continue with Platinum",
        features: featuresZ,  
    },
];