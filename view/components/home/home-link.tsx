import Link from '../shared/link';

interface Props {
  external?: boolean;
  label: string;
  to: string;
}

/** A single row in the home page index */
const HomeLink = ({ external, label, to }: Props) => (
  <Link
    to={to}
    external={external}
    className="font-display w-fit text-[2.125rem] leading-none font-bold tracking-[-0.02em] underline-offset-8 hover:underline md:text-[3rem]"
  >
    {label}
  </Link>
);

export default HomeLink;
