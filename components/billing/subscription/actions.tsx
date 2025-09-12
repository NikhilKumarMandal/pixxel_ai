import { Subscription } from "@prisma/client";
import { getSubscriptionURLs, NewSubscription } from "@/app/action/actions";
import { SubscriptionActionsDropdown } from "./actions-dropdown";

export async function SubscriptionActions({
    subscription,
}: {
    subscription: Subscription | NewSubscription;
}) {
    if (
        subscription.status === "expired" ||
        subscription.status === "cancelled" ||
        subscription.status === "unpaid"
    ) {
        return null;
    }

    const urls = await getSubscriptionURLs(subscription.lemonSqueezyId);

    return <SubscriptionActionsDropdown subscription={subscription} urls={urls} />;
}
