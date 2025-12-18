// === Smooth Scrolling for Nav Links ===
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 60,
                behavior: 'smooth'
            });
        }
    });
});


// === Add Fade-in on Scroll ===
const revealElements = document.querySelectorAll('.feature-card, .hero-text, .hero-img');

const revealOnScroll = () => {
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            el.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


// === Button Animation on Hover ===
document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.classList.add('hovered');
    });
    btn.addEventListener('mouseleave', () => {
        btn.classList.remove('hovered');
    });
});

// === Start Interview Button Redirect (Home Page) ===
const startBtn = document.getElementById('startInterviewBtn');
if(startBtn) {
    startBtn.addEventListener('click', () => {
        window.location.href = './pages/professions.html';
    });
}

// === Fade-in entire page on load ===
window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");
});
