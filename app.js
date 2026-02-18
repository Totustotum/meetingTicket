const CONFIG = {
  title: "Student Advising",
  durationMinutes: 15,
  // Available slots per day (local time). Keep these aligned with your mock.
  slotStartHour: 15, // 3:00 PM
  slotEndHourInclusive: 18, // 6:00 PM
  slotStepMinutes: 60,
  // Disallow booking dates before today
  minDate: new Date(),
  storageKey: "scheduling-app.bookings.v1",
};

/** @typedef {{ id: string; startsAtIso: string; durationMinutes: number; name: string; email: string; createdAtIso: string }} Booking */

const els = {
  stepTitle: byId("stepTitle"),
  monthLabel: byId("monthLabel"),
  prevMonthBtn: byId("prevMonthBtn"),
  nextMonthBtn: byId("nextMonthBtn"),
  calendarDays: byId("calendarDays"),
  selectedDateLabel: byId("selectedDateLabel"),
  selectedDateSub: byId("selectedDateSub"),
  slotsList: byId("slotsList"),
  confirmBar: byId("confirmBar"),
  confirmTimeLabel: byId("confirmTimeLabel"),
  nextBtn: byId("nextBtn"),
  detailsForm: byId("detailsForm"),
  detailsSummary: byId("detailsSummary"),
  nameInput: byId("nameInput"),
  emailInput: byId("emailInput"),
  nameError: byId("nameError"),
  emailError: byId("emailError"),
  formGlobalError: byId("formGlobalError"),
  backBtn: byId("backBtn"),
  scheduleBtn: byId("scheduleBtn"),
  successPanel: byId("successPanel"),
  successText: byId("successText"),
  newBookingBtn: byId("newBookingBtn"),
  exportIcsBtn: byId("exportIcsBtn"),
};

const state = {
  step: /** @type {"select" | "details" | "success"} */ ("select"),
  // viewMonth is a Date pointing to the first day of the visible month
  viewMonth: startOfMonth(new Date()),
  selectedDate: startOfDay(new Date()),
  selectedTimeMinutes: /** @type {number | null} */ (null), // minutes from midnight
  lastBooked: /** @type {Booking | null} */ (null),
};

init();

function init() {
  // Normalize minDate to start of day for comparisons
  CONFIG.minDate = startOfDay(CONFIG.minDate);

  // Start calendar at current month
  state.viewMonth = startOfMonth(new Date());
  state.selectedDate = clampMinDate(startOfDay(new Date()));

  wireEvents();
  renderAll();
}

function wireEvents() {
  els.prevMonthBtn.addEventListener("click", () => {
    state.viewMonth = addMonths(state.viewMonth, -1);
    renderCalendar();
  });
  els.nextMonthBtn.addEventListener("click", () => {
    state.viewMonth = addMonths(state.viewMonth, 1);
    renderCalendar();
  });

  els.nextBtn.addEventListener("click", () => {
    if (state.selectedTimeMinutes == null) return;
    setStep("details");
  });

  els.backBtn.addEventListener("click", () => {
    setStep("select");
  });

  els.detailsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    onSubmitDetails();
  });

  els.newBookingBtn.addEventListener("click", () => {
    // keep same month/date, reset selection
    state.selectedTimeMinutes = null;
    state.lastBooked = null;
    setStep("select");
  });

  els.exportIcsBtn.addEventListener("click", () => {
    if (!state.lastBooked) return;
    downloadIcs(state.lastBooked);
  });
}

function renderAll() {
  renderHeader();
  renderCalendar();
  renderRightPanel();
  renderStepVisibility();
}

function renderHeader() {
  els.selectedDateLabel.textContent = formatFullDate(state.selectedDate);
  els.selectedDateSub.textContent = `Your local time (${getLocalTimeZoneLabel()})`;
}

function renderCalendar() {
  els.monthLabel.textContent = formatMonthYear(state.viewMonth);
  els.calendarDays.replaceChildren(...buildCalendarDayButtons());
}

function renderRightPanel() {
  renderHeader();
  renderSlots();
  renderConfirmBar();
  renderDetailsSummary();
  renderSuccess();
}

function renderSlots() {
  if (state.step !== "select") return;
  const slots = getSlotsForDate(state.selectedDate);
  const bookings = loadBookings();

  if (slots.length === 0) {
    const msg = document.createElement("div");
    msg.className = "empty";
    msg.textContent = "No slots available for this day.";
    els.slotsList.replaceChildren(msg);
    return;
  }

  els.slotsList.replaceChildren(
    ...slots.map((slot) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-btn";
      btn.textContent = formatTimeMinutes(slot.minutesFromMidnight);

      const startsAtIso = toIsoLocal(state.selectedDate, slot.minutesFromMidnight);
      const isBooked = bookings.some((b) => b.startsAtIso === startsAtIso);

      if (isBooked) {
        btn.disabled = true;
        btn.title = "Already booked";
      }

      const isSelected = state.selectedTimeMinutes === slot.minutesFromMidnight;
      if (isSelected) btn.classList.add("is-selected");

      btn.addEventListener("click", () => {
        state.selectedTimeMinutes = slot.minutesFromMidnight;
        renderConfirmBar();
        // rerender slots to highlight selected
        renderSlots();
      });
      return btn;
    }),
  );
}

