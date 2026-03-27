import React, { useState, useRef } from "react";
import { X, ZoomIn, ZoomOut, Download, Crop, RotateCcw } from "lucide-react";

interface ImageModalProps {
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
    onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    imageUrl,
    imageName,
    onClose,
}) => {
    const [zoom, setZoom] = useState(1);
    const [crop, setCrop] = useState(false);
    const [cropSize, setCropSize] = useState<"square" | "16:9" | "9:16" | "custom">("square");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 4));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);
    const handleFitToWindow = () => {
        if (!imageRef.current || !containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const imgWidth = imageRef.current.naturalWidth;
        const imgHeight = imageRef.current.naturalHeight;
        const fitZoom = Math.min(containerWidth / imgWidth, containerHeight / imgHeight) * 0.9;
        setZoom(Math.max(fitZoom, 0.5));
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) setZoom(Math.max(0.5, Math.min(value, 4)));
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = imageName || "image.png";
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const handleCropCancel = () => {
        setCrop(false);
        setCropSize("square");
    };

    const handleCrop = () => {
        if (!crop) {
            setCrop(true);
            return;
        }

        if (!imageRef.current || !canvasRef.current) {
            handleDownload();
            handleCropCancel();
            return;
        }

        const img = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            handleDownload();
            handleCropCancel();
            return;
        }

        try {
            let cropWidth, cropHeight;
            const minDim = Math.min(img.width, img.height);

            if (cropSize === "square") {
                cropWidth = cropHeight = minDim * 0.8;
            } else if (cropSize === "16:9") {
                cropWidth = img.width * 0.9;
                cropHeight = cropWidth / (16 / 9);
                if (cropHeight > img.height) {
                    cropHeight = img.height * 0.9;
                    cropWidth = cropHeight * (16 / 9);
                }
            } else if (cropSize === "9:16") {
                cropHeight = img.height * 0.9;
                cropWidth = cropHeight / (16 / 9);
                if (cropWidth > img.width) {
                    cropWidth = img.width * 0.9;
                    cropHeight = cropWidth * (16 / 9);
                }
            } else {
                cropWidth = cropHeight = minDim * 0.8;
            }

            const startX = (img.width - cropWidth) / 2;
            const startY = (img.height - cropHeight) / 2;

            canvas.width = cropWidth;
            canvas.height = cropHeight;
            ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            canvas.toBlob((blob) => {
                if (!blob) {
                    handleDownload();
                    return;
                }
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `cropped-${imageName || "image"}.png`;
                link.click();
                window.URL.revokeObjectURL(url);
                handleCropCancel();
            });
        } catch (error) {
            console.warn("Crop failed (CORS?), downloading original instead:", error);
            handleDownload();
            handleCropCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {imageName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Image Container */}
                <div ref={containerRef} className="relative overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: "400px" }}>
                    <div
                        style={{
                            transform: `scale(${zoom})`,
                            transition: "transform 0.2s ease",
                        }}
                    >
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt={imageName}
                            crossOrigin="anonymous"
                            className="max-h-96 max-w-full object-contain"
                        />
                    </div>
                    {crop && (
                        <div className="absolute inset-0 border-4 border-orange-500" style={{
                            left: "10%",
                            top: "10%",
                            width: "80%",
                            height: "80%",
                        }} >
                            <div className="absolute inset-0 border-2 border-dashed border-orange-300 opacity-50" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-gray-50 border-t border-gray-200">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>

                        <input
                            type="number"
                            min="50"
                            max="400"
                            step="10"
                            value={(zoom * 100).toFixed(0)}
                            onChange={handleZoomChange}
                            className="w-16 px-2 py-2 text-center text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 font-medium">%</span>

                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 4}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleResetZoom}
                            title="Reset zoom to 100%"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleFitToWindow}
                            title="Fit image to window"
                            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                            Fit
                        </button>
                    </div>

                    {/* Crop Controls */}
                    <div className="flex items-center gap-2">
                        {crop && (
                            <>
                                <select
                                    value={cropSize}
                                    onChange={(e) => setCropSize(e.target.value as any)}
                                    className="px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="square">Square</option>
                                    <option value="16:9">16:9</option>
                                    <option value="9:16">9:16</option>
                                    <option value="custom">Custom</option>
                                </select>

                                <button
                                    onClick={handleCrop}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                                >
                                    <Crop className="w-4 h-4" />
                                    Apply Crop
                                </button>

                                <button
                                    onClick={handleCropCancel}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        {!crop && (
                            <button
                                onClick={handleCrop}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                <Crop className="w-4 h-4" />
                                Crop
                            </button>
                        )}
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
