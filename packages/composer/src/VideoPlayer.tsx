import type { VideoHTMLAttributes } from "react";

export type VideoTrack = { src: string; kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"; srcLang: string; label: string; default?: boolean };
export type VideoSource = { src: string; type?: string; media?: string };
export type VideoPlayerProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & { label: string; sources: VideoSource[]; tracks?: VideoTrack[]; fallback?: string; className?: string };

export default function VideoPlayer({ label, sources, tracks = [], fallback = "Your browser does not support this video.", className, controls = true, preload = "metadata", ...props }: VideoPlayerProps) {
  return <figure className={className} data-vc-component="video-player" data-vc-slot="root" data-vc-state={sources.length > 0 ? "ready" : "empty"}>
    <video {...props} aria-label={label} controls={controls} preload={preload} playsInline data-vc-slot="media">{sources.map((source) => <source key={`${source.src}-${source.type}`} src={source.src} type={source.type} media={source.media} />)}{tracks.map((track) => <track key={`${track.src}-${track.kind}`} src={track.src} kind={track.kind} srcLang={track.srcLang} label={track.label} default={track.default} />)}{fallback}</video>
  </figure>;
}
