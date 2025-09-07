import { create } from "zustand";
import { z } from "zod";
import { toast } from "sonner";
import { ImageGenerationFormSchema } from "@/components/ImageGeneration/Configuration"
import { generateImageAction } from "@/app/action/image-actions";


interface GenerateState {
    loading: boolean;
    images: Array<{ url: string }>;
    error: string | null;
    generateImage: (values: z.infer<typeof ImageGenerationFormSchema>) => Promise<void>;
}

const useGeneratedStore = create<GenerateState>((set) => ({
    loading: false,
    images: [],
    error: null,


    generateImage: async (values: z.infer<typeof ImageGenerationFormSchema>) => {
        set({ loading: true, error: null })

        const toastId = toast.loading("Generating images...")

        try {
            const { error, success, data } = await generateImageAction(values);

            if (!success) {
                set({ error: error, loading: false })
                return;
            };

            const datatWithUrl = data.map((url: string) => {
                return {
                    url,
                    ...values
                }
            })

            set({ images: datatWithUrl, loading: false });

            toast.success("Image generated successfully", { id: toastId });

            console.log(datatWithUrl, "dataWithUrl");

        } catch (error: any) {
            console.log(error);
            set({ error: "Failed to generate Image.Please try again", loading: false })

        }
    }
}));


export default useGeneratedStore;