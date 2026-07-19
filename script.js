const SETUP_SEQUENCE = "codyfix";
const SETUP_SHORTCUT = { key: "f", ctrlKey: true, altKey: true };
const STORAGE_KEYS = {
  guest: "fridayFixathonGuest",
  topic: "fridayFixathonTopic",
  date: "fridayFixathonDate",
  agenda: "fridayFixathonAgenda"
};

const stage = document.querySelector("[data-stage]");
const startButton = document.querySelector("[data-start-intro]");
const audio = document.querySelector("[data-intro-audio]");
const audioNote = document.querySelector("[data-audio-note]");
const setupPanel = document.querySelector("[data-setup-panel]");
const guestInput = document.querySelector("[data-guest-input]");
const topicInput = document.querySelector("[data-topic-input]");
const dateInput = document.querySelector("[data-date-input]");
const agendaInput = document.querySelector("[data-agenda-input]");
const closeSetupButton = document.querySelector("[data-close-setup]");
const useTodayButton = document.querySelector("[data-use-today]");
const guestLine = document.querySelector("[data-guest-line]");
const topicLine = document.querySelector("[data-topic-line]");
const dateLine = document.querySelector("[data-date-line]");
const agendaButton = document.querySelector("[data-toggle-agenda]");
const agendaPanel = document.querySelector("[data-agenda-panel]");
const agendaList = document.querySelector("[data-agenda-list]");
const closeAgendaButton = document.querySelector("[data-close-agenda]");
const ticketCards = Array.from(document.querySelectorAll("[data-ticket-card]"));
const nameRain = document.querySelector("[data-name-rain]");
const championList = document.querySelector("[data-champion-list]");
const championsPad = document.querySelector(".champions-pad");

let completionTimer = null;
let ticketCycleTimer = null;
let waitingForFinishClick = false;
let ticketCycleIndex = 0;
let commandBuffer = "";
let setupTapCount = 0;
let setupTapTimer = null;

const FALLBACK_DURATION_MS = 18000;

const ticketThemes = [
  { title: "CCD Troubleshooting", meta: "Troubleshooting Practice", status: "Signal Found" },
  { title: "Case Queue Management", meta: "Workflow Coaching", status: "Workflow Improved" },
  { title: "Effective Salesforce Searching", meta: "Search Strategy", status: "Knowledge Shared" },
  { title: "Linked Accounts Review", meta: "Knowledge Transfer", status: "Knowledge Shared" },
  { title: "Luma Deep Dive", meta: "Deep Dive Learning", status: "Deep Dive Complete" },
  { title: "CCD Routing Review", meta: "Root Cause Review", status: "RCA Reviewed" },
  { title: "Queue Ownership Review", meta: "Process Alignment", status: "Process Aligned" },
  { title: "Salesforce Search Filters", meta: "Search Strategy", status: "Search Sharpened" },
  { title: "Linked Account Cleanup", meta: "Knowledge Transfer", status: "Knowledge Shared" },
  { title: "Luma Sync Follow-up", meta: "Partnered Learning", status: "Learning Shared" }
];

const teamMembers = [
  { name: "Alysen", role: "Support Representative" },
  { name: "Cody", role: "Support Representative" },
  { name: "Demetrius", role: "Support Representative" },
  { name: "Eric", role: "Support Representative" },
  { name: "Jessica", role: "Director" },
  { name: "Matthew", role: "Support Representative" },
  { name: "Sandeep", role: "Manager" },
  { name: "Deepak", role: "Support Representative" },
  { name: "Dhanigonda", role: "Support Representative" },
  { name: "Gray", role: "Support Representative" },
  { name: "Hariharan", role: "Support Representative" },
  { name: "Hrithik", role: "Support Representative" },
  { name: "J.T.", role: "Support Representative" },
  { name: "Le'Donna", role: "Support Representative" },
  { name: "Lindsay", role: "Support Representative" },
  { name: "Prabhasini", role: "Support Representative" }
];

const championMembers = [
  ...teamMembers.slice(4, 5),
  ...teamMembers.slice(0, 4),
  ...teamMembers.slice(5)
];


const championReactionAssets = [
  "assets/facebook-reaction-like.png",
  "assets/facebook-reactions-heart.png",
  "assets/facebook-reaction-fires.png"
];

const defaultGuest = "[Name Here]";
const defaultTopic = "[Topic here]";
const defaultDate = "2026-07-24";

