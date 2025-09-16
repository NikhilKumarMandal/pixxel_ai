import { Button } from "@/components/ui/button";
import heroImage from "../assets/hero.jpg";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden pt-16">
            <div className="container mx-auto px-6 z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left space-y-8">
                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-6xl font-bold text-primary leading-tight">
                                Edit Images with
                                <span className="block bg-gradient-to-r from-primary to-gray-300 bg-clip-text text-transparent">
                                    AI Magic
                                </span>
                            </h1>
                            <p className="text-lg lg:text-xl text-gray-400 max-w-xl">
                                Professional image editing powered by AI. Generate, enhance, and transform your visuals instantly.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href={"/generator"}>
                                <Button variant="hero" size="lg" className="px-8 py-4">
                                    Start
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative">
                        <div className="relative overflow-hidden rounded-xl shadow-primary">
                            <Image
                                src={heroImage}
                                alt="AI Image Editing Demo"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;