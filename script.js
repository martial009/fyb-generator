"use strict";

/* ═══════════════════════════════════════════════════════════
   FYB Generator — script.js
   Department of Economics, AAUA
═══════════════════════════════════════════════════════════ */

// ── DOM refs ─────────────────────────────────────────────────
const form = document.getElementById("fybForm");
const loadingOverlay = document.getElementById("loadingOverlay");
const loaderStatus = document.getElementById("loaderStatus");
const loaderFill = document.getElementById("loaderFill");
const flyerSection = document.getElementById("flyerSection");
const downloadBtn = document.getElementById("downloadBtn");
const redoBtn = document.getElementById("redoBtn");

// Upload refs
const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("photo");
const uploadIdle = document.getElementById("uploadIdle");
const uploadDone = document.getElementById("uploadDone");
const previewImg = document.getElementById("previewImg");
const previewName = document.getElementById("previewName");
const removePhotoBtn = document.getElementById("removePhoto");

// Flyer refs
const fcName = document.getElementById("fcName");
const fcDob = document.getElementById("fcDob");
const fcPhone = document.getElementById("fcPhone");
const fcRelationship = document.getElementById("fcRelationship");
const fcSocial = document.getElementById("fcSocial");
const fcState = document.getElementById("fcState");
const fcHobby = document.getElementById("fcHobby");
const fcFavCourse = document.getElementById("fcFavCourse");
const fcHardCourse = document.getElementById("fcHardCourse");
const fcFavLecturer = document.getElementById("fcFavLecturer");
const fcHardLevel = document.getElementById("fcHardLevel");
const fcAltDept = document.getElementById("fcAltDept");
const fcAfterDegree = document.getElementById("fcAfterDegree");
const fcQuote = document.getElementById("fcQuote");
const fcPhoto = document.getElementById("fcPhoto");
const fcNickname = document.getElementById("fcNickname");

// Phase 3 — form area, crop modal
const formArea = document.getElementById("formArea");
const cropModal = document.getElementById("cropModal");
const cropCanvas = document.getElementById("cropCanvas");
const cropZoom = document.getElementById("cropZoom");
const cropApply = document.getElementById("cropApply");
const cropCancel = document.getElementById("cropCancel");
const cropBtn = document.getElementById("cropBtn");

let photoDataURL = null;

/* ═══════════════════════════════════════════════════════════
   REVEAL ANIMATION (Intersection Observer)
═══════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════════
   FILE UPLOAD HANDLING
═══════════════════════════════════════════════════════════ */
// Drag events
uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("hovering");
});
["dragleave", "dragend"].forEach((ev) =>
  uploadZone.addEventListener(ev, () =>
    uploadZone.classList.remove("hovering"),
  ),
);
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("hovering");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) applyPhoto(file);
});

// Input change
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) applyPhoto(fileInput.files[0]);
});

// Remove
removePhotoBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  resetPhoto();
});

// ── Crop state ──────────────────────────────────────────────
let _cropImage = null; // HTMLImageElement loaded from file
let _cropOriginX = 0,
  _cropOriginY = 0; // canvas top-left offset
let _cropDragStartX = 0,
  _cropDragStartY = 0;
let _cropDragging = false;
let _cropScale = 1; // current zoom scale
const CROP_W = 340; // viewport width, keep in sync with CSS height
const CROP_H = 320;

