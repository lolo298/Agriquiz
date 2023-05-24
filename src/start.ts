import "./css/global.css";
import "./css/start.css";
import Chart from "chart.js/auto";
import { db } from "./utils/firebase";
import { ref } from "firebase/database";
import {
  findGetParameter,
  loadQuestions,
  loadTsv,
  testType,
} from "./utils/utils";

const answerSelected = [0, 0, 0];
const dbRef = ref(db, "saeweb4/");
let currentQuestionData: Question;

const btnValider = document.querySelector("#valider") as HTMLButtonElement;
const btnNext = document.querySelector("#next") as HTMLButtonElement;
const currentId = findGetParameter("q");
if (currentId) {
  btnNext.onclick = () => {
    if (parseInt(currentId) + 1 > 3) {
      window.location.href = `results.html`;
    } else {
      window.location.href = `start.html?q=${parseInt(currentId) + 1}`;
    }
  };
}

btnValider.disabled = true;
btnValider.addEventListener("click", handleAnswer);
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
  btnValider.disabled = false;
  answerSelected[answerIndex] = 1;
  const keyframes = { backgroundColor: "var(--card-selected)" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards",
  };
  answer.animate(keyframes, options);
}
function deselectAnswer(answer: Element, answerIndex: number) {
  answerSelected[answerIndex] = 0;

  const keyframes = { backgroundColor: "var(--card-color)" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards",
  };
  answer.animate(keyframes, options);
}

async function handleAnswer(e: Event) {
  console.log(e.target);
  const answerIndex = answerSelected.indexOf(1) + 1;
  if (answerIndex === currentQuestionData.res) {
    //good answer
    setGoodAnswer();
  } else {
    //bad answer
    setBadAnswer();
  }
  showPopup();
}

function setGoodAnswer() {
  const popup = document.querySelector(
    "#popup .popupContent"
  ) as HTMLDivElement;
  popup.querySelector("h2")!.innerHTML = "Bonne réponse";
  popup.querySelector(
    "p"
  )!.innerHTML = `Effectivement la bonne réponse était la réponse ${currentQuestionData.res}. <br> ${currentQuestionData.explication}`;

  const oldResults = localStorage.getItem("results");
  if (oldResults) {
    const results = JSON.parse(oldResults);
    results.good++;
    localStorage.setItem("results", JSON.stringify(results));
  } else {
    localStorage.setItem("results", JSON.stringify({ good: 1, bad: 0 }));
  }
}

function setBadAnswer() {
  const popup = document.querySelector(
    "#popup .popupContent"
  ) as HTMLDivElement;
  popup.querySelector("h2")!.innerHTML = "Mauvaise réponse";
  popup.querySelector(
    "p"
  )!.innerHTML = `Malheureusement la bonne réponse était la réponse ${currentQuestionData.res}. <br> ${currentQuestionData.explication}`;

  const oldResults = localStorage.getItem("results");
  if (oldResults) {
    const results = JSON.parse(oldResults);
    results.bad++;
    localStorage.setItem("results", JSON.stringify(results));
  } else {
    localStorage.setItem("results", JSON.stringify({ good: 0, bad: 1 }));
  }
}

function showPopup() {
  const popupWrapper = document.querySelector("#popup") as HTMLDivElement;
  const popup = document.querySelector(
    "#popup .popupContent"
  ) as HTMLDivElement;
  popupWrapper.style.display = "flex";
  loadChart();
  const keyframes = { bottom: "0" };
  const options = {
    duration: 200,
    easing: "ease-in-out",
    fill: "forwards" as "forwards",
  };
  popup.animate(keyframes, options);
}

async function loadChart() {
  const tsv = await loadTsv();

  const param = findGetParameter("q");
  if (!param) return;
  let filteredData;
  switch (param) {
    case "1":
      filteredData = tsv.filter((data) => {
        const name =
          data[
            "Nom du Produit en Français (traduction approximative GoogleTranslate)"
          ];
        if (!name) return false;
        return testType(name, ["Tomate", "Noix", "Colza"]);
      });
      break;
  }

  const dataChartKeys: string[] = [];
  const dataChartValues: number[] = [];
  filteredData!.forEach((data) => {
    const name =
      data[
        "Nom du Produit en Français (traduction approximative GoogleTranslate)"
      ];
    let val: string | number | undefined = data["Changement climatique"];
    if (!val) return;
    val = parseFloat(val.replace(",", "."));
    if (!name) return;
    const index = dataChartKeys.indexOf(name);
    if (index === -1) {
      dataChartKeys.push(name.split(",")[0]);
      dataChartValues.push(val);
    }
  });
  console.log(dataChartKeys, dataChartValues);

  const canva = document.querySelector("#myChart") as HTMLCanvasElement;

  const config = {
    type: "bar" as "bar",
    data: {
      labels: [...dataChartKeys],
      datasets: [
        {
          label: "Nombre de réponses",
          data: [...dataChartValues],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 206, 86)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      responsive: true,
    },
  };
  console.log(config);
  new Chart(canva, config);
}

loadQuestions(dbRef).then((data) => {
  if (!data) return;
  currentQuestionData = data;
});
