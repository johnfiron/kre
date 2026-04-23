"use strict";

(function initializeSite() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navList = document.querySelector("[data-nav-list]");

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const allForms = document.querySelectorAll("[data-lead-form]");
  allForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const statusEl = form.querySelector("[data-form-status]");
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.setAttribute("aria-invalid", "true");
        } else {
          field.removeAttribute("aria-invalid");
        }
      });

      if (!isValid) {
        if (statusEl) {
          statusEl.textContent = "Please complete the required fields.";
          statusEl.style.color = "#b71c1c";
        }
        return;
      }

      const leadData = {
        form: form.getAttribute("data-form-name") || "General Inquiry",
        submittedAt: new Date().toISOString(),
      };

      const formData = new FormData(form);
      formData.forEach((value, key) => {
        leadData[key] = String(value).trim();
      });

      const existing = JSON.parse(localStorage.getItem("siteLeads") || "[]");
      existing.push(leadData);
      localStorage.setItem("siteLeads", JSON.stringify(existing));

      form.reset();
      if (statusEl) {
        statusEl.textContent =
          "Thanks! Your request was saved and our team will follow up promptly.";
        statusEl.style.color = "#1f7a45";
      }
    });
  });
})();
