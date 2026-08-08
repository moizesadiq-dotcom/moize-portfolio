// ===============================
// MOBILE MENU
// ===============================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    if (menuBtn.innerHTML.includes("bars")) {
        menuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

// ===============================
// CLOSE MENU ON LINK CLICK
// ===============================

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';

    });

});

// ===============================
// STICKY HEADER
// ===============================

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.background = "rgba(8,17,31,.95)";

        header.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";

    } else {

        header.style.background = "rgba(8,17,31,.65)";

        header.style.boxShadow = "none";

    }

});

// ===============================
// BACK TO TOP
// ===============================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        topBtn.style.opacity = "1";

        topBtn.style.visibility = "visible";

    } else {

        topBtn.style.opacity = "0";

        topBtn.style.visibility = "hidden";

    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});
// ========================// ======================================
// TYPING EFFECT
// ======================================

const typingElement = document.querySelector(".hero-content h2");

const roles = [
    "Full Stack Web Developer",
    "Laravel Developer",
    "Frontend Developer",
    "Problem Solver"
];

let roleIndex = 0;
let letterIndex = 0;
let isDeleting = false;

function typingAnimation() {

    const currentRole = roles[roleIndex];

    if (!isDeleting) {

        typingElement.textContent = currentRole.substring(0, letterIndex);
        letterIndex++;

        if (letterIndex > currentRole.length) {
            isDeleting = true;
            setTimeout(typingAnimation, 1500);
            return;
        }

    } else {

        typingElement.textContent = currentRole.substring(0, letterIndex);
        letterIndex--;

        if (letterIndex < 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            letterIndex = 0;
        }

    }

    setTimeout(typingAnimation, isDeleting ? 50 : 100);

}

typingAnimation();

// ======================================
// SCROLL REVEAL
// ======================================

const revealElements = document.querySelectorAll(

".hero-content,.hero-image,.about-wrapper,.skill-card,.service-box,.project-card,.contact-wrapper"

);

function reveal() {

    revealElements.forEach(element => {

        const windowHeight = window.innerHeight;

        const revealTop = element.getBoundingClientRect().top;

        if (revealTop < windowHeight - 120) {

            element.classList.add("show");

        }

    });

}

window.addEventListener("scroll", reveal);

reveal();

// ======================================
// CURRENT YEAR
// ======================================

const copyright = document.querySelector(".copyright");

if(copyright){

copyright.innerHTML =
`© ${new Date().getFullYear()} Abdul Moize. All Rights Reserved.`;

}
// ======================================
// PRELOADER
// ======================================

window.addEventListener("load", () => {

    const loader = document.querySelector(".loader");

    if (loader) {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

        loader.style.transition = "0.6s";

    }

});

// ======================================
// PARALLAX EFFECT
// ======================================

const heroImage = document.querySelector(".hero-image");

window.addEventListener("mousemove", (e) => {

    if (!heroImage) return;

    const x = (window.innerWidth / 2 - e.clientX) / 35;
    const y = (window.innerHeight / 2 - e.clientY) / 35;

    heroImage.style.transform =
        `translate(${x}px, ${y}px)`;

});

// ======================================
// SCROLL PROGRESS BAR
// ======================================

const progressBar = document.createElement("div");

progressBar.className = "progress-bar";

document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {

    const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const progress =
        (window.scrollY / totalHeight) * 100;

    progressBar.style.width = progress + "%";

});

// ======================================
// BUTTON RIPPLE EFFECT
// ======================================

const buttons = document.querySelectorAll(".btn");

buttons.forEach(button => {

    button.addEventListener("click", function (e) {

        const ripple = document.createElement("span");

        ripple.className = "ripple";

        const rect = this.getBoundingClientRect();

        ripple.style.left = (e.clientX - rect.left) + "px";
        ripple.style.top = (e.clientY - rect.top) + "px";

        this.appendChild(ripple);

        setTimeout(() => {

            ripple.remove();

        }, 600);

    });

});

// ======================================
// CONSOLE MESSAGE
// ======================================

console.log("%cWelcome 👋", "font-size:28px;color:#3b82f6;font-weight:bold;");
console.log("%cPortfolio developed by Abdul Moize", "font-size:16px;color:#ffffff;");
console.log("%cThanks for visiting.", "color:#60a5fa;");

/* ================= PROJECT IMAGE SLIDER ================= */

let slideIndex = 0;

const slides = document.querySelector(".slides");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {

    if (index >= 3) {
        slideIndex = 0;
    }

    if (index < 0) {
        slideIndex = 2;
    }

    slides.style.transform = `translateX(-${slideIndex * 100}%)`;

    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    dots[slideIndex].classList.add("active");
}

function changeSlide(direction) {
    slideIndex += direction;
    showSlide(slideIndex);
}

function currentSlide(index) {
    slideIndex = index;
    showSlide(slideIndex);
}

/* Automatic Slider */

setInterval(() => {
    slideIndex++;
    showSlide(slideIndex);
}, 4000);