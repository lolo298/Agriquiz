import "./css/global.css";
import "./css/results.css";

const results = JSON.parse(localStorage.getItem("results") || "{}") as {
  good: number;
  bad: number;
};
const title = document.querySelector("h2") as HTMLHeadingElement;
const res = document.querySelector("h4") as HTMLHeadingElement;
const retry = document.querySelector("#retry") as HTMLButtonElement;
const goback = document.querySelector("#goback") as HTMLButtonElement;

retry.onclick = handleRetry;
goback.onclick = handleGoBack;

const good = results.good || 0;
const bad = results.bad || 0;

res!.textContent = `${good} / 3`;

if (good === 0) {
  title!.textContent =
    "Tu as encore du chemin à parcourir, mais ne t’inquiètes pas, tu vas y arriver !";
}

if (good === 1) {
  title!.textContent =
    "C’est un bon début, mais c’est pas encore ça. Il va falloir travailler encore un peu !";
}
if (good === 2) {
  title!.textContent =
    "Ca commence à être pas mal, mais tu peux encore progresser un peu. Courage, on croit en toi ! ";
}

if (good === 3) {
  title!.textContent =
    "Bravo ! Tu as réussi le test haut la main ! Tu peux être fier de toi ! ";
}

function handleGoBack() {
  window.location.href = "/";
}

function handleRetry() {
  localStorage.setItem("results", JSON.stringify({ good: 0, bad: 0 }));
  window.location.href = "/start.html?q=1";
}
