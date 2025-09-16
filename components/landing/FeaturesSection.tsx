import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Sparkles, Scissors, TrendingUp } from "lucide-react";

const FeaturesSection = () => {
    const features = [
        {
            icon: Edit3,
            title: "Smart Edit",
            description: "Professional-grade editing with AI assistance. Adjust colors, lighting, and composition instantly.",
            color: "feature-edit",
            gradient: "from-gray-800 to-gray-900"
        },
        {
            icon: Sparkles,
            title: "AI Generate",
            description: "Create stunning images from text descriptions. Bring your imagination to life with AI.",
            color: "feature-generate",
            gradient: "from-gray-700 to-gray-800"
        },
        {
            icon: Scissors,
            title: "Remove Background",
            description: "Instantly remove or replace backgrounds with pixel-perfect precision using advanced AI.",
            color: "feature-remove",
            gradient: "from-gray-600 to-gray-700"
        },
        {
            icon: TrendingUp,
            title: "Upscale Image",
            description: "Enhance image quality and resolution up to 4x without losing detail or clarity.",
            color: "feature-upscale",
            gradient: "from-gray-500 to-gray-600"
        }
    ];

    return (
        <section id="features" className="py-20 bg-gradient-secondary">
            <div className="container mx-auto px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                        AI-Powered Features
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Professional image editing tools powered by advanced AI technology
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={feature.title}
                            className="group hover:shadow-feature transition-all duration-300 hover:-translate-y-1 border-0 bg-[#191919] backdrop-blur-sm text-[#fafafa]"
                        >
                            <CardHeader className="text-center pb-4">
                                <div className={`mx-auto w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-base leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FeaturesSection;