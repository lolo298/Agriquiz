import "./global.css";
import "./start.css";

const answerSelected = [0, 0, 0];

document.querySelector("#valider")?.addEventListener("click", handleAnswer);
const answers = document.querySelectorAll(".card");
answers.forEach((answer) => {
  if (!(answer instanceof HTMLDivElement)) return;
  answer.addEventListener("click", (e) => {
    const answerAttr = answer.getAttribute("data-index");
    const answerIndex = parseInt(answerAttr || "0");
    const oldAnswer = answerSelected.indexOf(1);
    if (oldAnswer !== -1 && oldAnswer !== answerIndex) {
      deselectAnswer(answers[oldAnswer], oldAnswer);
    }
    selectAnswer(answer, answerIndex);
  });
});

function selectAnswer(answer: Element, answerIndex: number) {
  answerSelected[answerIndex] = 1;
  const keyframes = { backgroundColor: "var(--card-selected)" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards"
  };
  answer.animate(keyframes, options);
}
function deselectAnswer(answer: Element, answerIndex: number) {
  answerSelected[answerIndex] = 0;

  const keyframes = { backgroundColor: "var(--card-color)" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards"
  };
  answer.animate(keyframes, options);
}

function handleAnswer() {
  showPopup();
}

function showPopup() {
  const popupWrapper = document.querySelector("#popup") as HTMLDivElement;
  const popup = document.querySelector("#popup .popupContent") as HTMLDivElement;
  if (!popup) return;
  popupWrapper.style.display = "flex";
  const keyframes = { bottom: "0" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards"
  };
  popup.animate(keyframes, options);
}
