"use client";
import { useState } from "react";
import { getCheckoutURL } from "@/app/action/actions";
import { Button } from "@/components/ui/button";
import NumberTicker from "@/components/ui/number-ticker";
import { PLANS } from "@/components/constants/plans";
import { cn } from "@/lib/utils";
import { Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type NewPlan = {
    name: string;
    id: number;
    variantId: number;
    description: string | null;
    price: string;
    isUsageBased: boolean;
    interval: string | null;
    intervalCount: number | null;
    trialInterval: string | null;
    trialIntervalCount: number | null;
    sort: number | null;
    productId: number;
    productName?: string;
};

export function Plan({ serverPlan }: { serverPlan: NewPlan }) {
    const { name, variantId } = serverPlan;
    console.log("variantId", variantId);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const localPlan = PLANS.find((plan:any) => plan.title === name);
    if (!localPlan) return null;

    const getPaymentUrl = async () => {
        try {
            setLoading(true);
            setError(null);
            const url = await getCheckoutURL(variantId);
            if (url) {
                window.open(url, "_blank");
            } else {
                throw new Error("Failed to retrieve payment URL.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Checkout error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative flex flex-col saturate-150 rounded-2xl">
            <div
                className={cn(
                    "flex flex-col size-full border rounded-2xl relative px-6 py-4 [background-image:linear-gradient(345deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.03)_100%)] transition-transform duration-200 hover:scale-[1.03]",
                    localPlan.id === "gold" ? "border-primary/80" : "border-border/60"
                )}
            >
                {/* Badge */}
                {localPlan.badge && (
                    <div className="max-w-fit min-w-min inline-flex items-center whitespace-nowrap px-2 h-7 rounded-full bg-gradient-to-r from-primary to-violet-500 absolute -top-3 left-1/2 -translate-x-1/2 select-none">
                        <span className="text-xs font-medium bg-gradient-to-r from-white to-foreground/80 bg-clip-text text-transparent bg-[length:250%_100%] animate-background-shine">
                            {localPlan.badge}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h2 className="absolute text-lg font-semibold text-white text-start">{localPlan.title}</h2>

                {/* Limited time offer */}
                {localPlan.isLimitedTimeOffer &&
                    <Badge variant="secondary" className="absolute top-5 right-3 outline">
                        <Clock className="w-4 h-4" /> Limited time offer
                    </Badge>
                }

                {/* Price */}
                <div className="mt-8 flex items-end justify-center gap-2">
                    <span className="text-3xl font-bold text-white leading-none">
                        $<NumberTicker value={localPlan.price} fixed={localPlan.id === "platinum" ? 2 : 0} />
                    </span>
                    {localPlan.originalPrice && (
                        <span className="text-md text-muted-foreground line-through leading-none pb-[2px]">
                            ${localPlan.originalPrice}
                        </span>
                    )}
                </div>

                {/* Tokens */}
                <div className="mt-3 text-center">
                    <span className="text-xl font-semibold bg-gradient-to-r from-purple-200 to-primary bg-clip-text text-transparent">
                        {localPlan.tokens.toLocaleString()} Credits
                    </span>
                    <span className="text-xs text-muted-foreground">
                        <br />
                        Valid for Lifetime
                    </span>
                    <span className="text-xs text-muted-foreground">
                        <br />
                        2 credits = 1 image
                    </span>
                </div>

                {/* Separator */}
                <hr className="mt-6 border-t border" />

                {/* Features */}
                <ul className="mt-6 flex flex-col gap-2">
                    {localPlan.features.map((feature:any, index:any) => (
                        <li key={index} className="flex items-center gap-2">
                            {/* <CheckIcon className="w-4 h-4 text-primary" /> */}
                            • <p className="text-sm text-muted-foreground">{feature}</p>
                        </li>
                    ))}
                </ul>

                {/* Button */}
                <div className="mt-6">
                    <Button
                        variant={localPlan.id === "gold" ? "default" : "secondary"}
                        className={cn(
                            "w-full hover:scale-100 hover:translate-y-0 shadow-none",
                            localPlan.id === "gold"
                                ? "bg-primary text-white"
                                : "bg-foreground text-gray hover:bg-foreground/90"
                        )}
                        onClick={getPaymentUrl}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                preparing payment...
                            </>
                        ) : (
                            localPlan.buttonText
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}