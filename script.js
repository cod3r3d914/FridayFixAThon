const SETUP_SEQUENCE = "codyfix";
const SETUP_SHORTCUT = { key: "f", ctrlKey: true, altKey: true };
const STORAGE_KEYS = {
  guest: "fridayFixathonGuest",
  topic: "fridayFixathonTopic"
};

const stage = document.querySelector("[data-stage]");
const startButton = document.querySelector("[data-start-intro]");
const audio = document.querySelector("[data-intro-audio]");
const audioNote = document.querySelector("[data-audio-note]");
const setupPanel = document.querySelector("[data-setup-panel]");
const guestInput = document.querySelector("[data-guest-input]");
const topicInput = document.querySelector("[data-topic-input]");
const closeSetupButton = document.querySelector("[data-close-setup]");
const guestLine = document.querySelector("[data-guest-line]");
const topicLine = document.querySelector("[data-topic-line]");
const ticketCards = Array.from(document.querySelectorAll("[data-ticket-card]"));
const nameRain = document.querySelector("[data-name-rain]");

let completionTimer = null;
let ticketCycleTimer = null;
let ticketCycleIndex = 0;
let commandBuffer = "";

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

const teamMembers = [
  { name: "Alysen Gunzelman", role: "Representative II, Client Services" },
  { name: "Cody Allison", role: "Application Advisor" },
  { name: "Demetrius Bauldie", role: "Sr. Specialist I, Tech Support" },
  { name: "Eric Thul", role: "Sr. Specialist I, Tech Support" },
  { name: "Jessica Page", role: "Director of Client Support Operations" },
  { name: "Matthew Cress", role: "Specialist II, Technical Support" },
  { name: "Sandeep Singh", role: "Manager, Client Services" },
  { name: "Deepak Barman", role: "Specialist I, Client Support" },
  { name: "Dhanigonda Ramakanth", role: "Client Services Consultant" },
  { name: "Gray Goliszek", role: "Specialist I, Application Managed Services" },
  { name: "Hariharan Karthikeyan", role: "Consultant" },
  { name: "Hrithik Bhat", role: "Consultant" },
  { name: "J.T. Faircloth", role: "Manager, Application Services" },
  { name: "Le'Donna Dewberry", role: "Representative II, Application Support" },
  { name: "Lindsay Lawsure", role: "Sr. Specialist I, Tech Support" },
  { name: "Prabhasini Das", role: "Specialist I, Client Support" }
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

const normalizeText = (value) => value.trim().replace(/\s+/g, " ");

const buildNameRain = () => {
  if (!nameRain) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const lanes = [3, 11, 19, 27, 36, 45, 54, 63, 72, 81, 89, 14, 32, 50, 68, 86];

  teamMembers.forEach((member, index) => {
    const tag = document.createElement("span");
    const name = document.createElement("strong");
    const role = document.createElement("small");
    const lane = lanes[index % lanes.length];
    const duration = 13 + (index % 5) * 1.7;
    const delay = index * 0.72;
    const drift = index % 2 === 0 ? 5 + (index % 4) : -5 - (index % 4);

    tag.className = "name-tag";
    tag.style.setProperty("--name-left", `${lane}%`);
    tag.style.setProperty("--name-duration", `${duration}s`);
    tag.style.setProperty("--name-delay", `${delay}s`);
    tag.style.setProperty("--name-drift", `${drift}vw`);
    tag.style.setProperty("--name-scale", String(0.88 + (index % 4) * 0.04));

    name.textContent = member.name;
    role.textContent = member.role;
    tag.append(name, role);
    fragment.append(tag);
  });

  nameRain.replaceChildren(fragment);
};
const setMeetingDetails = (guest, topic) => {
  const guestText = normalizeText(guest) || "TBA";
  const topicText = normalizeText(topic) || "Today's focus";

  if (guestLine) {
    guestLine.textContent = `Guest speaker: ${guestText}`;
  }

  if (topicLine) {
    topicLine.textContent = `Topic: ${topicText}`;
  }

  if (guestInput) {
    guestInput.value = guestText === "TBA" ? "" : guestText;
  }

  if (topicInput) {
    topicInput.value = topicText === "Today's focus" ? "" : topicText;
  }
};

const loadMeetingDetails = () => {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("guest") || window.localStorage.getItem(STORAGE_KEYS.guest) || "";
  const topic = params.get("topic") || window.localStorage.getItem(STORAGE_KEYS.topic) || "";
  setMeetingDetails(guest, topic);
};

const saveMeetingDetails = () => {
  const guest = normalizeText(guestInput?.value || "");
  const topic = normalizeText(topicInput?.value || "");

  if (guest) {
    window.localStorage.setItem(STORAGE_KEYS.guest, guest);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.guest);
  }

  if (topic) {
    window.localStorage.setItem(STORAGE_KEYS.topic, topic);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.topic);
  }

  setMeetingDetails(guest, topic);
  hideSetupPanel();
  showNote("Guest speaker and topic updated.");
};

const showSetupPanel = () => {
  if (!setupPanel) {
    return;
  }

  setupPanel.hidden = false;
  stage?.classList.add("is-setup-open");
  window.setTimeout(() => guestInput?.focus(), 0);
};

const hideSetupPanel = () => {
  if (!setupPanel) {
    return;
  }

  setupPanel.hidden = true;
  stage?.classList.remove("is-setup-open");
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
  ticketCycleTimer = window.setInterval(cycleTickets, 2700);
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

const restartAnimation = () => {
  if (!stage) {
    return;
  }

  hideSetupPanel();
  window.clearTimeout(completionTimer);
  stage.classList.remove("is-playing", "is-complete");
  void stage.offsetWidth;
  stage.classList.add("is-playing");
  startTicketCycle();

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

const trackSetupSequence = (event) => {
  const target = event.target;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return;
  }

  if (event.key === "Escape") {
    hideSetupPanel();
    commandBuffer = "";
    return;
  }
  if (
    event.key.toLowerCase() === SETUP_SHORTCUT.key &&
    event.ctrlKey === SETUP_SHORTCUT.ctrlKey &&
    event.altKey === SETUP_SHORTCUT.altKey
  ) {
    event.preventDefault();
    showSetupPanel();
    commandBuffer = "";
    return;
  }

  if (event.key.length !== 1) {
    return;
  }

  commandBuffer = `${commandBuffer}${event.key.toLowerCase()}`.slice(-SETUP_SEQUENCE.length);

  if (commandBuffer === SETUP_SEQUENCE) {
    showSetupPanel();
    commandBuffer = "";
  }
};

buildNameRain();
loadMeetingDetails();
cycleTickets();

if (startButton) {
  startButton.addEventListener("click", startIntro);
}

if (setupPanel) {
  setupPanel.addEventListener("submit", (event) => {
    event.preventDefault();
    saveMeetingDetails();
  });
}

if (closeSetupButton) {
  closeSetupButton.addEventListener("click", hideSetupPanel);
}

if (audio) {
  audio.addEventListener("ended", finishIntro);
}

document.addEventListener("keydown", trackSetupSequence);
