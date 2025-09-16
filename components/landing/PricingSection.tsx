import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const PricingSection = () => {
    const plans = [
        {
            name: "Silver",
            price: "$5",
            period: "One Time",
            description: "Perfect for trying out our AI tools",
            features: [
                "15 images",
                "Edit Image",
                "Generate Image",
                "Remove background from image",
                "Upscale Image"
            ],
            popular: false,
            cta: "Get Started Free"
        },
        {
            name: "Gold",
            price: "$15",
            period: "One Time",
            description: "Best for professionals and creators",
            features: [
                "90 images",
                "Edit Image",
                "Generate Image",
                "Remove background from image",
                "Upscale Image",
                "Priority support"
            ],
            popular: true,
            cta: "Upgrade to Pro"
        },
        {
            name: "Platinum",
            price: "$20",
            period: "One Time",
            description: "Best for professionals and creators",
            features: [
                "140 images",
                "Edit Image",
                "Generate Image",
                "Remove background from image",
                "Upscale Image",
                "Priority support"
            ],
            popular: false,
            cta: "Contact Sales"
        }
    ];

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Choose the perfect plan for your needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card
                            key={plan.name}
                            className={`relative transition-all duration-300 hover:-translate-y-2 ${plan.popular
                                    ? 'border-primary shadow-primary scale-105'
                                    : 'border-border hover:shadow-card'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Star className="w-4 h-4" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <CardHeader className="text-center pb-8">
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">/{plan.period}</span>
                                </div>
                                <CardDescription className="text-base mt-2">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={"/billing"}>
                                <Button
                                    variant={plan.popular ? "default" : "outline"}
                                    className="w-full"
                                    size="lg"
                                >
                                    {plan.cta}
                                </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;