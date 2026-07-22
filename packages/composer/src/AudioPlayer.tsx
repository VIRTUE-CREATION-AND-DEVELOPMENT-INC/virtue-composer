export type AudioSource = { src: string; type?: string };
export type AudioTrack = { src: string; kind: "captions" | "descriptions" | "metadata"; srcLang: string; label: string; default?: boolean };
export type AudioPlayerProps = { label: string; sources: AudioSource[]; tracks?: AudioTrack[]; preload?: "none" | "metadata" | "auto"; autoPlay?: boolean; loop?: boolean; muted?: boolean; className?: string };

export default function AudioPlayer({ label, sources, tracks = [], preload = "metadata", autoPlay, loop, muted, className }: AudioPlayerProps) {
  return <figure className={className} data-vc-component="audio-player" data-vc-slot="root" data-vc-state={sources.length > 0 ? "ready" : "empty"}>
    <figcaption data-vc-slot="caption">{label}</figcaption>
    <audio aria-label={label} controls preload={preload} autoPlay={autoPlay} loop={loop} muted={muted} data-vc-slot="media">
      {sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
      {tracks.map((track) => <track key={track.src} src={track.src} kind={track.kind} srcLang={track.srcLang} label={track.label} default={track.default} />)}
      {sources.map((source) => <a key={source.src} href={source.src} data-vc-slot="download">Download {label}</a>)}
    </audio>
  </figure>;
}
