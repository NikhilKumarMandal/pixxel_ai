// global.d.ts
interface Window {
    LemonSqueezy?: {
        Url: {
            Open: (url: string) => void
        }
    }
    createLemonSqueezy?: () => void
}
