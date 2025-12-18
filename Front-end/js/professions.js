// Wait for full load so CSS transitions run consistently
window.addEventListener('load', () => {
    // ===== Fade-in sections =====
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'opacity 1s ease, transform 1s ease';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeInElements.forEach(el => observer.observe(el));

    // ===== Start Interview Buttons =====
    const startButtons = document.querySelectorAll('.start-btn-card');
    startButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const profession = btn.dataset.profession;
            if (profession) {
                window.location.href = `chat.html?profession=${encodeURIComponent(profession)}`;
            }
        });
    });

    // ===== Optional page-loaded class =====
    document.body.classList.add("page-loaded");
});

