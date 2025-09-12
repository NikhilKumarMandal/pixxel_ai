"use client";

import { changePlan, getCheckoutURL } from "@/app/action/actions";
import { NewPlan } from "@/types/plan";
import { Button, Loading } from "@lemonsqueezy/wedges";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useState, forwardRef, type ComponentProps, type ElementRef } from "react";
import { toast } from "sonner";

type ButtonElement = ElementRef<typeof Button>;
type ButtonProps = ComponentProps<typeof Button> & {
    isChangingPlans?: boolean;
    currentPlan?: NewPlan | null;
    plan: NewPlan;
};

export const SignupButton = forwardRef<ButtonElement, ButtonProps>(
    (props, ref) => {
        const [loading, setLoading] = useState(false);
        const {
            plan,
            currentPlan,
            isChangingPlans = false,
            ...otherProps
        } = props;

        const isCurrent = currentPlan && plan.id === currentPlan.id;

        const label = isCurrent
            ? "Your plan"
            : isChangingPlans
                ? "Switch to this plan"
                : "Sign up";

        const before = loading ? (
            <Loading size="sm" className="size-4 dark" color="secondary" />
        ) : (props.before ?? isCurrent) ? (
            <CheckIcon className="size-4" />
        ) : (
            <PlusIcon className="size-4" />
        );

        return (
            <Button
                ref={ref}
                before={before}
                disabled={(loading || isCurrent) ?? props.disabled}
                onClick={async () => {
                    if (isChangingPlans) {
                        if (!currentPlan?.id) throw new Error("Current plan not found.");
                        if (!plan.id) throw new Error("New plan not found.");

                        setLoading(true);
                         await changePlan(currentPlan.id, plan.id);
                        setLoading(false);
                        return;
                    }

                    try {
                        setLoading(true);
                        const checkoutUrl = await getCheckoutURL(plan.variantId, false);

                        if (!checkoutUrl) {
                            throw new Error("Checkout URL not returned.");
                        }

                        // ✅ Redirect directly to payment gateway
                        window.location.href = checkoutUrl;
                    } catch (error) {
                        toast("Error creating a checkout.", {
                            description: "Please check the server console for more information.",
                        });
                    } finally {
                        setLoading(false);
                    }
                }}
                {...otherProps}
            >
                {label}
            </Button>
        );
    }
);
