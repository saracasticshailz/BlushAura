import { brand } from '../../config';
import { Button } from './Button';
type Props = { tagline?: string; onClick?: () => void; href?: string };
export function BrandLogo({ tagline = brand.tagline, onClick, href }: Props) {
  const content = (
    <>
      {brand.name}
      <span>{tagline}</span>
    </>
  );
  return href ? (
    <a className="logo" href={href}>
      {content}
    </a>
  ) : (
    <Button className="logo" onClick={onClick}>
      {content}
    </Button>
  );
}