function applyPhoto(file) {
  if (file.size > 5 * 1024 * 1024) {
    showToast("File too large — please choose an image under 5 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      _cropImage = img;
      // Fit image to viewport initially
      const scaleX = CROP_W / img.naturalWidth;
      const scaleY = CROP_H / img.naturalHeight;
      _cropScale = Math.max(scaleX, scaleY);
      // Center
      _cropOriginX = (CROP_W - img.naturalWidth * _cropScale) / 2;
      _cropOriginY = (CROP_H - img.naturalHeight * _cropScale) / 2;
      // Set zoom slider value  (slider range 10-300 means scale 0.1-3.0)
      cropZoom.value = Math.round(_cropScale * 100);
      // Size canvas to match viewport
      cropCanvas.width = CROP_W;
      cropCanvas.height = CROP_H;
      _drawCrop();
      previewName.textContent = file.name;
      cropModal.classList.add("active");
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function _drawCrop() {
  if (!_cropImage) return;
  const ctx = cropCanvas.getContext("2d");
  ctx.clearRect(0, 0, CROP_W, CROP_H);
  ctx.drawImage(
    _cropImage,
    _cropOriginX,
    _cropOriginY,
    _cropImage.naturalWidth * _cropScale,
    _cropImage.naturalHeight * _cropScale,
  );
}

// Drag handlers
cropCanvas.addEventListener("mousedown", (e) => {
  _cropDragging = true;
  _cropDragStartX = e.clientX - _cropOriginX;
  _cropDragStartY = e.clientY - _cropOriginY;
  cropCanvas.style.cursor = "grabbing";
});
window.addEventListener("mousemove", (e) => {
  if (!_cropDragging) return;
  _cropOriginX = e.clientX - _cropDragStartX;
  _cropOriginY = e.clientY - _cropDragStartY;
  _drawCrop();
});
window.addEventListener("mouseup", () => {
  _cropDragging = false;
  cropCanvas.style.cursor = "grab";
});

// Touch handlers
cropCanvas.addEventListener(
  "touchstart",
  (e) => {
    const t = e.touches[0];
    _cropDragging = true;
    _cropDragStartX = t.clientX - _cropOriginX;
    _cropDragStartY = t.clientY - _cropOriginY;
  },
  { passive: true },
);
window.addEventListener(
  "touchmove",
  (e) => {
    if (!_cropDragging) return;
    const t = e.touches[0];
    _cropOriginX = t.clientX - _cropDragStartX;
    _cropOriginY = t.clientY - _cropDragStartY;
    _drawCrop();
  },
  { passive: true },
);
window.addEventListener("touchend", () => {
  _cropDragging = false;
});

// Zoom slider
cropZoom.addEventListener("input", () => {
  if (!_cropImage) return;
  const oldScale = _cropScale;
  _cropScale = cropZoom.value / 100;
  // Zoom from center of viewport
  const cx = CROP_W / 2;
  const cy = CROP_H / 2;
  _cropOriginX = cx - (cx - _cropOriginX) * (_cropScale / oldScale);
  _cropOriginY = cy - (cy - _cropOriginY) * (_cropScale / oldScale);
  _drawCrop();
});

// Apply crop
cropApply.addEventListener("click", () => {
  if (!_cropImage) return;
  // Export exactly what is on the canvas
  photoDataURL = cropCanvas.toDataURL("image/jpeg", 0.95);
  previewImg.src = photoDataURL;
  uploadIdle.style.display = "none";
  uploadDone.style.display = "block";
  cropModal.classList.remove("active");
});

// Cancel crop
cropCancel.addEventListener("click", () => {
  cropModal.classList.remove("active");
  // If no photo was ever accepted, reset
  if (!photoDataURL) resetPhoto();
});

// Open crop from the "Crop Image" button after upload
cropBtn.addEventListener("click", () => {
  if (_cropImage) {
    cropModal.classList.add("active");
  }
});

function resetPhoto() {
  photoDataURL = null;
  fileInput.value = "";
  previewImg.src = "";
  uploadIdle.style.display = "block";
  uploadDone.style.display = "none";
}

/* ═══════════════════════════════════════════════════════════
   SIMPLE TOAST
═══════════════════════════════════════════════════════════ */
function showToast(msg) {
  // One at a time
  const existing = document.querySelector(".fyb-toast");
  if (existing) existing.remove();

  const t = document.createElement("div");
  t.className = "fyb-toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: "rgba(32,37,135,.95)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: ".9rem",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "600",
    boxShadow: "0 8px 24px rgba(0,0,0,.4)",
    zIndex: "9999",
    opacity: "0",
    transition: "all .35s ease",
    whiteSpace: "nowrap",
  });
  document.body.appendChild(t);

  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => t.remove(), 350);
  }, 3000);
}

/* ═══════════════════════════════════════════════════════════
   LOADING ANIMATION
═══════════════════════════════════════════════════════════ */
const STEPS = [
  { pct: 15, msg: "Gathering your details…" },
  { pct: 38, msg: "Crafting your biography…" },
  { pct: 60, msg: "Arranging your portrait…" },
  { pct: 80, msg: "Designing the poster layout…" },
  { pct: 95, msg: "Adding finishing touches…" },
  { pct: 100, msg: "Almost there…" },
];
const STEP_DELAYS = [350, 500, 420, 380, 320, 280]; // ms per step

