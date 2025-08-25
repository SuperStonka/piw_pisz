// Accessibility Features Implementation
document.addEventListener("DOMContentLoaded", () => {
  // Font size controls
  const fontDecrease = document.getElementById("font-decrease")
  const fontNormal = document.getElementById("font-normal")
  const fontIncrease = document.getElementById("font-increase")

  // High contrast toggle
  const contrastToggle = document.getElementById("contrast-toggle")

  // Text version toggle
  const textVersion = document.getElementById("text-version")

  // Load saved preferences
  loadAccessibilityPreferences()

  // Font size controls
  fontDecrease?.addEventListener("click", () => {
    setFontSize("small")
  })

  fontNormal?.addEventListener("click", () => {
    setFontSize("normal")
  })

  fontIncrease?.addEventListener("click", () => {
    setFontSize("large")
  })

  // High contrast toggle
  contrastToggle?.addEventListener("click", () => {
    toggleHighContrast()
  })

  // Text version toggle
  textVersion?.addEventListener("click", () => {
    toggleTextOnly()
  })

  // Keyboard navigation enhancement
  document.addEventListener("keydown", (e) => {
    // Skip to main content with Alt+M
    if (e.altKey && e.key === "m") {
      e.preventDefault()
      document.getElementById("main-content")?.focus()
    }

    // Toggle high contrast with Alt+C
    if (e.altKey && e.key === "c") {
      e.preventDefault()
      toggleHighContrast()
    }
  })

  function setFontSize(size) {
    document.body.classList.remove("font-small", "font-large")

    if (size === "small") {
      document.body.classList.add("font-small")
    } else if (size === "large") {
      document.body.classList.add("font-large")
    }

    localStorage.setItem("fontSize", size)
    announceToScreenReader(
      `Rozmiar czcionki zmieniony na ${size === "small" ? "mały" : size === "large" ? "duży" : "normalny"}`,
    )
  }

  function toggleHighContrast() {
    document.body.classList.toggle("high-contrast")
    const isHighContrast = document.body.classList.contains("high-contrast")

    localStorage.setItem("highContrast", isHighContrast)
    announceToScreenReader(`Tryb wysokiego kontrastu ${isHighContrast ? "włączony" : "wyłączony"}`)

    // Update button text
    if (contrastToggle) {
      contrastToggle.innerHTML = `<span class="icon">🎨</span> ${isHighContrast ? "Wyłącz kontrast" : "Wersja kontrastowa"}`
    }
  }

  function toggleTextOnly() {
    document.body.classList.toggle("text-only")
    const isTextOnly = document.body.classList.contains("text-only")

    localStorage.setItem("textOnly", isTextOnly)
    announceToScreenReader(`Wersja tekstowa ${isTextOnly ? "włączona" : "wyłączona"}`)

    // Update button text
    if (textVersion) {
      textVersion.innerHTML = `<span class="icon">📄</span> ${isTextOnly ? "Wersja graficzna" : "Wersja tekstowa"}`
    }
  }

  function loadAccessibilityPreferences() {
    // Load font size
    const savedFontSize = localStorage.getItem("fontSize")
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }

    // Load high contrast
    const savedHighContrast = localStorage.getItem("highContrast") === "true"
    if (savedHighContrast) {
      document.body.classList.add("high-contrast")
      if (contrastToggle) {
        contrastToggle.innerHTML = '<span class="icon">🎨</span> Wyłącz kontrast'
      }
    }

    // Load text only
    const savedTextOnly = localStorage.getItem("textOnly") === "true"
    if (savedTextOnly) {
      document.body.classList.add("text-only")
      if (textVersion) {
        textVersion.innerHTML = '<span class="icon">📄</span> Wersja graficzna'
      }
    }
  }

  function announceToScreenReader(message) {
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Add screen reader only class
  const style = document.createElement("style")
  style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `
  document.head.appendChild(style)
})