const defaultAgenda = [
  "Welcome and meeting focus",
  "Advanced Salesforce search techniques",
  "Finding accounts, contacts, and cases faster",
  "Using filters and keywords to narrow results",
  "Support documentation and KB follow-up",
  "Open questions and next steps"
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

const buildChampionTicker = () => {
  if (!championList) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const tickerItems = [...championMembers, ...championMembers];

  tickerItems.forEach((member, index) => {
    const item = document.createElement("span");
    const name = document.createElement("strong");
    const role = document.createElement("small");
    const badge = document.createElement("span");

    item.className = "champion-item";
    badge.className = "champion-badge";
    name.textContent = member.name;
    role.textContent = member.role;
    badge.innerHTML = "&#9733;&#9733;&#9733;&#9733;&#9733;";
    item.append(name, badge, role);
    fragment.append(item);
  });

  championList.replaceChildren(fragment);
};
const buildNameRain = () => {
  if (!nameRain) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const isCompact = window.matchMedia("(max-width: 820px)").matches;
  const lanes = isCompact
    ? [24, 38, 52, 66, 76, 30, 46, 60, 72, 34, 50, 64, 28, 42, 56, 70]
    : [3, 11, 19, 27, 36, 45, 54, 63, 72, 81, 89, 14, 32, 50, 68, 86];

  teamMembers.forEach((member, index) => {
    const tag = document.createElement("span");
    const name = document.createElement("strong");
    const role = document.createElement("small");
    const lane = lanes[index % lanes.length];
    const duration = 13 + (index % 5) * 1.7;
    const delay = index * 0.72;
    const drift = isCompact ? (index % 2 === 0 ? 2 + (index % 3) : -2 - (index % 3)) : (index % 2 === 0 ? 5 + (index % 4) : -5 - (index % 4));

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
const getTodayValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 10);
};

const formatMeetingDate = (dateValue) => {
  const value = dateValue || defaultDate;
  const parsed = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "Today";
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

const parseAgendaItems = (value) => value
  .split(/\r?\n|\|/)
  .map(normalizeText)
  .filter(Boolean);

const resolveAgendaItems = (items) => (items.length ? items : defaultAgenda);

const renderAgenda = (items) => {
  if (!agendaList) {
    return;
  }

  const fragment = document.createDocumentFragment();

  resolveAgendaItems(items).forEach((item) => {
    const agendaItem = document.createElement("li");
    agendaItem.textContent = item;
    fragment.append(agendaItem);
  });

  agendaList.replaceChildren(fragment);
};

const setMeetingDetails = (guest, topic, dateValue, agendaItems) => {
  const guestText = normalizeText(guest) || defaultGuest;
  const topicText = normalizeText(topic) || defaultTopic;
  const meetingDate = dateValue || defaultDate;
  const agenda = Array.isArray(agendaItems) ? agendaItems : parseAgendaItems(agendaItems || "");

  if (guestLine) {
    guestLine.textContent = `Presenter: ${guestText}`;
  }

  if (topicLine) {
    topicLine.textContent = `Topic: ${topicText}`;
  }

  if (dateLine) {
    dateLine.textContent = `Date: ${formatMeetingDate(meetingDate)}`;
  }

  if (guestInput) {
    guestInput.value = guestText === defaultGuest ? "" : guestText;
  }

  if (topicInput) {
    topicInput.value = topicText === defaultTopic ? "" : topicText;
  }

  if (dateInput) {
    dateInput.value = meetingDate;
  }

  if (agendaInput) {
    agendaInput.value = resolveAgendaItems(agenda).join("\n");
  }

  renderAgenda(agenda);
};

const loadMeetingDetails = () => {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("guest") || window.localStorage.getItem(STORAGE_KEYS.guest) || "";
  const topic = params.get("topic") || window.localStorage.getItem(STORAGE_KEYS.topic) || "";
  const dateValue = params.get("date") || window.localStorage.getItem(STORAGE_KEYS.date) || defaultDate;
  const agenda = params.get("agenda") || window.localStorage.getItem(STORAGE_KEYS.agenda) || "";
  setMeetingDetails(guest, topic, dateValue, parseAgendaItems(agenda));
};

const saveMeetingDetails = () => {
  const guest = normalizeText(guestInput?.value || "");
  const topic = normalizeText(topicInput?.value || "");
  const dateValue = dateInput?.value || defaultDate;
  const agendaItems = parseAgendaItems(agendaInput?.value || "");

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

  if (dateValue) {
    window.localStorage.setItem(STORAGE_KEYS.date, dateValue);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.date);
  }

  if (agendaItems.length) {
    window.localStorage.setItem(STORAGE_KEYS.agenda, agendaItems.join("\n"));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.agenda);
  }

  setMeetingDetails(guest, topic, dateValue, agendaItems);
  hideSetupPanel();
  showNote("Meeting details and agenda updated.");
};

const showAgendaPanel = () => {
  if (!agendaPanel) {
    return;
  }

  agendaPanel.hidden = false;
  stage?.classList.add("is-agenda-open");
};

const hideAgendaPanel = () => {
  if (!agendaPanel) {
    return;
  }

  agendaPanel.hidden = true;
  stage?.classList.remove("is-agenda-open");
};

const toggleAgendaPanel = () => {
  if (!agendaPanel) {
    return;
  }

  if (agendaPanel.hidden) {
    showAgendaPanel();
  } else {
    hideAgendaPanel();
  }
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
  ticketCycleIndex = 0;
};

const stopTicketCycle = () => {
  window.clearInterval(ticketCycleTimer);
  ticketCycleTimer = null;
};

const waitForFinishClick = () => {
  if (!stage || waitingForFinishClick || stage.classList.contains("is-complete")) {
    return;
  }

  window.clearTimeout(completionTimer);
  completionTimer = null;
  stopTicketCycle();
  waitingForFinishClick = true;
  stage.classList.add("is-awaiting-replay");

  if (startButton) {
    startButton.hidden = false;
    startButton.textContent = "Reload";
  }
};
const restartAnimation = () => {
  if (!stage) {
    return;
  }

  hideSetupPanel();
  hideAgendaPanel();
  waitingForFinishClick = false;
  window.clearTimeout(completionTimer);
  stage.classList.remove("is-playing", "is-complete", "is-awaiting-replay");
  void stage.offsetWidth;
  stage.classList.add("is-playing");

  if (startButton) {
    startButton.hidden = true;
    startButton.textContent = "Start fixing";
  }

  startTicketCycle();

  completionTimer = window.setTimeout(waitForFinishClick, getIntroDuration());
};

const startIntro = async () => {
  if (stage?.classList.contains("is-awaiting-replay")) {
    window.location.reload();
    return;
  }

  if (startButton) {
    startButton.hidden = true;
    startButton.textContent = "Start fixing";
  }

  restartAnimation();

  if (!audio) {
    return;
  }

  try {
    audio.currentTime = 0;
    await audio.play();
    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(waitForFinishClick, getIntroDuration());
  } catch (error) {
    if (startButton) {
      startButton.hidden = false;
    }
    showNote(audio.error ? "MP3 not found. Check assets/friday-fixathon-intro.mp3." : "Animation is playing. If music does not start, click Start fixing directly in the browser.");
  }
};

const handleStartTouch = (event) => {
  event.preventDefault();
  startIntro();
};

const spawnChampionReaction = (event) => {
  if (!stage?.classList.contains("is-playing")) {
    return;
  }

  const reaction = document.createElement("img");
  const drift = `${Math.round((Math.random() * 80) - 40)}px`;
  const asset = championReactionAssets[Math.floor(Math.random() * championReactionAssets.length)];

  reaction.className = "champion-reaction";
  reaction.src = asset;
  reaction.alt = "Support champion reaction";
  reaction.decoding = "async";
  reaction.style.left = `${event.clientX}px`;
  reaction.style.top = `${event.clientY}px`;
  reaction.style.setProperty("--reaction-drift", drift);
  document.body.append(reaction);
  window.setTimeout(() => reaction.remove(), 1000);
};
const trackMobileSetupTap = (event) => {
  if (!window.matchMedia("(max-width: 820px)").matches || !startButton || !stage) {
    return;
  }

  const target = event.target;

  if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return;
  }

  const rect = startButton.getBoundingClientRect();
  const tapX = event.clientX;
  const tapY = event.clientY;
  const withinHiddenZone = tapX >= rect.left && tapX <= rect.right && tapY >= rect.top - 96 && tapY <= rect.top - 12;

  if (!withinHiddenZone) {
    setupTapCount = 0;
    return;
  }

  setupTapCount += 1;
  window.clearTimeout(setupTapTimer);
  setupTapTimer = window.setTimeout(() => {
    setupTapCount = 0;
  }, 2200);

  if (setupTapCount >= 6) {
    setupTapCount = 0;
    window.clearTimeout(setupTapTimer);
    showSetupPanel();
  }
};
const trackSetupSequence = (event) => {
  const target = event.target;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return;
  }

  if (event.key === "Escape") {
    hideSetupPanel();
    hideAgendaPanel();
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

buildChampionTicker();
buildNameRain();
loadMeetingDetails();
if (startButton) {
  startButton.addEventListener("click", startIntro);
  startButton.addEventListener("touchend", handleStartTouch, { passive: false });
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

if (useTodayButton) {
  useTodayButton.addEventListener("click", () => {
    if (dateInput) {
      dateInput.value = getTodayValue();
      dateInput.focus();
    }
  });
}

if (agendaButton) {
  agendaButton.addEventListener("click", toggleAgendaPanel);
}

if (closeAgendaButton) {
  closeAgendaButton.addEventListener("click", hideAgendaPanel);
}

if (championsPad) {
  championsPad.addEventListener("click", spawnChampionReaction);
}

if (audio) {
  audio.addEventListener("ended", waitForFinishClick);
}

document.addEventListener("keydown", trackSetupSequence);
stage?.addEventListener("pointerup", trackMobileSetupTap);
