document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const overlay = document.querySelector(".mobile-menu-overlay");
  const links = document.querySelectorAll(".mobile-nav a");

  function toggleMenu() {
    const isActive = toggleBtn.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.style.overflow = isActive ? "hidden" : "";
    toggleBtn.setAttribute("aria-expanded", isActive);
  }

  toggleBtn.addEventListener("click", toggleMenu);

  links.forEach((link) => {
    link.addEventListener("click", toggleMenu);

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
  const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
  const mobileSubmenu = document.querySelector(".mobile-nav-submenu");

  if (mobileDropdownToggle && mobileSubmenu) {
    mobileDropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent any parent handlers
      const isExpanded = mobileDropdownToggle.getAttribute("aria-expanded") === "true";
      mobileDropdownToggle.setAttribute("aria-expanded", !isExpanded);
      mobileSubmenu.classList.toggle("expanded");

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
  }

  // Reviews Slider
  const slides = document.querySelectorAll(".review-slide");
  const dots = document.querySelectorAll(".review-dot");
  let currentSlide = 0;
  let isPaused = false;
  let progress = 0;
  const duration = 10000; // 10s per review
  let lastTime = null;

  if (slides.length > 0) {
    function goToSlide(index) {
      slides[currentSlide].classList.remove("active");
      dots[currentSlide].classList.remove("active");
      dots[currentSlide].style.setProperty("--progress-scale", "0");

      currentSlide = index;

      slides[currentSlide].classList.add("active");
      dots[currentSlide].classList.add("active");
      progress = 0;
    }

    function nextSlide() {
      let next = (currentSlide + 1) % slides.length;
      goToSlide(next);
    }

    function animate(currentTime) {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused) {
        progress += deltaTime / duration;
        if (progress >= 1) {
          nextSlide();
        } else {
          dots[currentSlide].style.setProperty("--progress-scale", progress);
        }
      }
      requestAnimationFrame(animate);
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToSlide(index);

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
    const reviewsContainer = document.querySelector(".reviews-container");
    reviewsContainer.addEventListener("mouseenter", () => (isPaused = true));
    reviewsContainer.addEventListener("mouseleave", () => {
      isPaused = false;
      lastTime = null;

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
    requestAnimationFrame(animate);
  }

  // On-Scroll Animations Setting
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // optional: only animate once
      }

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
  }, observerOptions);

  document.querySelectorAll(".reveal-on-scroll").forEach((element) => {
    observer.observe(element);

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
  // Floating Mobile Button Logic
  const floatingBtn = document.querySelector(".floating-book-btn");
  if (floatingBtn) {
    let lastScrollY = window.scrollY;

    // Gracefully fade in the button slightly after initial load
    setTimeout(() => {
      floatingBtn.classList.add("is-visible");
    }, 1200);

    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;

        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
          floatingBtn.classList.add("is-hidden");
        } else {
          floatingBtn.classList.remove("is-hidden");
        }

        lastScrollY = currentScrollY;
      },
      { passive: true },
    );
  }

  // Auto-update footer year
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => { el.textContent = currentYear; });
  }
});
