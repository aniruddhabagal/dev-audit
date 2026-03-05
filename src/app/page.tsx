"use client";

import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const STEPS = [
  { num: "01", title: "Paste Your Repo", desc: "Drop any GitHub URL — public or private. One click, that's it." },
  { num: "02", title: "Agents Analyze", desc: "5 specialized AI agents tear through your code in parallel, each with domain expertise." },
  { num: "03", title: "Get Your Report", desc: "Interactive dashboard with severity scores, affected files, and before/after diffs." },
  { num: "04", title: "Auto-Fix PRs", desc: "Not just problems — actual solutions. The Fix Agent opens real GitHub PRs." },
];

const FEATURES = [
  { icon: "🔍", title: "Code Quality", desc: "Spots anti-patterns, dead code, god functions, and bad naming conventions that slip past linters." },
  { icon: "🔒", title: "Security", desc: "Finds exposed secrets, SQL injection risks, unsafe eval(), and weak authentication patterns." },
  { icon: "📈", title: "Scalability", desc: "Flags N+1 queries, missing indexes, synchronous blocking calls — what breaks at 10x traffic." },
  { icon: "📝", title: "Documentation", desc: "Rewrites your README, generates missing docstrings, and creates a proper .env.example file." },
  { icon: "🛠️", title: "Auto-Fix", desc: "Opens actual GitHub PRs with suggested fixes. One commit per issue, clear descriptions." },
  { icon: "⚡", title: "Real-Time", desc: "Watch agents work live. Streaming output like a CI terminal. No waiting for a PDF report.", highlight: true },
];

const PRICING = [
  {
    tier: "Starter", amount: "$0", period: "/month", desc: "For trying things out",
    features: ["1 public repo per month", "3 analysis agents", "Basic report", "Community support"],
    cta: "Get Started Free", ctaStyle: "da-btn--outline",
  },
  {
    tier: "Pro", amount: "$29", period: "/month", desc: "For individual developers", pro: true,
    features: ["Unlimited repos", "All 5 agents", "Auto-fix PRs", "Private repo support", "Priority queue", "Audit history"],
    cta: "Start Pro Trial", ctaStyle: "da-btn--accent",
  },
  {
    tier: "Team", amount: "$79", period: "/month", desc: "For engineering teams",
    features: ["Everything in Pro", "Team dashboard", "API access", "Custom agent rules", "SSO & SAML", "Dedicated support"],
    cta: "Contact Sales", ctaStyle: "da-btn--outline",
  },
];

const TESTIMONIALS: { stars: string; quote: string; name: string; role: string }[][] = [
  [
    { stars: "★★★★★", quote: "Found a hardcoded AWS key we missed for 6 months. The Security Agent caught it in 20 seconds.", name: "Priya Sharma", role: "Staff Engineer, Stripe" },
    { stars: "★★★★★", quote: "The Fix Agent opened a PR that actually compiled and passed tests. I've never seen that from a tool before.", name: "James Chen", role: "CTO, Basecamp" },
  ],
  [
    { stars: "★★★★★", quote: "Pointed out 14 N+1 queries we didn't know about. Response times dropped 40% after fixing them.", name: "Marcus Johnson", role: "Lead Dev, Linear" },
    { stars: "★★★★★", quote: "We run DevAudit on every PR now. It's like having a senior engineer review your code 24/7.", name: "Anika Patel", role: "VP Eng, Vercel" },
  ],
  [
    { stars: "★★★★★", quote: "The documentation agent rewrote our README and it was genuinely better than what we had. Embarrassingly better.", name: "Sophie Laurent", role: "Engineering Manager, Datadog" },
    { stars: "★★★★★", quote: "Watching the agents work in real-time is addictive. Like watching a build log but for code quality.", name: "Raj Krishnan", role: "Senior SRE, Cloudflare" },
  ],
];

