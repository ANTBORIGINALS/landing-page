import { CONTACT_EMAIL, FORM_ENDPOINT } from "../config.js";

const MIN_FILL_TIME_MS = 2000;

function autoGrow(textarea) {
  textarea.style.height = "auto";
  const border = textarea.offsetHeight - textarea.clientHeight;
  const max = parseFloat(getComputedStyle(textarea).maxHeight) || Infinity;
  const height = textarea.scrollHeight + border;
  textarea.style.height = `${Math.min(height, max)}px`;
  textarea.style.overflowY = height > max ? "auto" : "hidden";
}

function validate(form) {
  let firstInvalid = null;
  form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
    const valid = field.checkValidity() && field.value.trim() !== "";
    field.classList.toggle("is-invalid", !valid);
    if (!valid && !firstInvalid) firstInvalid = field;
  });
  return firstInvalid;
}

function openMailClient(data) {
  const subject = `Website enquiry from ${data.get("name")}`;
  const body = `${data.get("message")}\n\n—\n${data.get("name")}\n${data.get("email")}`;
  window.location.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;

  const message = form.querySelector("textarea");
  const loadedAt = Date.now();

  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle("is-error", isError);
  };

  form.addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
    if (e.target === message) autoGrow(message);
  });
  form.addEventListener("reset", () => {
    if (message) setTimeout(() => autoGrow(message), 0);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (Date.now() - loadedAt < MIN_FILL_TIME_MS) {
      setStatus("Please take a moment to fill in the form, then try again.", true);
      return;
    }

    const firstInvalid = validate(form);
    if (firstInvalid) {
      setStatus("Please fill in your name, a valid email and a message.", true);
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    if (data.get("_gotcha")) return;

    if (!FORM_ENDPOINT) {
      openMailClient(data);
      setStatus("Opening your email app with the message ready to send.");
      return;
    }

    setStatus("Sending…");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Form endpoint answered ${response.status}`);
      form.reset();
      setStatus("Message sent. We'll reply by email.");
    } catch {
      setStatus(`The message could not be sent. Try again, or write to ${CONTACT_EMAIL}.`, true);
    }
  });
}
