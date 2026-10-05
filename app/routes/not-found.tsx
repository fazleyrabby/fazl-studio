import { TLink } from "~/components/Transition";

export const meta = () => [{ title: "Not found | Fazl Studio" }, { name: "robots", content: "noindex" }];

export function NotFound() {
  return (
    <section className="gutter flex min-h-[100dvh] flex-col justify-end gap-8 pb-16">
      <h1 className="type-display text-(length:--text-mega)">404</h1>
      <p className="max-w-[40ch] text-(length:--text-lead) leading-snug tracking-tight text-muted">This page does not exist. The work does.</p>
      <div className="flex flex-wrap gap-3">
        <TLink to="/work" className="btn btn-solid">
          See the work <span className="arrow">→</span>
        </TLink>
        <TLink to="/" className="btn">
          Home
        </TLink>
      </div>
    </section>
  );
}

export default NotFound;
