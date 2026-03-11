(function () {
  const page = document.body.dataset.page;

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <nav class="navbar navbar-expand-lg" aria-label="Primary navigation">
        <div class="container">
          <a class="navbar-brand" href="index.html" aria-label="IPPS Home">
            <img src="assets/images/logo-white.png" alt="IPPS logo" class="brand-logo-nav" />
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav ms-auto gap-lg-2">
              <li class="nav-item"><a class="nav-link ${page === "home" ? "active" : ""}" href="index.html">Home</a></li>
              <li class="nav-item"><a class="nav-link ${page === "catalog" ? "active" : ""}" href="catalog.html">Catalog</a></li>
              <li class="nav-item"><a class="nav-link ${page === "contact" ? "active" : ""}" href="contact.html">Contact / Quote</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="row g-4">
          <div class="col-md-5 col-lg-4">
            <a class="footer-brand-link" href="index.html" aria-label="IPPS Home">
              <img src="assets/images/logo-white.png" alt="IPPS logo" class="brand-logo-footer" />
            </a>
            <p class="mb-2">Industrial filter distribution for industrial and commercial buyers.</p>
            <p class="mb-1"><strong>Location:</strong> Puerto Rico</p>
            <p class="mb-0"><strong>Service Area:</strong> All of the Caribbean</p>
          </div>
          <div class="col-md-3 col-lg-3">
            <h3 class="h6">Quick Links</h3>
            <ul class="footer-list">
              <li><a href="index.html">Home</a></li>
              <li><a href="catalog.html">Catalog</a></li>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="contact.html#quote">Get a Quote</a></li>
            </ul>
          </div>
          <div class="col-md-4 col-lg-5">
            <h3 class="h6">Contact</h3>
            <ul class="footer-list">
              <li>Email: <a href="mailto:ippspr@gmail.com">ippspr@gmail.com</a></li>
              <li>Phone: <a href="tel:+17879513939">+1 (787) 951-3939</a></li>
              <li>Hours: Mon-Fri, 8:00 AM-5:00 PM AST</li>
            </ul>
          </div>
        </div>
        <hr class="border-secondary-subtle my-4" />
        <p class="small mb-0">© ${new Date().getFullYear()} IPPS. All rights reserved.</p>
      </div>
    `;
  }

  let backToTopButton = document.getElementById("backToTopButton");
  if (!backToTopButton) {
    backToTopButton = document.createElement("button");
    backToTopButton.id = "backToTopButton";
    backToTopButton.type = "button";
    backToTopButton.className = "back-to-top";
    backToTopButton.setAttribute("aria-label", "Back to top");
    backToTopButton.textContent = "↑";
    document.body.appendChild(backToTopButton);
  }

  const toggleBackToTop = () => {
    if (window.scrollY > 240) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  };

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => observer.observe(element));
  }
})();
