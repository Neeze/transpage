function startTypewriter({ elementId, texts, speed = 50, pause = 1000 }) {
    const el = document.getElementById(elementId);
    let textIndex = 0;
    let i = 0;
    let forward = true;

    function typeLoop() {
    const currentText = texts[textIndex];

    if (forward) {
    if (i < currentText.length) {
    el.textContent += currentText.charAt(i);
    i++;
    setTimeout(typeLoop, speed);
} else {
    forward = false;
    setTimeout(typeLoop, pause);
}
} else {
    if (i > 0) {
    el.textContent = currentText.substring(0, i - 1);
    i--;
    setTimeout(typeLoop, speed);
} else {
    forward = true;
    textIndex = (textIndex + 1) % texts.length;
    setTimeout(typeLoop, pause);
}
}
}

    typeLoop();
}

    // 🔹 Gọi hàm
    startTypewriter({
    elementId: "typewriter",
    texts: [
    "Xóa nhòa ranh giới ngôn ngữ – truyền tải thông điệp của bạn đến toàn cầu.",
    "Breaking language barriers – delivering your message to the world."
    ],
    speed: 25,
    pause: 500
});

    /* ===== GSAP Orchestrator (optimized + slower) ===== */
    (function () {
    // Respect user preference
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
    document.querySelectorAll('.will-animate').forEach(el => {
    el.style.opacity = 1; el.style.transform = "none";
});
    return;
}

    // Register once + sensible defaults (slower pace)
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({
    duration: 1.1,      // slower base
    ease: "power2.out"  // softer ease
});

    /* ---------- Block A: Upload section (upload-text / upload-image / side images) ---------- */
    const uploadScope = document.querySelector(".upload-text") || document;
    if (uploadScope) {
    gsap.from(".upload-text h2", {
    scrollTrigger: { trigger: ".upload-text h2", start: "top 80%", once: true },
    y: 60, opacity: 0, duration: 1.2
});

    gsap.from(".upload-text p", {
    scrollTrigger: { trigger: ".upload-text p", start: "top 80%", once: true },
    y: 36, opacity: 0, duration: 1.2, delay: 0.15
});

    gsap.from(".upload-image img", {
    scrollTrigger: { trigger: ".upload-image img", start: "top 80%", once: true },
    scale: 0.82, opacity: 0, duration: 1.4, ease: "back.out(1.4)"
});

    gsap.from(".img-left img", {
    scrollTrigger: { trigger: ".img-left img", start: "top 85%", once: true },
    x: -120, opacity: 0, duration: 1.1
});

    gsap.from(".img-right img", {
    scrollTrigger: { trigger: ".img-right img", start: "top 85%", once: true },
    x: 120, opacity: 0, duration: 1.1
});
}

    /* ---------- Block B: Feature section (.section-4) ---------- */
    const sec4 = document.querySelector(".section-4");
    if (sec4) {
    const tl = gsap.timeline({
    scrollTrigger: { trigger: ".section-4", start: "top 72%", end: "bottom 30%", once: true }
});

    tl.from(".section4-hero", { y: 48, opacity: 0, duration: 1.1, ease: "power3.out" }, 0)
    .from(".section4-title", { y: 28, opacity: 0, duration: 1.0 }, 0.15);

    gsap.set(".section4-hr", { transformOrigin: "0% 50%", scaleX: 0, opacity: 0.4 });
    tl.to(".section4-hr", { scaleX: 1, opacity: 1, duration: 0.8 }, 0.35);

    gsap.utils.toArray(".section-4 .feature-item").forEach((item) => {
    const icon = item.querySelector(".feature-icon");
    const text = item.querySelector(".feature-text");

    const rowTl = gsap.timeline({
    scrollTrigger: { trigger: item, start: "top 82%", once: true }
});

    if (icon) rowTl.from(icon, { y: 18, scale: 0.86, opacity: 0, duration: 0.65, ease: "back.out(1.4)" });
    if (text) rowTl.from(text, { y: 16, opacity: 0, duration: 0.75 }, "-=0.25");
});

    // Micro-hover CTA
    document.querySelectorAll(".section-4 a").forEach((a) => {
    a.addEventListener("mouseenter", () => gsap.to(a, { x: 2, duration: 0.2 }));
    a.addEventListener("mouseleave", () => gsap.to(a, { x: 0, duration: 0.25 }));
});
}

    /* ---------- Block C: Purple section (#8f64fb) with cards ---------- */
    const secPurple = document.querySelector('section[style*="#8f64fb"]') || document.querySelector('.mt-40');
    if (secPurple) {
    const tlHead = gsap.timeline({
    scrollTrigger: { trigger: secPurple, start: "top 75%", once: true }
});

    tlHead
    .from(".js-sec-title", { y: 28, opacity: 0, duration: 1.0 })
    .from(".js-sec-desc",  { y: 22, opacity: 0, duration: 1.0 }, "-=0.35");

    gsap.from(".js-card", {
    scrollTrigger: { trigger: ".js-card-grid", start: "top 75%", once: true },
    y: 36, opacity: 0, duration: 0.95, ease: "power3.out", stagger: 0.15
});

    gsap.utils.toArray(".js-card").forEach((card) => {
    const icon = card.querySelector(".js-card-icon");
    const title = card.querySelector(".js-card-title");
    const desc  = card.querySelector(".js-card-desc");
    const cta   = card.querySelector(".js-card-cta");

    const rowTl = gsap.timeline({
    scrollTrigger: { trigger: card, start: "top 80%", once: true }
});

    if (icon)  rowTl.from(icon,  { scale: 0.84, y: 14, opacity: 0, duration: 0.6, ease: "back.out(1.35)" });
    if (title) rowTl.from(title, { y: 18, opacity: 0, duration: 0.7 }, "-=0.2");
    if (desc)  rowTl.from(desc,  { y: 14, opacity: 0, duration: 0.7 }, "-=0.25");
    if (cta)   rowTl.from(cta,   { y: 10, opacity: 0, duration: 0.6 }, "-=0.25");
});

    document.querySelectorAll(".js-cta-link").forEach((a) => {
    a.addEventListener("mouseenter", () => gsap.to(a, { x: 2, duration: 0.2 }));
    a.addEventListener("mouseleave", () => gsap.to(a, { x: 0, duration: 0.25 }));
});
}
})();