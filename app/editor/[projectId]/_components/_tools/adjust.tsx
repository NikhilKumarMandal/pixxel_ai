"use client"
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/context/context";
import { filters } from "fabric";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";


const FILTER_CONFIGS = [
    {
        key: "brightness",
        label: "Brightness",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Brightness,
        valueKey: "brightness",
        transform: (value: number) => value / 100,
    },
    {
        key: "contrast",
        label: "Contrast",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Contrast,
        valueKey: "contrast",
        transform: (value: number) => value / 100,
    },
    {
        key: "saturation",
        label: "Saturation",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Saturation,
        valueKey: "saturation",
        transform: (value: number) => value / 100,
    },
    {
        key: "vibrance",
        label: "Vibrance",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Vibrance,
        valueKey: "vibrance",
        transform: (value: number) => value / 100,
    },
    {
        key: "blur",
        label: "Blur",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Blur,
        valueKey: "blur",
        transform: (value: number) => value / 100,
    },
    {
        key: "hue",
        label: "Hue",
        min: -180,
        max: 180,
        step: 1,
        defaultValue: 0,
        filterClass: filters.HueRotation,
        valueKey: "rotation",
        transform: (value: number) => value * (Math.PI / 180),
        suffix: "°",
    },
    {
        key: "noise",
        label: "Noise",
        min: 0,
        max: 1000,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Noise,
        valueKey: "noise",
        transform: (value: number) => value,
    },
    {
        key: "pixelate",
        label: "Pixelate",
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 1,
        filterClass: filters.Pixelate,
        valueKey: "blocksize",
        transform: (value: number) => value,
    },

]

type FilterDefaults = {
    [key in (typeof FILTER_CONFIGS)[number]['key']]: number;
};

const DEFAULT_VALUES: FilterDefaults = FILTER_CONFIGS.reduce((acc, config) => {
    acc[config.key] = config.defaultValue;
    return acc;
}, {} as FilterDefaults);

function AdjustImage() {
    const [filterValues, setFilterValues] = useState(DEFAULT_VALUES);
    const [isApplying, setIsApplying] = useState(false);
    const { canvasEditor } = useCanvas();

    const getActiveImage = () => {
        if (!canvasEditor) return null;
        const activeObject = canvasEditor.getActiveObject();
        if (activeObject && activeObject.type === "image") return activeObject;
        const objects = canvasEditor.getObjects();
        return objects.find((obj: any) => obj.type === "image") || null;
    };

    const applyFilters = async (newValues: FilterDefaults) => {
        if (!canvasEditor) return;

        const image = getActiveImage();
        if (!image) return;

        setIsApplying(true);

        const filtersArray = FILTER_CONFIGS.map((config) => {
            const FilterClass = config.filterClass;
            const filterInstance = new FilterClass({
                [config.valueKey]: config.transform(newValues[config.key]),
            });
            return filterInstance;
        });

        image.filters = filtersArray;
        image.applyFilters();
        canvasEditor.requestRenderAll();

        setIsApplying(false);
    };


    const handleValueChange = (filterKey: string, value: number[]) => {
        const newValue = value[0];
        const newFilterValues = {
            ...filterValues,
            [filterKey]: newValue,
        };
        setFilterValues(newFilterValues);
        applyFilters(newFilterValues);
    };

    const resetFilters = () => {
        setFilterValues(DEFAULT_VALUES);
        applyFilters(DEFAULT_VALUES);
    };

    // const extractFilterValues = (imageObject: any) => {
    //   if (!imageObject?.filters?.length) return DEFAULT_VALUES;

    //   const extractedValues = { ...DEFAULT_VALUES };

    //   imageObject.filters.forEach((filter: any) => {
    //     const config = FILTER_CONFIGS.find(
    //       (c) => c.filterClass.name === filter.constructor.name
    //     );
    //     if (config) {
    //       const filterValue = filter[config.valueKey];
    //       if (config.key === "hue") {
    //         extractedValues[config.key] = Math.round(
    //           filterValue * (180 / Math.PI)
    //         );
    //       } else {
    //         extractedValues[config.key] = Math.round(filterValue * 100);
    //       }
    //     }
    //   });

    //   return extractedValues;
    // };


    const extractFilterValues = (imageObject: any) => {
        if (!imageObject?.filters?.length) return DEFAULT_VALUES;

        const extractedValues = { ...DEFAULT_VALUES };

        const scale100Keys = new Set(["brightness", "contrast", "saturation", "vibrance", "blur"]);

        imageObject.filters.forEach((filter: any) => {
            const config = FILTER_CONFIGS.find(
                (c) => c.filterClass.name === filter.constructor.name
            );
            if (config) {
                const rawValue = filter[config.valueKey];
                let sliderValue: number;

                if (config.key === "hue") {
                    sliderValue = Math.round(rawValue * (180 / Math.PI));
                } else if (scale100Keys.has(config.key)) {
                    sliderValue = Math.round(rawValue * 100);
                } else {
                    sliderValue = Math.round(rawValue);
                }

                extractedValues[config.key] = sliderValue;
            }
        });

        return extractedValues;
    };


    useEffect(() => {
        const imageObject = getActiveImage();
        if (imageObject?.filters) {
            const existingValues = extractFilterValues(imageObject);
            setFilterValues(existingValues);
        }
    }, [canvasEditor]);

    if (!canvasEditor) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">
                    Load an image to start adjusting
                </p>
            </div>
        );
    }

    const activeImage = getActiveImage();
    if (!activeImage) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">
                    Select an image to adjust filters
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Reset Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Image Adjustments</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-white/70 hover:text-white"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            </div>

            {/* Filter Controls */}
            {FILTER_CONFIGS.map((config) => (
                <div key={config.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm text-white">{config.label}</label>
                        <span className="text-xs text-white/70">
                            {filterValues[config.key]}
                            {config.suffix || ""}
                        </span>
                    </div>
                    <Slider
                        value={[filterValues[config.key]]}
                        onValueChange={(value: any) => handleValueChange(config.key, value)}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        className="w-full"
                    />
                </div>
            ))}

            {/* Info */}
            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-white/70">
                    Adjustments are applied in real-time. Use the Reset button to restore
                    original values.
                </p>
            </div>

            {/* Processing Indicator */}
            {isApplying && (
                <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    <span className="ml-2 text-xs text-white/70">
                        Applying filters...
                    </span>
                </div>
            )}
        </div>
    );
}

export default AdjustImage