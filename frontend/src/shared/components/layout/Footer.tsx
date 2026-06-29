import Link from "next/link";

const COLUMNS = [
  { title: "Product", links: ["Browse", "Originals", "Pricing", "Devices"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Support", links: ["Help Center", "Account", "Status", "Accessibility"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "GDPR"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/60 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                O
              </span>
              <span className="font-display text-lg font-semibold">OTT<span className="text-primary">.</span></span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Cinematic streaming, engineered for performance and built for the world.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} OTT Platform. Phase 0 foundation.</span>
          <span>Made with performance in mind.</span>
        </div>
      </div>
    </footer>
  );
}
