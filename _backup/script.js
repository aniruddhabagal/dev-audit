/* ═══════════════════════════════════════════════
   DevAudit — Lenis + GSAP ScrollTrigger Stack
   ───────────────────────────────────────────────
   RULES:
   - Lenis owns ALL scroll behavior
   - GSAP ScrollTrigger syncs with Lenis's RAF
   - No IntersectionObserver for animation triggers
   - No CSS scroll-behavior: smooth
   - No animating width/height/top/left/margin
   - Only transforms and opacity
   ═══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── LENIS INIT ─── */
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  /* ─── GSAP PLUGIN REGISTRATION ─── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─── SYNC LENIS → GSAP ─── */
  // Feed Lenis's scroll position to ScrollTrigger on every scroll event
  lenis.on("scroll", ScrollTrigger.update);

  // Feed Lenis into GSAP's own RAF loop
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable GSAP lag smoothing for frame-perfect sync
  gsap.ticker.lagSmoothing(0);

  /* ═══════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════ */
  const nav = document.getElementById("nav");

  ScrollTrigger.create({
    start: "top -80",
    onUpdate: (self) => {
      if (self.scroll() > 80) {
        nav.classList.add("nav--scrolled");
      } else {
        nav.classList.remove("nav--scrolled");
      }
    },
  });

  // Mobile burger toggle
  const burger = document.getElementById("navBurger");
  const navLinks = document.querySelector(".nav__links");
  if (burger) {
    burger.addEventListener("click", () => {
      navLinks.classList.toggle("nav__links--open");
    });
  }

  // Smooth scroll for anchor links (via Lenis, not CSS)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        lenis.scrollTo(target, {
          offset: -72, // nav height offset
          duration: 1.2,
        });
      }
      // Close mobile menu if open
      if (navLinks) navLinks.classList.remove("nav__links--open");
    });
  });

  /* ═══════════════════════════════════════════════
     HERO ANIMATIONS
     ═══════════════════════════════════════════════ */

  // Hero entrance timeline
  const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTL
    .from(".hero__badge", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.3,
    })
    .from(
      ".hero__title",
      {
        opacity: 0,
        y: 40,
        duration: 0.8,
      },
      "-=0.3",
    )
    .from(
      ".hero__subtitle",
      {
        opacity: 0,
        y: 30,
        duration: 0.6,
      },
      "-=0.4",
    )
    .from(
      ".hero__actions .btn",
      {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
      },
      "-=0.3",
    )
    .from(
      ".terminal",
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 1,
      },
      "-=0.5",
    );

  // Hero parallax: visual moves at 0.4x scroll speed
  gsap.to("#heroVisual", {
    y: 200,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // Hero glow parallax (slightly different speed for depth)
  gsap.to(".hero__glow", {
    y: 120,
    scale: 1.2,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  /* ═══════════════════════════════════════════════
     HOW IT WORKS — Stagger fade in
     ═══════════════════════════════════════════════ */
  gsap.from(".step", {
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".how-it-works",
      start: "top 75%",
    },
  });

  gsap.from(".step__divider", {
    scaleX: 0,
    opacity: 0,
    duration: 0.5,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".how-it-works",
      start: "top 70%",
    },
  });

  /* ═══════════════════════════════════════════════
     FEATURES / WHY US — Stagger cards
     ═══════════════════════════════════════════════ */
  gsap.from(".feature-card", {
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".features__grid",
      start: "top 80%",
    },
  });

  /* ═══════════════════════════════════════════════
     PRICING — Clip-path reveal on section title
     ═══════════════════════════════════════════════ */
  gsap.from(".pricing__title", {
    clipPath: "inset(0 100% 0 0)",
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: ".pricing",
      start: "top 80%",
      end: "top 45%",
      scrub: true,
    },
  });

  // Pricing cards stagger
  gsap.from(".pricing-card", {
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".pricing__grid",
      start: "top 80%",
    },
  });

  /* ═══════════════════════════════════════════════
     TESTIMONIALS — Horizontal parallax columns
     ═══════════════════════════════════════════════ */
  // Slow columns move one direction, fast columns move the other
  gsap.to(".testimonials__col--slow", {
    x: -40,
    ease: "none",
    scrollTrigger: {
      trigger: ".testimonials",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".testimonials__col--fast", {
    x: 40,
    ease: "none",
    scrollTrigger: {
      trigger: ".testimonials",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  // Testimonial cards fade in
  gsap.from(".testimonial-card", {
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".testimonials",
      start: "top 75%",
    },
  });

  /* ═══════════════════════════════════════════════
     FAQ — Accordion logic
     ═══════════════════════════════════════════════ */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-item__trigger");
    const content = item.querySelector(".faq-item__content");

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Close all others
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          other
            .querySelector(".faq-item__trigger")
            .setAttribute("aria-expanded", "false");
          gsap.to(other.querySelector(".faq-item__content"), {
            maxHeight: 0,
            duration: 0.4,
            ease: "power2.inOut",
          });
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        gsap.to(content, {
          maxHeight: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
      } else {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        gsap.to(content, {
          maxHeight: content.scrollHeight + 20,
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    });
  });

  // FAQ section label/title fade in
  gsap.from(".faq .section-label, .faq .section-title", {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".faq",
      start: "top 80%",
    },
  });

  /* ═══════════════════════════════════════════════
     CTA BANNER — Entrance animation
     ═══════════════════════════════════════════════ */
  gsap.from(".cta-banner__title", {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".cta-banner",
      start: "top 80%",
    },
  });

  gsap.from(".cta-banner__subtitle", {
    y: 30,
    opacity: 0,
    duration: 0.6,
    delay: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".cta-banner",
      start: "top 80%",
    },
  });

  gsap.from(".cta-banner__actions", {
    y: 20,
    opacity: 0,
    duration: 0.5,
    delay: 0.3,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".cta-banner",
      start: "top 80%",
    },
  });

  /* ═══════════════════════════════════════════════
     SECTION LABELS & TITLES — Subtle entrance
     (for sections not already specifically animated)
     ═══════════════════════════════════════════════ */
  const sectionHeaders = [
    ".how-it-works .section-label",
    ".how-it-works .section-title",
    ".features .section-label",
    ".features .section-title",
    ".pricing .section-label",
    ".testimonials .section-label",
    ".testimonials .section-title",
  ];

  sectionHeaders.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      gsap.from(el, {
        y: 25,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        },
      });
    }
  });

  /* ═══════════════════════════════════════════════
     TERMINAL TYPING EFFECT (optional enhancement)
     ═══════════════════════════════════════════════ */
  // Stagger-reveal terminal lines for a typing-like effect
  gsap.from(".terminal__line", {
    opacity: 0,
    x: -10,
    duration: 0.3,
    stagger: 0.12,
    delay: 1.2, // after hero entrance
    ease: "power2.out",
  });
})();
