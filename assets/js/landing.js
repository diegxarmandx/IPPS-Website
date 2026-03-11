(function () {
  const carouselRoot = document.getElementById("landing-carousel");

  const fallbackClients = [
    {
      name: "Client Company 01",
      industry: "Pharmaceutical Manufacturing",
      location: "Puerto Rico",
      logo: "assets/images/client-01.svg"
    },
    {
      name: "Client Company 02",
      industry: "Food & Beverage Processing",
      location: "Caribbean",
      logo: "assets/images/client-02.svg"
    },
    {
      name: "Client Company 03",
      industry: "Chemical Processing",
      location: "Caribbean",
      logo: "assets/images/client-03.svg"
    },
    {
      name: "Client Company 04",
      industry: "Biotech Operations",
      location: "Puerto Rico",
      logo: "assets/images/client-04.svg"
    },
    {
      name: "Client Company 05",
      industry: "Electronics Manufacturing",
      location: "Caribbean",
      logo: "assets/images/client-05.svg"
    },
    {
      name: "Client Company 06",
      industry: "Industrial Processing",
      location: "Puerto Rico",
      logo: "assets/images/client-06.svg"
    },
    {
      name: "Client Company 07",
      industry: "Water Treatment",
      location: "Caribbean",
      logo: "assets/images/client-07.svg"
    },
    {
      name: "Client Company 08",
      industry: "Cosmetics Manufacturing",
      location: "Puerto Rico",
      logo: "assets/images/client-08.svg"
    }
  ];

  function renderClientCarousel(clients) {
    if (!carouselRoot || !clients.length) return;

    const indicators = clients
      .map(
        (_, idx) => `
          <button type="button" data-bs-target="#landing-carousel" data-bs-slide-to="${idx}" ${
            idx === 0 ? 'class="active" aria-current="true"' : ""
          } aria-label="Slide ${idx + 1}"></button>
        `
      )
      .join("");

    const items = clients
      .map(
        (client, idx) => `
          <div class="carousel-item ${idx === 0 ? "active" : ""}">
            <div class="carousel-frame">
              <div class="client-carousel-slide">
                ${
                  client.logo
                    ? `<img src="${client.logo}" alt="${client.name} logo" class="client-logo" ${idx === 0 ? "" : 'loading="lazy"'} />`
                    : ""
                }
                <p class="client-tag">Client Partnership</p>
                <h3 class="h4 mb-2">${client.name}</h3>
                <p class="client-meta mb-0">${client.industry} · ${client.location}</p>
              </div>
            </div>
          </div>
        `
      )
      .join("");

    carouselRoot.innerHTML = `
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${items}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#landing-carousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#landing-carousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    `;

    if (window.bootstrap && window.bootstrap.Carousel) {
      const existing = window.bootstrap.Carousel.getInstance(carouselRoot);
      if (existing) existing.dispose();

      window.bootstrap.Carousel.getOrCreateInstance(carouselRoot, {
        interval: 4500,
        ride: "carousel",
        pause: false,
        touch: true,
        wrap: true
      });
    }
  }

  async function renderClients() {
    try {
      const response = await fetch("data/clients.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Clients load failed");
      const payload = await response.json();
      const companies = Array.isArray(payload.companies) ? payload.companies : [];
      renderClientCarousel(companies.length ? companies : fallbackClients);
    } catch (error) {
      console.error(error);
      renderClientCarousel(fallbackClients);
    }
  }

  renderClients();
})();
