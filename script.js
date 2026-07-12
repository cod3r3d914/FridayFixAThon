const stage = document.querySelector("[data-stage]");
const startButton = document.querySelector("[data-start-intro]");
const audio = document.querySelector("[data-intro-audio]");
const audioNote = document.querySelector("[data-audio-note]");
const counters = Array.from(document.querySelectorAll("[data-counter]"));

let completionTimer = null;
let counterFrame = null;

const FALLBACK_DURATION_MS = 18000;

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

const finishIntro = () => {
  if (!stage) {
    return;
  }

  window.clearTimeout(completionTimer);
  completionTimer = null;
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
  const duration = 6200;

  counters.forEach((counter) => {
    counter.textContent = "0";
  });

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    counters.forEach((counter) => {
      const target = Number(counter.dataset.target || 0);
      counter.textContent = String(Math.round(target * eased));
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

if (startButton) {
  startButton.addEventListener("click", startIntro);
}

if (audio) {
  audio.addEventListener("ended", finishIntro);
}