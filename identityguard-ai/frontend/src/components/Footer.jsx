import { Link } from 'react-router-dom';

const productLinks = [
  { label: 'Features', to: '#trusted-outcomes' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'How it Works', to: '#how-it-works' },
  { label: 'Demo', to: '#demo' },
  { label: 'Dashboard', to: '/dashboard' },
];

const resourceLinks = [
  { label: 'Documentation', to: '/docs' },
  { label: 'GitHub', href: 'https://github.com/yashchhatbar' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-slate-50">
      <div className="app-shell grid gap-10 px-6 py-10 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">

        {/* BRAND */}
        <div>
          <p className="text-base font-semibold text-slate-950">IdentityGuard AI</p>
          <p className="mt-4 max-w-sm leading-7 text-slate-600">
            AI-powered identity verification and duplicate detection system.
          </p>
        </div>

        {/* PRODUCT */}
        <div>
          <p className="text-base font-semibold uppercase text-slate-950">Product</p>
          <div className="mt-4 space-y-3">
            {productLinks.map((link) => (
              link.to.startsWith('#') ? (
                <span
                  key={link.label}
                  onClick={() => {
                    if (window.location.pathname !== '/') {
                      window.location.href = '/' + link.to;
                    } else {
                      document.getElementById(link.to.replace('#', ''))
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="block cursor-pointer transition hover:text-blue-500 hover:translate-x-1"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block transition hover:text-blue-500 hover:translate-x-1"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>

        {/* RESOURCES */}
        <div>
          <p className="text-base font-semibold uppercase text-slate-950">Resources</p>
          <div className="mt-4 space-y-3">
            {resourceLinks.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition hover:text-blue-500 hover:translate-x-1"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block transition hover:text-blue-500 hover:translate-x-1"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* LEGAL */}
        <div>
          <p className="text-base font-semibold uppercase text-slate-950">Legal</p>
          <div className="mt-4 space-y-3">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block transition hover:text-blue-500 hover:translate-x-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="app-shell border-t border-slate-200 px-6 py-5 text-sm text-slate-500 text-center">
        © 2026 IdentityGuard AI. All rights reserved.
      </div>
    </footer>
  );
}