function renderConfirmBar() {
  const show = state.step === "select" && state.selectedTimeMinutes != null;
  els.confirmBar.hidden = !show;
  if (show && state.selectedTimeMinutes != null) {
    els.confirmTimeLabel.textContent = formatTimeMinutes(state.selectedTimeMinutes);
  }
}

function renderDetailsSummary() {
  if (state.step !== "details") return;
  const startsAtIso = toIsoLocal(state.selectedDate, must(state.selectedTimeMinutes));
  const startDate = new Date(startsAtIso);
  const endDate = new Date(startDate.getTime() + CONFIG.durationMinutes * 60_000);
  els.detailsSummary.textContent = [
    `${formatFullDate(state.selectedDate)}`,
    `${formatTimeMinutes(must(state.selectedTimeMinutes))} – ${formatTime(endDate)}`,
    `Time zone: ${getLocalTimeZoneLabel()}`,
  ].join(" • ");
}

function renderSuccess() {
  if (state.step !== "success" || !state.lastBooked) return;
  const startsAt = new Date(state.lastBooked.startsAtIso);
  const endsAt = new Date(startsAt.getTime() + state.lastBooked.durationMinutes * 60_000);
  els.successText.textContent = `${state.lastBooked.name}, you’re booked for ${formatFullDate(
    startsAt,
  )} at ${formatTime(startsAt)} – ${formatTime(endsAt)} (${getLocalTimeZoneLabel()}).`;
}

function renderStepVisibility() {
  if (state.step === "select") {
    els.stepTitle.textContent = "Select a Date & Time";
    els.slotsList.hidden = false;
    els.detailsForm.hidden = true;
    els.successPanel.hidden = true;
    clearFormErrors();
    return;
  }

  if (state.step === "details") {
    els.stepTitle.textContent = "Enter Details";
    els.slotsList.hidden = true;
    els.detailsForm.hidden = false;
    els.successPanel.hidden = true;
    clearFormErrors();
    // focus first field for speed/accessibility
    queueMicrotask(() => els.nameInput.focus());
    return;
  }

  els.stepTitle.textContent = "Scheduled";
  els.slotsList.hidden = true;
  els.detailsForm.hidden = true;
  els.successPanel.hidden = false;
}

function setStep(step) {
  state.step = step;
  // When moving between steps, keep the right panel up to date
  renderRightPanel();
  renderStepVisibility();
}

function onSubmitDetails() {
  clearFormErrors();

  const name = els.nameInput.value.trim();
  const email = els.emailInput.value.trim();

  let ok = true;
  if (!name) {
    els.nameError.textContent = "Please enter your name.";
    ok = false;
  }
  if (!email) {
    els.emailError.textContent = "Please enter your email.";
    ok = false;
  } else if (!looksLikeEmail(email)) {
    els.emailError.textContent = "Please enter a valid email.";
    ok = false;
  }
  if (!ok) return;

  const startsAtIso = toIsoLocal(state.selectedDate, must(state.selectedTimeMinutes));
  const bookings = loadBookings();
  const alreadyBooked = bookings.some((b) => b.startsAtIso === startsAtIso);
  if (alreadyBooked) {
    els.formGlobalError.textContent =
      "That time was just booked. Please go back and pick another slot.";
    return;
  }

  /** @type {Booking} */
  const booking = {
    id: cryptoId(),
    startsAtIso,
    durationMinutes: CONFIG.durationMinutes,
    name,
    email,
    createdAtIso: new Date().toISOString(),
  };

  bookings.push(booking);
  saveBookings(bookings);

  state.lastBooked = booking;
  setStep("success");
}

function clearFormErrors() {
  els.nameError.textContent = "";
  els.emailError.textContent = "";
  els.formGlobalError.textContent = "";
}

function buildCalendarDayButtons() {
  const matrix = buildCalendarMatrix(state.viewMonth);
  const today = startOfDay(new Date());
  const min = CONFIG.minDate;

  /** @type {HTMLElement[]} */
  const nodes = [];
  for (const day of matrix) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-btn";
    btn.textContent = String(day.date.getDate());

    const isOutside = day.isOutsideMonth;
    if (isOutside) btn.classList.add("is-outside");

    const isToday = isSameDay(day.date, today);
    if (isToday) btn.classList.add("is-today");

    const isSelected = isSameDay(day.date, state.selectedDate);
    if (isSelected) btn.classList.add("is-selected");

    const isDisabled = day.date < min;
    if (isDisabled) {
      btn.setAttribute("aria-disabled", "true");
    }

    btn.setAttribute(
      "aria-label",
      `${formatFullDate(day.date)}${isDisabled ? ", unavailable" : ""}${
        isSelected ? ", selected" : ""
      }`,
    );

    btn.addEventListener("click", () => {
      if (isDisabled) return;
      state.selectedDate = startOfDay(day.date);
      // Reset time selection when changing date
      state.selectedTimeMinutes = null;
      // If user clicks an outside-month day, snap the month view to that month
      if (day.isOutsideMonth) state.viewMonth = startOfMonth(day.date);
      // Keep user in select step when choosing dates
      setStep("select");
      renderCalendar();
    });

    nodes.push(btn);
  }
  return nodes;
}

