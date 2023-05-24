import { DatabaseReference } from "@firebase/database";
import * as d3 from "d3";

export async function loadTsv() {
  if (!window.tsv) {
    let res = await fetch(`/AGRIBALYSE3.1_bio_simplifie.tsv`);
    let data = await res.text();
    var tsv = d3.tsvParse(data);
    window.tsv = tsv;
  } else {
    var tsv = window.tsv;
  }
  return tsv;
}

export async function loadData(type: string): Promise<DataChart[] | undefined> {
  let types: string[];
  if (type === "viande") {
    types = ["Bovine", "Ovine"];
  } else if (type === "all") {
    types = ["viande", "Cereals", "fruits", "Dairy"];
  } else {
    types = [type];
  }
  console.log("types: ", types);
  let tsv = await loadTsv();

  let filteredData = tsv.filter((d) => {
    let name = d["Catégorie"];
    //@ts-ignore
    let test = types.some((t) => testType(name, t));
    return test;
  });
  let returnData = filteredData.map((d) => {
    let name =
      d[
        "Nom du Produit en Français (traduction approximative GoogleTranslate)"
      ];
    let val = d["Changement climatique"];
    let value = val != undefined ? parseFloat(val.replace(",", ".")) : 0;
    if (!val || !name) return { key: "", value: 0 };
    return {
      key: name,
      value: value,
    };
  });
  return returnData;
}

export function testType(name: string, type: string | string[]): boolean {
  if (Array.isArray(type)) {
    return type.some((t) => testType(name, t));
  }
  let regex = new RegExp(
    "\\b" +
      type +
      "(?=\\W)|(?<=\\W)" +
      type +
      "(?=\\W)|(?<=\\W)" +
      type +
      "\\b",
    "gi"
  );
  let res = regex.test(name);
  return res;
}

export async function loadQuestions(
  dbRef: DatabaseReference
): Promise<Question | undefined> {
  const { get, child } = await import("firebase/database");
  const questionsRef = child(dbRef, "questions");

  const snapshot = await get(questionsRef);
  if (snapshot.exists()) {
    const cards = document.querySelectorAll(".card");
    const data = snapshot.val() as DataDB;
    const param = findGetParameter("q");
    const currentQuestion = parseInt(param || "1");

    if (
      (!isNaN(currentQuestion) && currentQuestion > 3) ||
      currentQuestion < 1
    ) {
      window.location.href = "/?q=1";
    }
    document.querySelector(
      "header p"
    )!.textContent = `Question ${currentQuestion} / 3`;
    const currentQuestionData = data[`question${currentQuestion}`];
    const questionText = document.querySelector(
      ".question"
    ) as HTMLHeadingElement;
    console.log(currentQuestionData);
    questionText.textContent = currentQuestionData.question;

    for (const card of cards) {
      const resTxt = card.querySelector(".reponseText") as HTMLParagraphElement;
      const cardId = card.getAttribute("data-index");
      console.log(cardId);
      if (cardId === null) continue;
      resTxt.textContent = currentQuestionData.possible[parseInt(cardId) + 1];
    }

    for (const [iStr, question] of Object.entries(data)) {
      const i = parseInt(iStr.replace("question", ""));
      const card = document.querySelector(`[data-index="${i - 1}"]`);
      if (!(card instanceof HTMLDivElement)) continue;
    }
    return currentQuestionData;
  } else {
    console.warn("No data available");
  }
}

export function findGetParameter(parameterName: string) {
  var result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}
