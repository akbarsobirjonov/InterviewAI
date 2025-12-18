document.addEventListener("DOMContentLoaded", () => {
    const isInPages = window.location.pathname.includes("/pages/");
    
    const goTo = (page) => {
        if (page === "home") {
            window.location.href = isInPages ? "../index.html" : "index.html";
        }
        if (page === "professions") {
            window.location.href = isInPages ? "professions.html" : "pages/professions.html";
        }
        if (page === "about") {
            window.location.href = isInPages ? "about.html" : "pages/about.html";
        }
    };

    document.querySelectorAll("[data-link]").forEach(el => {
        el.addEventListener("click", () => goTo(el.dataset.link));
    });

    // Auto-active highlight
    const path = window.location.pathname;

    document.querySelectorAll("[data-link]").forEach(el => {
        const p = el.dataset.link;

        if (p === "home" && path.endsWith("index.html")) el.classList.add("active");
        if (p === "professions" && path.includes("professions.html")) el.classList.add("active");
        if (p === "about" && path.includes("about.html")) el.classList.add("active");
    });
});
