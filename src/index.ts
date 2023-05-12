import "./global.css";
import "./style.css";
// import Chart from "chart.js/auto";
import * as d3 from "d3";
let width = 450;
let height = 450;
let margin = 40;

function loadChart(data: Data[]) {
  console.log("loading chart ...");
  d3.select("#chartContainer svg").remove();
  const chart = d3
    .select("#chartContainer")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var radius = Math.min(width, height) / 2 - margin;

  const pie = d3.pie().value((d: any) => d.value);
  //@ts-ignore
  const data_ready = pie(data.sort((a, b) => a.value - b.value).reverse());

  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  chart
    .selectAll("allSlices")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("fill", () => getColorScheme(data.length))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .style("filter", "brightness(1)")
    .on("mousemove", (e, d) => {
      let tooltipWidth = document.querySelector("#chartContainer .tooltip")?.clientWidth || 0;
      let tooltipHeight = document.querySelector("#chartContainer .tooltip")?.clientHeight || 0;
      d3.select("#chartContainer .tooltip")
        .style("opacity", 1)
        //@ts-ignore
        .html(d.data.key + ": " + d.data.value.toFixed(2) + " kg CO2 eq/kg de produit")
        .style("left", e.pageX - tooltipWidth / 2 + "px")
        .style("top", e.pageY - tooltipHeight - 20 + "px");
      d3.select(e.target).transition().duration(200).style("filter", "brightness(1.4)");
    })
    .on("mouseout", (e, d) => {
      d3.select("#chartContainer .tooltip").style("opacity", 0);
      d3.select(e.target).transition().duration(200).style("filter", "brightness(1)");
    })
    .transition()
    .ease(d3.easeLinear)
    .delay((d, i) => i * 500)
    .duration(500)
    .attrTween("d", function (d: any, i): any {
      const interpolate = d3.interpolate(d.startAngle, d.endAngle);
      return function (t: any) {
        d.endAngle = interpolate(t);
        return arc(d);
      };
    });

  chart
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius * 0.6)
    .attr("fill", "var(--background-fake)")
    .attr("stroke", "white")
    .style("stroke-width", "2px");

  //animate the pie chart

  // const animatePie = () => {
  //   chart
  //     .selectAll("path")
  // .transition()
  // .delay((d, i) => i * 100)
  // .duration(500)
  // .attrTween("d", function (d: any, i): any {
  //   const interpolate = d3.interpolate(d.startAngle + 0.1, d.endAngle);
  //   return function (t: any) {
  //     d.endAngle = interpolate(t);
  //     return arc(d);
  //   };
  // });
  // };

  // animatePie();
}

document.querySelectorAll(".btnFilter").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    let target = e.target as HTMLButtonElement;
    let type = target.dataset.type;
    if (!type) return;
    let data = await loadData(type);
    console.log("data: ", data);
    // let data = [
    //   { key: "A", value: Math.round(Math.random() * 10) },
    //   { key: "B", value: Math.round(Math.random() * 10) },
    //   { key: "C", value: Math.round(Math.random() * 10) },
    //   { key: "D", value: Math.round(Math.random() * 10) },
    //   { key: "E", value: Math.round(Math.random() * 10) }
    // ];
    if (data == undefined) return;
    loadChart(data);
  });
});

async function init() {
  let tsv = await loadTsv();
  let types = ["viande", "Cereals", "fruits", "Dairy"];
  let fullData: { key: string; value: number }[] = [];
  for (const type of types) {
    let filteredData = tsv.filter((d) => {
      let name = d["Catégorie"];
      if (!name) return false;
      if (type == "viande") {
        return testType(name, "Bovine") || testType(name, "Ovine");
      }
      let test = testType(name, type);
      return test;
    });

    let returnData = filteredData.reduce((acc, d) => {
      let name = type;
      let val = d["Changement climatique"];
      let value = val != undefined ? parseFloat(val.replace(",", ".")) : 0;
      if (!val || !name) return acc;
      let index = acc.findIndex((a) => a.key === name);
      if (index === -1) {
        acc.push({
          key: name,
          value: value
        });
      } else {
        acc[index].value += value;
      }
      return acc;
    }, [] as { key: string; value: number }[]);
    fullData.push(...returnData);
  }
  loadChart(fullData);
}
init();

async function loadTsv() {
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

async function loadData(type: string): Promise<Data[] | undefined> {
  let types: string[];
  if (type === "viande") {
    types = ["Bovine", "Ovine"];
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
    let name = d["Nom du Produit en Français (traduction approximative GoogleTranslate)"];
    let val = d["Changement climatique"];
    let value = val != undefined ? parseFloat(val.replace(",", ".")) : 0;
    if (!val || !name) return { key: "", value: 0 };
    return {
      key: name,
      value: value
    };
  });
  return returnData;
}

function testType(name: string, type: string) {
  let regex = new RegExp(
    "\\b" + type + "(?=\\W)|(?<=\\W)" + type + "(?=\\W)|(?<=\\W)" + type + "\\b",
    "gi"
  );
  let res = regex.test(name);
  return res;
}

interface Data {
  key: string;
  value: number;
}

function getColorScheme(len: number) {
  console.log("len: ", len);
  return (
    "hsl(" +
    360 * Math.random() +
    "," +
    (60 + 40 * Math.random()) +
    "%," +
    (70 + 20 * Math.random()) +
    "%)"
  );
}

declare global {
  interface Window {
    tsv: d3.DSVRowArray<string>;
  }
}
