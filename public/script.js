// Initialize Swagger UI
async function initSwagger() {
  try {
    // Fetch API documentation
    const response = await fetch("/api/docs")
    const swaggerDoc = await response.json()

    // Initialize Swagger UI
    const SwaggerUIBundle = window.SwaggerUIBundle
    const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset

    SwaggerUIBundle({
      url: "/api/docs",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: "StandaloneLayout",
      validatorUrl: null,
      tryItOutEnabled: true,
      requestInterceptor: (request) => {
        console.log("[API Request]", request)
        return request
      },
      responseInterceptor: (response) => {
        console.log("[API Response]", response)
        return response
      },
    })

    // Update stats
    updateStats(swaggerDoc)
  } catch (error) {
    console.error("Failed to initialize Swagger UI:", error)
    document.getElementById("swagger-ui").innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>❌ Gagal memuat dokumentasi API</h3>
                <p>Pastikan server berjalan di http://localhost:3000</p>
            </div>
        `
  }
}

// Update statistics
function updateStats(swaggerDoc) {
  const pathCount = Object.keys(swaggerDoc.paths || {}).length

  document.getElementById("endpointCount").textContent = pathCount

  // Fetch plugin count
  fetch("/api/plugins")
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        document.getElementById("pluginCount").textContent = data.count
      }
    })
    .catch((error) => {
      console.error("Failed to fetch plugin count:", error)
    })
}

// Animate numbers
function animateNumber(element, target) {
  const start = 0
  const duration = 1000
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const current = Math.floor(start + (target - start) * progress)

    element.textContent = current

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initSwagger()

  // Add loading animation to stat cards
  const statCards = document.querySelectorAll(".stat-card")
  statCards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"

    setTimeout(() => {
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 200)
  })
})

// Add some interactive features
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("stat-card")) {
    e.target.style.transform = "scale(0.95)"
    setTimeout(() => {
      e.target.style.transform = "translateY(-5px)"
    }, 150)
  }
})
