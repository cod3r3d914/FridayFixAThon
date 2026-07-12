const stage = document.querySelector("[data-stage]");
const startButton = document.querySelector("[data-start-intro]");
const audio = document.querySelector("[data-intro-audio]");
const audioNote = document.querySelector("[data-audio-note]");
const counters = Array.from(document.querySelectorAll("[data-counter]"));
const ticketCards = Array.from(document.querySelectorAll("[data-ticket-card]"));

let completionTimer = null;
let counterFrame = null;
let ticketCycleTimer = null;
let ticketCycleIndex = 0;

const FALLBACK_DURATION_MS = 18000;

const ticketThemes = [
  { title: "CCD not sending", meta: "Interoperability", status: "Triaged" },
  { title: "Appointments not syncing", meta: "Scheduling", status: "Fix found" },
  { title: "Balance updates", meta: "Patient account", status: "Validated" },
  { title: "Luma Demographic Form Sync", meta: "Integration", status: "Partnered" },
  { title: "API Failures for Luma", meta: "API", status: "Escalated" },
  { title: "Enrollment issue for PxP", meta: "PxP enrollment", status: "Next step" },
  { title: "Password Resets", meta: "Access", status: "Resolved" },
  { title: "Linked Accounts", meta: "Patient portal", status: "KB linked" },
  { title: "Virtual Visits", meta: "Care access", status: "Updated" },
  { title: "Advanced Audit Reporting", meta: "Reporting", status: "Documented" }
];

const showNote = (message) => {
  if (!audioNote) {
    return;
  }

  audioNote.textContent = message;
  audioNote.classList.add("is-visible");
  window.setTimeout(() => audioNote.classList.remove("is-visible"), 3600);
};

const getIntroDuration = () => {
  if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
    return Math.max(audio.duration * 1000, 12000);
  }

  return FALLBACK_DURATION_MS;
};

const formatCounterValue = (counter, progressValue) => {
  const target = Number(counter.dataset.target || 0);
  const decimals = Number(counter.dataset.decimals || 0);
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  const value = target * progressValue;
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
};

const updateTicketCard = (card, theme, index) => {
  const id = card.querySelector("[data-ticket-id]");
  const title = card.querySelector("[data-ticket-title]");
  const meta = card.querySelector("[data-ticket-meta]");
  const status = card.querySelector("[data-ticket-status]");

  if (id) {
    id.textContent = `CASE-${1842 + ((ticketCycleIndex + index) * 37)}`;
  }

  if (title) {
    title.textContent = theme.title;
  }

  if (meta) {
    meta.textContent = theme.meta;
  }

  if (status) {
    status.textContent = theme.status;
  }
};

const cycleTickets = () => {
  ticketCards.forEach((card, index) => {
    const theme = ticketThemes[(ticketCycleIndex + index) % ticketThemes.length];
    updateTicketCard(card, theme, index);
  });

  ticketCycleIndex = (ticketCycleIndex + 1) % ticketThemes.length;
};

const startTicketCycle = () => {
  window.clearInterval(ticketCycleTimer);
  ticketCycleIndex = 0;
  cycleTickets();
  ticketCycleTimer = window.setInterval(cycleTickets, 2300);
};

const stopTicketCycle = () => {
  window.clearInterval(ticketCycleTimer);
  ticketCycleTimer = null;
};

const finishIntro = () => {
  if (!stage) {
    return;
  }

  window.clearTimeout(completionTimer);
  completionTimer = null;
  stopTicketCycle();
  stage.classList.add("is-complete");

  if (startButton) {
    startButton.textContent = "Replay intro";
  }
};

const animateCounters = () => {
  if (!counters.length) {
    return;
  }

  if (counterFrame) {
    window.cancelAnimationFrame(counterFrame);
  }

  const start = window.performance.now();
  const duration = 6500;

  counters.forEach((counter) => {
    counter.textContent = formatCounterValue(counter, 0);
  });

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    counters.forEach((counter) => {
      counter.textContent = formatCounterValue(counter, eased);
    });

    if (progress < 1) {
      counterFrame = window.requestAnimationFrame(tick);
    }
  };

  counterFrame = window.requestAnimationFrame(tick);
};

const restartAnimation = () => {
  if (!stage) {
    return;
  }

  window.clearTimeout(completionTimer);
  stage.classList.remove("is-playing", "is-complete");
  void stage.offsetWidth;
  stage.classList.add("is-playing");
  startTicketCycle();
  animateCounters();

  completionTimer = window.setTimeout(finishIntro, getIntroDuration());
};

const startIntro = async () => {
  restartAnimation();

  if (!audio) {
    return;
  }

  try {
    audio.currentTime = 0;
    await audio.play();
    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(finishIntro, getIntroDuration());
  } catch (error) {
    showNote(audio.error ? "MP3 not found. Check assets/friday-fixathon-intro.mp3." : "Animation is playing. If music does not start, click Start intro directly in the browser.");
  }
};

cycleTickets();

if (startButton) {
  startButton.addEventListener("click", startIntro);
}

if (audio) {
  audio.addEventListener("ended", finishIntro);
}