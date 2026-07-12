const stage = document.querySelector("[data-stage]");
const startButton = document.querySelector("[data-start-intro]");
const audio = document.querySelector("[data-intro-audio]");
const audioNote = document.querySelector("[data-audio-note]");

let completionTimer = null;

const showNote = (message) => {
  if (!audioNote) {
    return;
  }

  audioNote.textContent = message;
  audioNote.classList.add("is-visible");
  window.setTimeout(() => audioNote.classList.remove("is-visible"), 3600);
};

const restartAnimation = () => {
  if (!stage) {
    return;
  }

  window.clearTimeout(completionTimer);
  stage.classList.remove("is-playing", "is-complete");
  void stage.offsetWidth;
  stage.classList.add("is-playing");

  completionTimer = window.setTimeout(() => {
    stage.classList.add("is-complete");
    if (startButton) {
      startButton.textContent = "Replay intro";
    }
  }, 5200);
};

const startIntro = async () => {
  restartAnimation();

  if (!audio) {
    return;
  }

  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    showNote("Animation is playing. Add your MP3 at assets/friday-fixathon-intro.mp3 when ready.");
  }
};

if (startButton) {
  startButton.addEventListener("click", startIntro);
}
