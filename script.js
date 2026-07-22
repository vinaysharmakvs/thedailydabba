const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const orderForm = document.querySelector(".order-form");
const formNote = document.querySelector("[data-form-note]");
const orderEstimate = document.querySelector("[data-order-estimate]");
const imageModal = document.querySelector("[data-image-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const dailyDabbaWhatsapp = "919872203405";

function formatPrice(value) {
  return `Rs. ${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function calculateOrderEstimate() {
  if (!orderForm) return null;
  const requirement = orderForm.querySelector("[data-price-input]");
  const quantityInput = orderForm.querySelector("[data-quantity-input]");
  const selected = requirement?.selectedOptions?.[0];
  const unitPrice = Number(selected?.dataset.price || 220);
  const quantity = Math.max(1, Number(quantityInput?.value || 1));
  const subtotal = unitPrice * quantity;
  let discountRate = 0;
  if (quantity >= 25 || subtotal >= 7000) discountRate = 0.12;
  else if (quantity >= 12 || subtotal >= 3500) discountRate = 0.08;
  else if (quantity >= 6 || subtotal >= 1600) discountRate = 0.05;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;
  return { unitPrice, quantity, subtotal, discount, total, discountRate };
}

function updateOrderEstimate() {
  const estimate = calculateOrderEstimate();
  if (!estimate || !orderEstimate) return;
  const discountText = estimate.discount
    ? `Surprise from Daily Dabba: ${formatPrice(estimate.discount)} off automatically applied.`
    : "Surprise from Daily Dabba will apply automatically for larger orders.";
  orderEstimate.innerHTML = `
    <span>Live estimate</span>
    <strong>${formatPrice(estimate.total)}</strong>
    <p>${discountText}</p>
  `;
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileMenu.hidden = isOpen;
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mobileMenu.hidden = true;
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".menu-poster-button").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    if (!imageModal || !modalImage || !image) return;
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    imageModal.hidden = false;
    document.body.style.overflow = "hidden";
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!imageModal) return;
    imageModal.hidden = true;
    document.body.style.overflow = "";
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageModal && !imageModal.hidden) {
    imageModal.hidden = true;
    document.body.style.overflow = "";
  }
});

orderForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(orderForm);
  const estimate = calculateOrderEstimate();
  const discountText = estimate?.discount ? `${formatPrice(estimate.discount)} surprise discount applied` : "No surprise discount on this estimate";
  const message = [
    "Hello The Daily Dabba, I want to enquire about an order.",
    `Name: ${data.get("name")}`,
    `Location: ${data.get("location")}`,
    `Requirement: ${data.get("requirement")}`,
    `Quantity/Guests: ${data.get("quantity")}`,
    `Preferred Date: ${data.get("date") || "Not added"}`,
    `Preferred Time: ${data.get("time") || "Not added"}`,
    `Spice Level: ${data.get("spice")}`,
    `Estimated Amount: ${estimate ? formatPrice(estimate.total) : "To be confirmed"} (${discountText})`,
    `Details: ${data.get("details") || "Not added"}`,
    "Note: Delivery can be arranged via Rapido or similar mode. Delivery charges/payment will be paid by the customer.",
  ].join("\n");

  navigator.clipboard?.writeText(message).catch(() => {});
  if (formNote) {
    formNote.hidden = false;
    formNote.textContent = "Order message prepared. WhatsApp will open so you can send it.";
  }
  window.setTimeout(() => {
    window.open(`https://wa.me/${dailyDabbaWhatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }, 450);
});

orderForm?.addEventListener("input", updateOrderEstimate);
orderForm?.addEventListener("change", updateOrderEstimate);
updateOrderEstimate();
