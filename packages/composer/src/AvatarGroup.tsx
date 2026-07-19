import Avatar, { type AvatarProps } from "./Avatar";

export type AvatarGroupItem = AvatarProps & { id: string };
export type AvatarGroupProps = { items: AvatarGroupItem[]; max?: number; overflowLabel?: (count: number) => string; ariaLabel?: string; className?: string };

export default function AvatarGroup({ items, max = items.length, overflowLabel = (count) => `${count} more`, ariaLabel = "People", className }: AvatarGroupProps) {
  const visible = items.slice(0, max); const overflow = Math.max(0, items.length - visible.length);
  return <div role="group" aria-label={ariaLabel} className={className} data-vc-component="avatar-group">{visible.map((item) => <Avatar key={item.id} src={item.src} alt={item.alt} fallback={item.fallback} fallbackDelay={item.fallbackDelay} className={item.className} />)}{overflow > 0 && <span aria-label={overflowLabel(overflow)} data-vc-avatar-overflow>+{overflow}</span>}</div>;
}