const FAQS = [
  { q: "How does DevAudit analyze my code?", a: "We clone your repository, parse the file structure, and chunk files into LLM-safe segments. Five specialized AI agents — each with a different system prompt and toolset — analyze your code in parallel. Each agent focuses on their domain: code quality, security, scalability, documentation, and automated fixes." },
  { q: "Is my code safe and private?", a: "Absolutely. We clone your repo temporarily for analysis and delete it immediately after. Your code is never stored permanently, never used for training, and never shared. All connections are encrypted with TLS. For private repos, we use GitHub OAuth with the minimum required permissions." },
  { q: "Can DevAudit actually fix issues automatically?", a: "Yes. Our Fix Agent takes all findings from the analysis agents, prioritizes by severity, generates code patches, and opens a real GitHub Pull Request. Each fix is one commit with a clear description. You review and merge — it never pushes directly to your main branch." },
  { q: "What languages and frameworks does it support?", a: "DevAudit supports all major languages including Python, JavaScript/TypeScript, Java, Go, Rust, Ruby, and more. The agents understand framework-specific patterns — Django, FastAPI, React, Next.js, Spring Boot, Rails, and others. If it's on GitHub, we can audit it." },
  { q: "How long does a full audit take?", a: "Most repositories are fully audited in 2–5 minutes. Because our agents run in parallel, the total time is roughly the time of the slowest agent, not the sum. You can watch the progress in real-time as each agent streams findings to your dashboard." },
  { q: "Can I integrate DevAudit into my CI/CD pipeline?", a: "Yes — on the Team plan, you get API access to trigger audits programmatically. You can run DevAudit on every push, every PR, or on a schedule. Results are available via API or webhook, so you can block merges on critical security findings." },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function LandingPage() {
  const lenisRef = useRef<Lenis | null>(null);
  const { data: session } = useSession();

  /* ─── FAQ Toggle ─── */
  const handleFaqClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = e.currentTarget;
    const item = trigger.parentElement!;
    const content = item.querySelector<HTMLDivElement>(".da-faq-item__content")!;
    const isOpen = item.classList.contains("is-open");

    // Close all siblings
    document.querySelectorAll(".da-faq-item.is-open").forEach((open) => {
      if (open !== item) {
        open.classList.remove("is-open");
        open.querySelector<HTMLButtonElement>(".da-faq-item__trigger")!.setAttribute("aria-expanded", "false");
        gsap.to(open.querySelector(".da-faq-item__content"), { maxHeight: 0, duration: 0.4, ease: "power2.inOut" });
      }
    });

    if (isOpen) {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      gsap.to(content, { maxHeight: 0, duration: 0.4, ease: "power2.inOut" });
    } else {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      gsap.to(content, { maxHeight: content.scrollHeight + 20, duration: 0.4, ease: "power2.inOut" });
    }
  }, []);

  /* ─── Lenis + GSAP ScrollTrigger init ─── */
  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, touchMultiplier: 1.5 });
    lenisRef.current = lenis;

    // Sync Lenis → GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ─── NAV scroll state ─── */
    const nav = document.getElementById("da-nav");
    ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => {
        nav?.classList.toggle("da-nav--scrolled", self.scroll() > 80);
      },
    });

    /* ─── Anchor smooth scroll via Lenis ─── */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (anchor as HTMLAnchorElement).getAttribute("href");
        if (!href) return;
        
        if (href === "#") {
          // Scroll to top
          lenis.scrollTo(0, { duration: 1.2 });
          return;
        }

        try {
          const target = document.querySelector(href);
          if (target) lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.2 });
        } catch (err) {
          // Ignore invalid selectors to prevent crashes
        }
      });
    });

    /* ─── HERO ANIMATIONS ─── */
    const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTL
      .from(".da-hero__badge", { opacity: 0, y: 20, duration: 0.6, delay: 0.3 })
      .from(".da-hero__title", { opacity: 0, y: 40, duration: 0.8 }, "-=0.3")
      .from(".da-hero__subtitle", { opacity: 0, y: 30, duration: 0.6 }, "-=0.4")
      .from(".da-hero__actions .da-btn", { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }, "-=0.3")
      .from(".da-terminal", { opacity: 0, y: 60, scale: 0.95, duration: 1 }, "-=0.5");

    // Hero parallax (0.4x speed)
    gsap.to("#heroVisual", { y: 200, ease: "none", scrollTrigger: { trigger: ".da-hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".da-hero__glow", { y: 120, scale: 1.2, ease: "none", scrollTrigger: { trigger: ".da-hero", start: "top top", end: "bottom top", scrub: true } });

    /* ─── HOW IT WORKS ─── */
    gsap.from(".da-step", { y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".da-how-it-works", start: "top 75%" } });
    gsap.from(".da-step__divider", { scaleX: 0, opacity: 0, duration: 0.5, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".da-how-it-works", start: "top 70%" } });

    /* ─── FEATURES stagger cards ─── */
    gsap.from(".da-feature-card", { y: 60, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".da-features__grid", start: "top 80%" } });

    /* ─── PRICING clip-path reveal ─── */
    gsap.from(".da-pricing__title", { clipPath: "inset(0 100% 0 0)", ease: "power2.inOut", scrollTrigger: { trigger: ".da-pricing", start: "top 80%", end: "top 45%", scrub: true } });
    gsap.from(".da-pricing-card", { y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".da-pricing__grid", start: "top 80%" } });

    /* ─── TESTIMONIALS horizontal parallax ─── */
    gsap.to(".da-testimonials__col--slow", { x: -40, ease: "none", scrollTrigger: { trigger: ".da-testimonials", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".da-testimonials__col--fast", { x: 40, ease: "none", scrollTrigger: { trigger: ".da-testimonials", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".da-testimonial-card", { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: ".da-testimonials", start: "top 75%" } });

    /* ─── SECTION HEADERS ─── */
    [".da-how-it-works .da-section-label", ".da-how-it-works .da-section-title",
     ".da-features .da-section-label", ".da-features .da-section-title",
     ".da-pricing .da-section-label", ".da-testimonials .da-section-label",
     ".da-testimonials .da-section-title", ".da-faq .da-section-label", ".da-faq .da-section-title",
    ].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) gsap.from(el, { y: 25, opacity: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    /* ─── CTA BANNER ─── */
    gsap.from(".da-cta-banner__title", { y: 40, opacity: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".da-cta-banner", start: "top 80%" } });
    gsap.from(".da-cta-banner__subtitle", { y: 30, opacity: 0, duration: 0.6, delay: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".da-cta-banner", start: "top 80%" } });
    gsap.from(".da-cta-banner__actions", { y: 20, opacity: 0, duration: 0.5, delay: 0.3, ease: "power2.out", scrollTrigger: { trigger: ".da-cta-banner", start: "top 80%" } });

    /* ─── TERMINAL typing effect ─── */
    gsap.from(".da-terminal__line", { opacity: 0, x: -10, duration: 0.3, stagger: 0.12, delay: 1.2, ease: "power2.out" });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <>
      {/* Noise SVG Filter */}
      <svg style={{ display: "none" }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={4} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* ─── NAVIGATION ─── */}
      <nav className="da-nav" id="da-nav">
        <div className="da-nav__inner da-container">
          <a href="#" className="da-nav__logo">
            <span className="da-nav__logo-icon">&#9670;</span> DevAudit
          </a>
          <ul className="da-nav__links">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          
          {session ? (
            <Link
              href="/dashboard"
              className="da-btn da-btn--small da-btn--accent da-nav__cta-desktop"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="da-btn da-btn--small da-btn--accent da-nav__cta-desktop"
            >
              Log in with GitHub
            </button>
          )}

          <button className="da-nav__burger" aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="da-hero" id="da-hero">
        <div className="da-hero__glow" aria-hidden="true" />
        <div className="da-hero__content da-container">
          <div className="da-hero__text">
            <span className="da-hero__badge">Powered by 5 AI Agents</span>
            <h1 className="da-hero__title">
              Your Codebase&apos;s<br />
              <em>Second Brain</em>
            </h1>
            <p className="da-hero__subtitle">
              Drop your GitHub repo. Get a brutal, honest, senior-engineer-level audit&nbsp;—
              with agents that actually fix things.
            </p>
            <div className="da-hero__actions">
              {session ? (
                <Link
                  href="/dashboard"
                  className="da-btn da-btn--accent da-btn--large"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                  className="da-btn da-btn--accent da-btn--large"
                >
                  Audit Your Repo
                </button>
              )}
              <a href="#features" className="da-btn da-btn--ghost da-btn--large">See How It Works</a>
            </div>
          </div>
          <div className="da-hero__visual" id="heroVisual">
            <div className="da-terminal">
              <div className="da-terminal__chrome">
                <span className="da-terminal__dot da-terminal__dot--red" />
                <span className="da-terminal__dot da-terminal__dot--yellow" />
                <span className="da-terminal__dot da-terminal__dot--green" />
                <span className="da-terminal__title">devaudit — audit running</span>
              </div>
              <div className="da-terminal__body">
                <div className="da-terminal__line da-terminal__line--agent">
                  <span className="da-terminal__icon">🔍</span>
                  <span className="da-terminal__agent">Code Quality Agent</span>
                  <span className="da-terminal__status da-terminal__status--active">scanning...</span>
                </div>
                <div className="da-terminal__line da-terminal__line--finding">
                  <span className="da-terminal__severity da-terminal__severity--high">HIGH</span>
                  God function detected in <span className="da-terminal__file">api/handlers.py</span> (342 lines)
                </div>
                <div className="da-terminal__line da-terminal__line--finding">
                  <span className="da-terminal__severity da-terminal__severity--med">MED</span>
                  Unused import in <span className="da-terminal__file">utils/helpers.py:3</span>
                </div>
                <div className="da-terminal__line da-terminal__line--agent">
                  <span className="da-terminal__icon">🔒</span>
                  <span className="da-terminal__agent">Security Agent</span>
                  <span className="da-terminal__status da-terminal__status--active">scanning...</span>
                </div>
                <div className="da-terminal__line da-terminal__line--finding">
                  <span className="da-terminal__severity da-terminal__severity--crit">CRIT</span>
                  Hardcoded API key in <span className="da-terminal__file">config.py:17</span>
                </div>
                <div className="da-terminal__line da-terminal__line--finding">
                  <span className="da-terminal__severity da-terminal__severity--high">HIGH</span>
                  SQL injection risk in <span className="da-terminal__file">db/queries.py:89</span>
                </div>
                <div className="da-terminal__line da-terminal__line--agent">
                  <span className="da-terminal__icon">📈</span>
                  <span className="da-terminal__agent">Scalability Agent</span>
                  <span className="da-terminal__status da-terminal__status--done">done</span>
                </div>
                <div className="da-terminal__line da-terminal__line--agent">
                  <span className="da-terminal__icon">🛠️</span>
                  <span className="da-terminal__agent">Fix Agent</span>
                  <span className="da-terminal__status da-terminal__status--active">generating patches...</span>
                </div>
                <div className="da-terminal__line da-terminal__line--success">
                  <span className="da-terminal__check">✓</span>
                  PR #142 opened: <span className="da-terminal__file">Remove hardcoded secrets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="da-how-it-works" id="how-it-works">
        <div className="da-container">
          <span className="da-section-label">How It Works</span>
          <h2 className="da-section-title">From URL to Pull Request<br />in&nbsp;minutes</h2>
          <div className="da-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ display: "contents" }}>
                <div className="da-step">
                  <div className="da-step__number">{s.num}</div>
                  <h3 className="da-step__title">{s.title}</h3>
                  <p className="da-step__desc">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className="da-step__divider" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="da-features" id="features">
        <div className="da-container">
          <span className="da-section-label">Why DevAudit</span>
          <h2 className="da-section-title">Five agents. One brutal audit.</h2>
          <div className="da-features__grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`da-feature-card${f.highlight ? " da-feature-card--highlight" : ""}`}>
                <div className="da-feature-card__icon">{f.icon}</div>
                <h3 className="da-feature-card__title">{f.title}</h3>
                <p className="da-feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="da-pricing" id="pricing">
        <div className="da-container">
          <span className="da-section-label">Pricing</span>
          <h2 className="da-section-title da-pricing__title">Simple, transparent pricing</h2>
          <p className="da-section-subtitle" style={{ margin: "0 auto" }}>Start free. Upgrade when your team needs more.</p>
          <div className="da-pricing__grid">
            {PRICING.map((p) => (
              <div key={p.tier} className={`da-pricing-card${p.pro ? " da-pricing-card--pro" : ""}`}>
                {p.pro && <span className="da-pricing-card__badge">Most Popular</span>}
                <h3 className="da-pricing-card__tier">{p.tier}</h3>
                <div className="da-pricing-card__price">
                  <span className="da-pricing-card__amount">{p.amount}</span>
                  <span className="da-pricing-card__period">{p.period}</span>
                </div>
                <p className="da-pricing-card__desc">{p.desc}</p>
                <ul className="da-pricing-card__features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a href="#" className={`da-btn da-btn--full ${p.ctaStyle}`}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="da-testimonials" id="testimonials">
        <div className="da-container">
          <span className="da-section-label">Testimonials</span>
          <h2 className="da-section-title da-section-title--light">Engineers who tried it<br />don&apos;t go back</h2>
          <div className="da-testimonials__track">
            {TESTIMONIALS.map((col, ci) => (
              <div key={ci} className={`da-testimonials__col ${ci % 2 === 0 ? "da-testimonials__col--slow" : "da-testimonials__col--fast"}`}>
                {col.map((t) => (
                  <div key={t.name} className="da-testimonial-card">
                    <div className="da-testimonial-card__stars">{t.stars}</div>
                    <p className="da-testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
                    <div className="da-testimonial-card__author">
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="da-faq" id="faq">
        <div className="da-container">
          <span className="da-section-label">FAQ</span>
          <h2 className="da-section-title">Common questions</h2>
          <div className="da-faq__list">
            {FAQS.map((faq) => (
              <div key={faq.q} className="da-faq-item">
                <button className="da-faq-item__trigger" aria-expanded="false" onClick={handleFaqClick}>
                  <span>{faq.q}</span>
                  <span className="da-faq-item__icon">+</span>
                </button>
                <div className="da-faq-item__content">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="da-cta-banner">
        <div className="da-container">
          <h2 className="da-cta-banner__title">Ready to see what&apos;s hiding<br />in your codebase?</h2>
          <p className="da-cta-banner__subtitle">Start with a free audit. No credit card required.</p>
          <div className="da-cta-banner__actions">
            <a href="#" className="da-btn da-btn--accent da-btn--large">Audit Your Repo Now</a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="da-footer">
        <div className="da-container da-footer__inner">
          <div className="da-footer__brand">
            <a href="#" className="da-nav__logo">
              <span className="da-nav__logo-icon">&#9670;</span> DevAudit
            </a>
            <p className="da-footer__tagline">Your codebase&apos;s second brain.</p>
          </div>
          <div className="da-footer__links">
            <div className="da-footer__col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Changelog</a>
            </div>
            <div className="da-footer__col">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Blog</a>
            </div>
            <div className="da-footer__col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="da-footer__bottom">
            <p>&copy; 2026 DevAudit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