function showLoading() {
  loaderFill.style.transition = "none";
  loaderFill.style.width = "0%";
  loaderStatus.textContent = "Preparing your flyer…";
  loadingOverlay.setAttribute("aria-hidden", "false");
  loadingOverlay.classList.add("active");

  return new Promise((resolve) => {
    let i = 0;
    function advance() {
      if (i >= STEPS.length) {
        setTimeout(resolve, 200);
        return;
      }
      const { pct, msg } = STEPS[i];
      const delay = STEP_DELAYS[i] || 300;
      i++;
      setTimeout(() => {
        loaderFill.style.transition = "width .4s cubic-bezier(.4,0,.2,1)";
        loaderFill.style.width = pct + "%";
        loaderStatus.textContent = msg;
        advance();
      }, delay);
    }
    advance();
  });
}

function hideLoading() {
  loadingOverlay.classList.remove("active");
  loadingOverlay.setAttribute("aria-hidden", "true");
}

/* ═══════════════════════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════════════════════ */
function validateForm() {
  let ok = true;

  // Clear old errors
  form
    .querySelectorAll(".invalid")
    .forEach((el) => el.classList.remove("invalid"));
  form.querySelectorAll(".err-msg").forEach((el) => el.remove());

  // Required fields
  form.querySelectorAll("[required]").forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("invalid");
      const span = document.createElement("span");
      span.className = "err-msg";
      span.textContent = "This field is required.";
      field.insertAdjacentElement("afterend", span);
      ok = false;
    }
  });

  // Photo
  if (!photoDataURL) {
    ok = false;
    showToast("Please upload your photo to continue.");
  }

  return ok;
}

/* ═══════════════════════════════════════════════════════════
   DATE FORMATTER
═══════════════════════════════════════════════════════════ */
function formatDate(str) {
  // DOB is now a DD/MM text input — return as-is
  return str ? str : "—";
}

/* ═══════════════════════════════════════════════════════════
   FLYER POPULATION
═══════════════════════════════════════════════════════════ */
function populateFlyer(d) {
  fcName.textContent = d.name.toUpperCase();
  fcNickname.textContent = d.nickname ? `"${d.nickname}"` : "";
  fcDob.textContent = formatDate(d.dob);
  fcPhone.textContent = d.phone;
  fcRelationship.textContent = d.relationship;
  fcSocial.textContent = d.social;
  fcState.textContent = d.state;
  fcHobby.textContent = d.hobby;
  fcFavCourse.textContent = d.favCourse;
  fcHardCourse.textContent = d.hardCourse;
  fcFavLecturer.textContent = d.favLecturer;
  fcHardLevel.textContent = d.hardLevel;
  fcAltDept.textContent = d.altDept;
  fcAfterDegree.textContent = d.afterDegree;
  fcQuote.textContent = "\u201C" + d.quote + "\u201D";
  fcPhoto.src = photoDataURL;
}

