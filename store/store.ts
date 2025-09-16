import { create } from "zustand";
import { devtools } from "zustand/middleware";


interface CreditState {
    credit: number | null;
    setCredit: (credit: number) => void;
}

export const useCreditStore = create<CreditState>()(
    devtools((set) => ({
        credit: null,
        setCredit: (credit) => set({ credit }),
    }))
);

