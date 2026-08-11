// 1. Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

// 2. Typewriter Effect
const words = ["Full Stack Developer", "Laravel Developer", "Problem Solver", "Web Developer"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.getElementById("typing-text");

function typeEffect() {
    if (!typingElement) return;

    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 60 : 120;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
}

document.addEventListener("DOMContentLoaded", typeEffect);

// 3. Project Filter Logic
function filterProjects(category, event) {
    const cards = document.querySelectorAll('.project-card');
    const buttons = document.querySelectorAll('.tab-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
// ==========================================
// 4. Project Image Slider / Modal Logic
// ==========================================

// Store project image arrays & captions
const projectGalleries = {
    'salon': [
        { src: 'images/dashboard.png', caption: 'Admin Dashboard Overview' },
        { src: 'images/appoinment.png', caption: 'Appointments Management' }, // Note: matching your spelling exactly
        { src: 'images/bookings.png', caption: 'Booking History & Logs' },
        { src: 'images/services.png', caption: 'Services & Packages Catalog' },
        { src: 'images/reports.png', caption: 'System Analytics & Reports' }
    ]
};

let currentGallery = '';
let currentSlideIndex = 0;

function openSlider(projectKey) {
    currentGallery = projectKey;
    currentSlideIndex = 0;
    
    const modal = document.getElementById('imageModal');
    if(modal) {
        modal.style.display = 'flex';
        updateModalContent();
    }
}

function closeSlider() {
    const modal = document.getElementById('imageModal');
    if(modal) {
        modal.style.display = 'none';
    }
}

function changeSlide(direction) {
    const images = projectGalleries[currentGallery];
    currentSlideIndex += direction;

    // Loop back to start or end
    if (currentSlideIndex >= images.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = images.length - 1;
    }
    
    updateModalContent();
}

function updateModalContent() {
    const imageObj = projectGalleries[currentGallery][currentSlideIndex];
    const totalSlides = projectGalleries[currentGallery].length;
    
    document.getElementById('modalImg').src = imageObj.src;
    document.getElementById('modalCaption').innerHTML = `<strong>${imageObj.caption}</strong> (${currentSlideIndex + 1} / ${totalSlides})`;
}

// Close modal if user clicks outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeSlider();
    }
}