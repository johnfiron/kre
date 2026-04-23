"use strict";

(function initializeSite() {
  const formRecipient = document.body.dataset.formRecipient || "info@kelleypros.com";

  initializeNav();
  initializeCenteredScrolling();
  initializeForms(formRecipient);
  initializeChatbot();
})();

function initializeNav() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navList = document.querySelector("[data-nav-list]");

  if (!navToggle || !navList) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function initializeCenteredScrolling() {
  const centerByHash = (hash, pushHash = true) => {
    if (!hash || !hash.startsWith("#")) {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const viewportCenter = window.innerHeight / 2;
    const desiredTop = Math.max(0, absoluteTop - viewportCenter + rect.height / 2);

    window.scrollTo({
      top: desiredTop,
      behavior: "smooth",
    });

    target.classList.add("scroll-focus");
    setTimeout(() => target.classList.remove("scroll-focus"), 900);

    if (pushHash) {
      history.replaceState(null, "", hash);
    }
  };

  document.querySelectorAll("a[data-scroll-center]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const parsed = new URL(link.href, window.location.href);
      const samePage = parsed.pathname === window.location.pathname;

      if (samePage && parsed.hash) {
        event.preventDefault();
        centerByHash(parsed.hash);
      }
    });
  });

  if (window.location.hash) {
    requestAnimationFrame(() => {
      setTimeout(() => centerByHash(window.location.hash, false), 120);
    });
  }
}

function initializeForms(formRecipient) {
  const allForms = document.querySelectorAll("[data-lead-form]");

  allForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const statusEl = form.querySelector("[data-form-status]");
      const submitButton = form.querySelector("button[type='submit']");
      const requiredFields = form.querySelectorAll("[required]");
      const formName = form.getAttribute("data-form-name") || "General Inquiry";
      const templateType = form.getAttribute("data-confirm-email-template") || "general";
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
        updateStatus(
          statusEl,
          "Please complete the required fields before submitting.",
          "error"
        );
        return;
      }

      const leadData = {
        form: formName,
        submittedAt: new Date().toISOString(),
      };

      const formData = new FormData(form);
      formData.forEach((value, key) => {
        leadData[key] = String(value).trim();
      });

      cacheLead(leadData);

      const confirmationMessage = buildConfirmationMessage(
        formName,
        leadData.name || "there",
        templateType
      );
      const emailSubject =
        form.getAttribute("data-confirm-email-subject") || "We received your request";
      const recipient =
        form.getAttribute("data-recipient-email") || formRecipient;

      const payload = {
        ...leadData,
        _subject: `${emailSubject} (${formName})`,
        _captcha: "false",
        _template: "table",
        _autoresponse: confirmationMessage,
      };

      if (leadData.email) {
        payload._replyto = leadData.email;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }
      updateStatus(statusEl, "Sending your request...", "pending");

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const responseJson = await response.json();
        if (!response.ok || responseJson.success !== "true") {
          throw new Error("Email submission failed");
        }

        form.reset();
        updateStatus(
          statusEl,
          `Thanks! Your request is in and a confirmation email was sent to ${
            leadData.email || "your inbox"
          }.`,
          "success"
        );
      } catch (error) {
        updateStatus(
          statusEl,
          "Your request was saved, but email delivery failed. Please call 301-473-1800 for immediate support.",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  });
}

function cacheLead(leadData) {
  const existing = JSON.parse(localStorage.getItem("siteLeads") || "[]");
  existing.push(leadData);
  localStorage.setItem("siteLeads", JSON.stringify(existing));
}

function buildConfirmationMessage(formName, name, templateType) {
  const intros = {
    valuation:
      "Thanks for requesting a home valuation. We are preparing a local comp-based pricing summary for your property.",
    "agent-match":
      "Thanks for requesting an agent match. We will pair you with the best-fit specialist based on your goals.",
    review:
      "Thanks for requesting a consultation. We will contact you with specific next steps based on your timeline.",
    "home-lead":
      "Thanks for reaching out from our homepage. We are reviewing your goals and will follow up quickly.",
    general:
      `We received your ${formName.toLowerCase()} request and our team will follow up shortly.`,
  };

  const intro = intros[templateType] || intros.general;
  return `Hi ${name},\n\n${intro}\n\nIf you need immediate support, call 301-473-1800.\n\n- Kelley Real Estate Professionals`;
}

function updateStatus(statusElement, message, type) {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.dataset.statusType = type;
}

