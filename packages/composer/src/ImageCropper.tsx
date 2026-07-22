"use client";

import Cropper, { type Area, type Point } from "react-easy-crop";
import useControllableState from "./useControllableState";

export type ImageCropperProps = { src: string; alt: string; aspect?: number; crop?: Point; defaultCrop?: Point; zoom?: number; defaultZoom?: number; onCropChange?: (crop: Point) => void; onZoomChange?: (zoom: number) => void; onCropComplete?: (area: Area, pixels: Area) => void; className?: string };

export default function ImageCropper({ src, alt, aspect = 1, crop, defaultCrop = { x: 0, y: 0 }, zoom, defaultZoom = 1, onCropChange, onZoomChange, onCropComplete, className }: ImageCropperProps) {
  const [resolvedCrop, changeCrop] = useControllableState({ value: crop, defaultValue: defaultCrop, onChange: onCropChange });
  const [resolvedZoom, changeZoom] = useControllableState({ value: zoom, defaultValue: defaultZoom, onChange: onZoomChange });
  return <div className={className} data-vc-component="image-cropper" data-vc-slot="root" data-vc-state={resolvedZoom > 1 ? "zoomed" : "ready"}>
    <div role="img" aria-label={`Crop ${alt}`} style={{ aspectRatio: String(aspect) }} data-vc-crop-region data-vc-slot="region">
      <Cropper image={src} crop={resolvedCrop} zoom={resolvedZoom} aspect={aspect} onCropChange={changeCrop} onZoomChange={changeZoom} onCropComplete={onCropComplete} />
    </div>
    <label data-vc-slot="zoom-label">Zoom <input type="range" min={1} max={3} step={0.1} value={resolvedZoom} onChange={(event) => changeZoom(Number(event.currentTarget.value))} data-vc-slot="zoom-control" /></label>
  </div>;
}
