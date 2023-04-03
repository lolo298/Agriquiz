import "./global.css";
import "./start.css";
import Chart from "chart.js/auto";

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
  loadChart();
  const keyframes = { bottom: "0" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards"
  };
  popup.animate(keyframes, options);
}

function loadChart() {
  const canva = document.querySelector("#myChart") as HTMLCanvasElement;

  const config = {
    type: "bar" as "bar",
    data: {
      labels: ["A", "B", "C", "D", "E", "F"],
      datasets: [
        {
          label: "Nombre de réponses",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 206, 86)",
            "rgb(75, 192, 192)",
            "rgb(153, 102, 255)",
            "rgb(255, 159, 64 )"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      responsive: true
    }
  };
  const myChart = new Chart(canva, config);
}