function initializeChatbot() {
  let chatPanel = document.querySelector("[data-chat-panel]");
  let chatToggle = document.querySelector("[data-chat-toggle]");

  if (!chatPanel || !chatToggle) {
    const chatMarkup = buildChatMarkup();
    document.body.insertAdjacentHTML("beforeend", chatMarkup);
    chatPanel = document.querySelector("[data-chat-panel]");
    chatToggle = document.querySelector("[data-chat-toggle]");
  }

  const chatClose = chatPanel.querySelector("[data-chat-close]");
  const chatForm = chatPanel.querySelector("[data-chat-form]");
  const chatMessages = chatPanel.querySelector("[data-chat-messages]");

  const toggleChat = (isOpen) => {
    chatPanel.classList.toggle("open", isOpen);
    chatToggle.setAttribute("aria-expanded", String(isOpen));
  };

  chatToggle.addEventListener("click", () => {
    const currentlyOpen = chatPanel.classList.contains("open");
    toggleChat(!currentlyOpen);
  });

  chatClose.addEventListener("click", () => {
    toggleChat(false);
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = chatForm.querySelector("input[name='message']");
    const userMessage = input.value.trim();
    if (!userMessage) {
      return;
    }

    appendChatMessage(chatMessages, userMessage, "user");
    input.value = "";

    const botReply = getChatReply(userMessage);
    setTimeout(() => {
      appendChatMessage(chatMessages, botReply.message, "bot", botReply.action);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 250);
  });
}

function appendChatMessage(container, text, sender, action) {
  const bubble = document.createElement("p");
  bubble.className = `chat-msg ${sender}`;
  bubble.textContent = text;
  container.appendChild(bubble);

  if (!action) {
    return;
  }

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "chat-action";
  actionButton.textContent = action.label;
  actionButton.addEventListener("click", () => action.handler());
  container.appendChild(actionButton);
}

function getChatReply(message) {
  const text = message.toLowerCase();
  const firstForm = document.querySelector("[data-scroll-target]");

  if (text.includes("sell") || text.includes("valuation") || text.includes("value")) {
    return {
      message:
        "Great choice. Our valuation form is the fastest way to get a pricing strategy and local comps.",
      action: {
        label: "Open valuation form",
        handler: () => navigateToAndCenter("#valuation-form"),
      },
    };
  }

  if (text.includes("agent") || text.includes("talk") || text.includes("team") || text.includes("contact")) {
    return {
      message:
        "I can take you to the contact form so an agent can follow up quickly.",
      action: {
        label: "Talk to the team",
        handler: () => {
          if (firstForm && firstForm.id) {
            navigateToAndCenter(`#${firstForm.id}`);
          } else {
            navigateToAndCenter("#lead-form");
          }
        },
      },
    };
  }

  if (text.includes("review") || text.includes("testimonial")) {
    return {
      message:
        "Client feedback is a big part of our process. You can review testimonials and still submit your details in one click.",
      action: {
        label: "See reviews",
        handler: () => {
          window.location.href = "./reviews.html#review-lead-form";
        },
      },
    };
  }

  if (text.includes("buy") || text.includes("first home")) {
    return {
      message:
        "For buyers, we recommend starting with your timeline, budget, and neighborhoods of interest.",
      action: {
        label: "Start buyer form",
        handler: () => navigateToAndCenter("#lead-form"),
      },
    };
  }

  return {
    message:
      "I can help with buying, selling, valuations, and agent matching. Ask me any real estate question or use one of the quick actions.",
    action: {
      label: "Open contact form",
      handler: () => navigateToAndCenter("#lead-form"),
    },
  };
}

function navigateToAndCenter(hash) {
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("scroll-focus");
    setTimeout(() => target.classList.remove("scroll-focus"), 900);
    return;
  }

  window.location.href = `./index.html${hash}`;
}

function buildChatMarkup() {
  return `
    <button
      class="chat-toggle btn btn-primary"
      type="button"
      data-chat-toggle
      aria-expanded="false"
      aria-controls="chat-panel"
    >
      Chat with us
    </button>
    <section class="chat-panel card" id="chat-panel" data-chat-panel aria-live="polite">
      <div class="chat-header">
        <strong>Kelley Assistant</strong>
        <button type="button" class="chat-close" data-chat-close aria-label="Close chat">×</button>
      </div>
      <div class="chat-messages" data-chat-messages>
        <p class="chat-msg bot">
          Hi! I can help with buying, selling, valuations, and connecting you with the right local agent.
        </p>
      </div>
      <form class="chat-form" data-chat-form>
        <input
          type="text"
          name="message"
          placeholder="Ask about neighborhoods, pricing, or next steps..."
          required
        />
        <button class="btn btn-primary" type="submit">Send</button>
      </form>
    </section>
  `;
}
