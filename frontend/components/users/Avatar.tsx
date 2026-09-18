import { avatarColorForName, initialsForName } from "../../lib/colors";

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      title={name}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{
        backgroundColor: avatarColorForName(name),
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.4),
      }}
    >
      {initialsForName(name)}
    </span>
  );
}
