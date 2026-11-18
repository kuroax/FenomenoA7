let initialized = false;
export function initializeFormValidation() {
  const form = document.querySelector("[data-demo-form]");
  if (!form || initialized) return;
  initialized = true;
  const fieldset = form.querySelector("fieldset");
  if (fieldset) fieldset.disabled = false;
  const message = form.querySelector("[data-form-message]");
  form.addEventListener("input", () => { if (message) message.textContent = ""; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (message) message.textContent = "Validación correcta. Esta demostración es local: no se envió ningún dato a un servidor.";
    form.reset();
  });
}
