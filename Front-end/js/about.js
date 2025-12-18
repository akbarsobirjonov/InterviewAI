// Select all sections with the fade-in class
const fadeInElements = document.querySelectorAll('.fade-in');

const options = {
    threshold: 0.1 // 10% of the section visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'opacity 1s ease, transform 1s ease';
            observer.unobserve(entry.target); // only animate once
        }
    });
}, options);

// Observe each fade-in element
fadeInElements.forEach(el => {
    observer.observe(el);
});

// Smooth scroll for navbar links
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

navLinks.forEach(link => {
    link.addEventListener('click', function(e){
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if(targetSection){
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const sections = document.querySelectorAll('section');
const navLi = document.querySelectorAll('.nav-links li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 60;
        if(scrollY >= sectionTop){
            current = section.getAttribute('id');
        }
    });

    navLi.forEach(li => {
        li.classList.remove('active');
        if(li.getAttribute('href').includes(current)){
            li.classList.add('active');
        }
    });
});

// Fade-in entire page on load
window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");
});

// === Start Interview Button Redirect ===
const startBtn = document.getElementById('startInterviewBtn');

if (startBtn) {
    startBtn.addEventListener('click', () => {
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes("/pages/"); // <-- correct check

        // Redirect to professions page
        const targetPath = isInPages ? "professions.html" : "pages/professions.html";

        window.location.href = targetPath;
    });
}
