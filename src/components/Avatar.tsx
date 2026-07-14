import { avatarColor } from "@/lib/avatar";

/** Foto real do usuário quando existe; senão cai na inicial colorida de sempre. */
export default function Avatar({
  name,
  image,
  className,
  style,
}: {
  name: string;
  image?: string | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name} className={className} style={{ objectFit: "cover", ...style }} />;
  }
  return (
    <div className={className} style={{ background: avatarColor(name), ...style }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}