function getSlotsForDate(date) {
  // For a real app, fetch from backend. This demo generates slots locally.
  // Example: 3:00, 4:00, 5:00, 6:00 PM.
  /** @type {{ minutesFromMidnight: number }[]} */
  const slots = [];
  const start = CONFIG.slotStartHour * 60;
  const end = CONFIG.slotEndHourInclusive * 60;
  for (let m = start; m <= end; m += CONFIG.slotStepMinutes) {
    slots.push({ minutesFromMidnight: m });
  }

  // If selected date is today, hide slots that are already in the past.
  const today = startOfDay(new Date());
  if (isSameDay(date, today)) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter((s) => s.minutesFromMidnight > nowMinutes);
  }
  return slots;
}

function loadBookings() {
  /** @type {unknown} */
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(CONFIG.storageKey) ?? "[]");
  } catch {
    raw = [];
  }
  if (!Array.isArray(raw)) return [];
  /** @type {Booking[]} */
  const bookings = [];
  for (const b of raw) {
    if (!b || typeof b !== "object") continue;
    if (
      typeof b.id === "string" &&
      typeof b.startsAtIso === "string" &&
      typeof b.durationMinutes === "number" &&
      typeof b.name === "string" &&
      typeof b.email === "string" &&
      typeof b.createdAtIso === "string"
    ) {
      bookings.push(/** @type {Booking} */ (b));
    }
  }
  return bookings;
}

function saveBookings(bookings) {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(bookings));
}

function downloadIcs(booking) {
  const dtStart = toIcsDateTimeUtc(new Date(booking.startsAtIso));
  const dtEnd = toIcsDateTimeUtc(
    new Date(new Date(booking.startsAtIso).getTime() + booking.durationMinutes * 60_000),
  );
  const uid = `${booking.id}@local`;
  const now = toIcsDateTimeUtc(new Date());
  const summary = escapeIcsText(CONFIG.title);
  const description = escapeIcsText(`Booked by ${booking.name} (${booking.email}).`);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scheduling App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scheduled-event.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -----------------------
// Date/time helpers
// -----------------------

function formatMonthYear(d) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatFullDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeMinutes(minutesFromMidnight) {
  const d = new Date();
  d.setHours(0, minutesFromMidnight, 0, 0);
  return formatTime(d);
}

function formatTime(d) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function addMonths(d, delta) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return startOfMonth(x);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clampMinDate(d) {
  return d < CONFIG.minDate ? new Date(CONFIG.minDate) : d;
}

function getLocalTimeZoneLabel() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!tz) return "Local time";
  return tz;
}

/**
 * Build a 6-week calendar matrix starting on Monday.
 * @returns {{ date: Date; isOutsideMonth: boolean }[]}
 */
function buildCalendarMatrix(viewMonth) {
  const firstOfMonth = startOfMonth(viewMonth);
  const month = firstOfMonth.getMonth();

  // JS: Sunday=0..Saturday=6. We want Monday=0..Sunday=6
  const firstDow = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstDow);

  /** @type {{ date: Date; isOutsideMonth: boolean }[]} */
  const out = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ date: startOfDay(d), isOutsideMonth: d.getMonth() !== month });
  }
  return out;
}

/**
 * Create an ISO string representing a local time on a given date.
 * Note: stored as ISO with timezone offset via Date().toISOString() would be UTC;
 * we store a full ISO string based on local date/time via Date constructor.
 */
function toIsoLocal(date, minutesFromMidnight) {
  const d = new Date(date);
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  d.setHours(h, m, 0, 0);
  // Important: keep as local instant (will serialize to UTC string)
  return d.toISOString();
}

function toIcsDateTimeUtc(d) {
  // YYYYMMDDTHHMMSSZ
  const pad = (n) => String(n).padStart(2, "0");
  return (
    String(d.getUTCFullYear()) +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcsText(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

// -----------------------
// Misc helpers
// -----------------------

function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function must(v) {
  if (v == null) throw new Error("Unexpected null/undefined");
  return v;
}

function looksLikeEmail(s) {
  // lightweight check; HTML input type=email does more, but we keep UX consistent
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function cryptoId() {
  // @ts-ignore - crypto.randomUUID exists in modern browsers
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