/* ═══════════════════════════════════════════════════════════
   FORM SUBMIT
═══════════════════════════════════════════════════════════ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    const firstErr = form.querySelector(".invalid");
    if (firstErr)
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Collect values
  const data = {
    name: document.getElementById("name").value.trim(),
    nickname: document.getElementById("nickname").value.trim(),
    dob: document.getElementById("dob").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    relationship: document.getElementById("relationship").value,
    social: document.getElementById("social").value.trim(),
    state: document.getElementById("state").value,
    hobby: document.getElementById("hobby").value.trim(),
    favCourse: document.getElementById("favCourse").value.trim(),
    hardCourse: document.getElementById("hardCourse").value.trim(),
    favLecturer: document.getElementById("favLecturer").value.trim(),
    hardLevel: document.getElementById("hardLevel").value,
    altDept: document.getElementById("altDept").value.trim(),
    afterDegree: document.getElementById("afterDegree").value.trim(),
    quote: document.getElementById("quote").value.trim(),
  };

  // Run loading sequence, then populate & show flyer
  await showLoading();
  populateFlyer(data);
  hideLoading();

  // Hide the form area — user can restore it with the Redo button
  formArea.classList.add("hidden");

  flyerSection.style.display = "block";

  // Trigger reveal animations for flyer section
  flyerSection.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
    setTimeout(() => el.classList.add("visible"), 80);
  });

  // Smooth scroll to flyer
  setTimeout(() => {
    flyerSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);
});

/* ═══════════════════════════════════════════════════════════
   DOWNLOAD FLYER  (html2canvas)
═══════════════════════════════════════════════════════════ */
downloadBtn.addEventListener("click", async () => {
  const flyerEl = document.getElementById("flyercontainer");

  // Swap button to loading state
  const origHTML = downloadBtn.innerHTML;
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> <span>Generating image…</span>';
  downloadBtn.disabled = true;

  try {
    // Ensure web fonts (Dancing Script etc.) are fully loaded
    await document.fonts.ready;

    // Wait for all images inside the flyer to be loaded
    await Promise.all(
      [...flyerEl.querySelectorAll("img")].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            }),
      ),
    );

    // Temporarily remove CSS scale so html2canvas captures full 800px poster
    const prevTransform = flyerEl.style.transform;
    const prevOrigin = flyerEl.style.transformOrigin;
    const prevWrapH = flyerEl.parentElement
      ? flyerEl.parentElement.style.height
      : "";
    flyerEl.style.transform = "";
    flyerEl.style.transformOrigin = "";
    if (flyerEl.parentElement) flyerEl.parentElement.style.height = "";

    const canvas = await html2canvas(flyerEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fef8e6",
      logging: false,
      imageTimeout: 20000,
    });

    const safeName = (fcName.textContent || "FYB").replace(/[^a-z0-9]/gi, "_");
    const filename = safeName + "_FYB_Flyer.png";

    // Restore scale after capture
    flyerEl.style.transform = prevTransform;
    flyerEl.style.transformOrigin = prevOrigin;
    if (flyerEl.parentElement) flyerEl.parentElement.style.height = prevWrapH;

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();

    showToast("\ud83c\udf89 Flyer downloaded successfully!");
  } catch (err) {
    console.error("html2canvas error:", err);
    // Ensure scale is restored even on error
    flyerEl.style.transform = "";
    flyerEl.style.transformOrigin = "";
    scaleFlyerToViewport();
    showToast("Download failed — please try again.");
  } finally {
    downloadBtn.innerHTML = origHTML;
    downloadBtn.disabled = false;
  }
});

/* ═══════════════════════════════════════════════════════════
   EDIT & REGENERATE
═══════════════════════════════════════════════════════════ */
redoBtn.addEventListener("click", () => {
  flyerSection.style.display = "none";
  // Remove visible class so animations re-trigger next time
  flyerSection
    .querySelectorAll(".reveal")
    .forEach((el) => el.classList.remove("visible"));
  // Restore form
  formArea.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ═══════════════════════════════════════════════════════════
   FLYER SIZE — driven by background.png natural dimensions
═══════════════════════════════════════════════════════════ */
let _flyerW = 800; // updated once background image loads
let _flyerH = 1000;

function scaleFlyerToViewport() {
  const container = document.getElementById("flyercontainer");
  if (!container) return;
  const vw = window.innerWidth;
  if (vw < 860) {
    const padding = 24; // px each side
    const available = vw - padding * 2;
    const scale = Math.min(1, available / _flyerW);
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = "top center";
    // Shrink wrapper so no vertical gap is left below the scaled poster
    const wrap = container.parentElement;
    if (wrap) wrap.style.height = Math.round(_flyerH * scale) + "px";
  } else {
    container.style.transform = "";
    container.style.transformOrigin = "";
    const wrap = container.parentElement;
    if (wrap) wrap.style.height = "";
  }
}

function initFlyerSize() {
  const container = document.getElementById("flyercontainer");
  if (!container) return;
  const bg = new Image();
  bg.onload = () => {
    _flyerW = bg.naturalWidth;
    _flyerH = bg.naturalHeight;
    container.style.width = _flyerW + "px";
    container.style.height = _flyerH + "px";
    scaleFlyerToViewport();
  };
  bg.onerror = () => {
    // background.png not found yet — fall back to defaults
    container.style.width = _flyerW + "px";
    container.style.height = _flyerH + "px";
    scaleFlyerToViewport();
  };
  bg.src = "images/background.png";
}

window.addEventListener("resize", scaleFlyerToViewport);
initFlyerSize();
