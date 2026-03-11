(function () {
  const grid = document.getElementById("catalogGrid");
  const countLabel = document.getElementById("resultsCount");
  const emptyState = document.getElementById("emptyState");

  if (!grid || !countLabel || !emptyState) return;

  const controls = {
    search: document.getElementById("searchInput"),
    category: document.getElementById("categoryFilter"),
    series: document.getElementById("seriesFilter"),
    media: document.getElementById("mediaFilter"),
    type: document.getElementById("typeFilter"),
    sort: document.getElementById("sortSelect"),
    reset: document.getElementById("resetFilters")
  };

  let products = [];

  const normalize = (value) => (value || "").toString().trim().toLowerCase();
  const isPlaceholderValue = (value) => {
    const token = normalize(value);
    return token === "not specified" || token === "unspecified" || token === "n/a" || token === "na";
  };
  const isMeaningful = (value) => !!value && !isPlaceholderValue(value);

  function firstNonEmpty(...values) {
    return values.find((value) => value && value.toString().trim() && !isPlaceholderValue(value)) || "";
  }

  function extractMicronFromText(...chunks) {
    const joined = chunks.filter(Boolean).join(" ");
    const match = joined.match(/(\d+(\.\d+)?)\s*micron/i);
    return match ? `${match[1]} micron` : "";
  }

  function extractMediaFromHighlights(highlights = []) {
    const knownMedia = [
      "Polypropylene",
      "PTFE",
      "Nylon",
      "Cellulose",
      "Microglass",
      "Stainless Steel",
      "Glass Fiber",
      "Polyester",
      "Carbon"
    ];

    const joined = highlights.join(" ");
    const found = knownMedia.find((media) => new RegExp(media, "i").test(joined));
    return found || "";
  }

  function normalizeProduct(product, categoryContext) {
    const highlights = Array.isArray(product.highlights) ? product.highlights : [];
    const explicitApps = Array.isArray(product.applications)
      ? product.applications.filter(isMeaningful)
      : [];
    const derivedMicron = extractMicronFromText(product.summary, product.description, ...highlights);
    const normalizedSpecs = Array.isArray(product.keySpecs)
      ? product.keySpecs.filter(isMeaningful)
      : highlights.filter(isMeaningful);

    return {
      id: firstNonEmpty(product.id, product.slug, `${categoryContext}-${product.title || product.name}`),
      name: firstNonEmpty(product.name, product.title, "Unnamed Product"),
      series: firstNonEmpty(product.series, product.model, product.type),
      description: firstNonEmpty(product.description, product.summary, "No description available."),
      category: firstNonEmpty(product.category, categoryContext, "Uncategorized"),
      filterType: firstNonEmpty(product.filterType, product.type),
      micronRating: firstNonEmpty(product.micronRating, product.micron, product.rating, derivedMicron),
      media: firstNonEmpty(product.media, product.material, extractMediaFromHighlights(highlights)),
      keySpecs: normalizedSpecs,
      applications: explicitApps.length ? explicitApps : firstNonEmpty(categoryContext) ? [categoryContext] : [],
      specSheet:
        typeof product.specSheet === "string" && product.specSheet.trim()
          ? product.specSheet.trim()
          : typeof product.slug === "string" && /\.pdf($|\?)/i.test(product.slug)
            ? product.slug
            : ""
    };
  }

  function normalizeCatalogPayload(payload) {
    if (Array.isArray(payload.products)) {
      return payload.products.map((product) => normalizeProduct(product, product.category || ""));
    }

    if (Array.isArray(payload.catalogCategories)) {
      return payload.catalogCategories.flatMap((category) => {
        const items = Array.isArray(category.products) ? category.products : [];
        return items.map((product) => normalizeProduct(product, category.title || category.id || ""));
      });
    }

    return [];
  }

  function setOptions(select, values) {
    if (!select) return;
    const sorted = [...values].sort((a, b) => a.localeCompare(b));
    select.innerHTML = `<option value="">All</option>${sorted
      .map((value) => `<option value="${value}">${value}</option>`)
      .join("")}`;
  }

  function configureFilter(select, values) {
    if (!select) return;
    const cleanValues = [...values].filter(isMeaningful);
    setOptions(select, new Set(cleanValues));
    const meaningfulCount = [...new Set(cleanValues.filter(isMeaningful))].length;
    select.disabled = meaningfulCount === 0;
  }

  function compileSearchText(product) {
    return [
      product.name,
      product.series,
      product.category,
      product.description,
      product.filterType,
      product.media,
      ...(product.applications || []),
      ...(product.keySpecs || [])
    ]
      .join(" ")
      .toLowerCase();
  }

  function matchesSelect(controlValue, fieldValue) {
    if (!controlValue) return true;
    if (Array.isArray(fieldValue)) {
      return fieldValue.map(normalize).includes(normalize(controlValue));
    }
    return normalize(fieldValue) === normalize(controlValue);
  }

  function sortProducts(data, mode) {
    const sorted = [...data];
    if (mode === "category") {
      sorted.sort((a, b) => `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`));
      return sorted;
    }
    if (mode === "application") {
      sorted.sort((a, b) => {
        const aKey = (a.applications && a.applications[0]) || "";
        const bKey = (b.applications && b.applications[0]) || "";
        return `${aKey} ${a.name}`.localeCompare(`${bKey} ${b.name}`);
      });
      return sorted;
    }
    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }

  function renderProducts(data) {
    if (data.length === 0) {
      grid.innerHTML = "";
      emptyState.classList.remove("d-none");
      countLabel.textContent = "0 products found";
      return;
    }

    emptyState.classList.add("d-none");
    countLabel.textContent = `${data.length} product${data.length === 1 ? "" : "s"} found`;

    grid.innerHTML = data
      .map(
        (product) => {
          const badges = [product.category, product.filterType, product.micronRating, product.media]
            .filter(isMeaningful)
            .map((value) => `<span class="badge rounded-pill">${value}</span>`)
            .join("");

          const seriesLine = isMeaningful(product.series)
            ? `<p class="text-body-secondary mb-2">Series/Model: ${product.series}</p>`
            : "";

          const specsBlock =
            Array.isArray(product.keySpecs) && product.keySpecs.length
              ? `
                <h3 class="h6">Key Specifications</h3>
                <ul class="key-specs">
                  ${product.keySpecs.map((spec) => `<li>${spec}</li>`).join("")}
                </ul>
              `
              : "";

          const applicationsBlock =
            Array.isArray(product.applications) && product.applications.length
              ? `
                <h3 class="h6 mt-3">Typical Applications</h3>
                <p class="mb-3">${product.applications.join(", ")}</p>
              `
              : '<div class="mb-3"></div>';

          return `
          <div class="col-md-6 col-xl-4 reveal reveal-visible">
            <article class="card product-card">
              <div class="card-body">
                <h2 class="h5 mb-1">${product.name}</h2>
                ${seriesLine}
                <p>${product.description}</p>

                <div class="product-meta">
                  ${badges}
                </div>

                ${specsBlock}
                ${applicationsBlock}

                <div class="mt-auto d-flex gap-2 flex-wrap">
                  <a href="contact.html#quote" class="btn btn-sm btn-primary">Request Quote</a>
                  ${
                    product.specSheet
                      ? `<a href="${product.specSheet}" class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener">Spec Sheet</a>`
                      : ""
                  }
                </div>
              </div>
            </article>
          </div>
        `;
        }
      )
      .join("");
  }

  function applyFilters() {
    const searchTerm = normalize(controls.search.value);

    const filtered = products.filter((product) => {
      const searchOk = !searchTerm || compileSearchText(product).includes(searchTerm);
      const categoryOk = matchesSelect(controls.category.value, product.category);
      const seriesOk = matchesSelect(controls.series.value, product.series);
      const mediaOk = matchesSelect(controls.media.value, product.media);
      const typeOk = matchesSelect(controls.type.value, product.filterType);

      return searchOk && categoryOk && seriesOk && mediaOk && typeOk;
    });

    const sorted = sortProducts(filtered, controls.sort.value);
    renderProducts(sorted);
  }

  function bindEvents() {
    Object.values(controls).forEach((control) => {
      if (!control || control === controls.reset) return;
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    controls.reset.addEventListener("click", () => {
      controls.search.value = "";
      controls.category.value = "";
      controls.series.value = "";
      controls.media.value = "";
      controls.type.value = "";
      controls.sort.value = "az";
      applyFilters();
    });
  }

  function initializeFilters() {
    configureFilter(
      controls.category,
      products.map((p) => p.category)
    );
    configureFilter(
      controls.series,
      products.map((p) => p.series)
    );
    configureFilter(
      controls.media,
      products.map((p) => p.media)
    );
    configureFilter(
      controls.type,
      products.map((p) => p.filterType)
    );
  }

  async function loadCatalog() {
    try {
      const response = await fetch("data/catalog.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load catalog (status ${response.status})`);
      }

      const payload = await response.json();
      products = normalizeCatalogPayload(payload);

      if (products.length === 0) {
        throw new Error("Catalog payload parsed successfully but contained no products");
      }

      initializeFilters();
      bindEvents();
      applyFilters();
    } catch (error) {
      countLabel.textContent = "Unable to load catalog data";
      grid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            Catalog data could not be loaded. Run a local web server and ensure <code>data/catalog.json</code> exists.
          </div>
        </div>
      `;
      console.error(error);
    }
  }

  loadCatalog();
})();
