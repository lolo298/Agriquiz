import "./css/global.css";
import "./css/style.css";
// import Chart from "chart.js/auto";
import * as d3 from "d3";
import { loadData, loadTsv, testType } from "./utils/utils";
let width = 450;
let height = 450;
let margin = 40;
const chart = d3
  .select("#chartContainer")
  .append("svg")
  .attr("width", 500)
  .attr("height", 500)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

declare global {
  interface Window {
    tsv: d3.DSVRowArray<string>;
  }
}

function loadChart(data: DataChart[]) {
  console.log("loading chart ...");
  console.log(data);
  // d3.select("#chartContainer svg").remove();

  var radius = Math.min(width, height) / 2 - margin;

  const pie = d3.pie().value((d: any) => d.value);
  //@ts-ignore
  const data_ready = pie(data.sort((a, b) => a.value - b.value).reverse());

  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
  const chartData = chart.selectAll("path").data(data_ready, (d: any) => d.id);

  //remove the paths that are not in the new dataset
  chartData
    .exit()
    .transition()
    .duration(500)
    .ease(d3.easeLinear)
    .attrTween("d", function (d: any, i): any {
      //interpolate from the end to the start
      var interpolate = d3.interpolate(d.startAngle, d.endAngle);
      return function (t) {
        d.endAngle = interpolate(t);
        return arcGenerator(d);
      };
    })
    .remove();

  const chartPaths = chartData
    .enter()
    .append("path")
    .merge(chartData)
    .attr("fill", () => getColorScheme(data.length))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .style("filter", "brightness(1)");

  chartPaths
    .on("mousemove", (e, d) => {
      let tooltipWidth =
        document.querySelector("#chartContainer .tooltip")?.clientWidth || 0;
      let tooltipHeight =
        document.querySelector("#chartContainer .tooltip")?.clientHeight || 0;
      d3.select("#chartContainer .tooltip")
        .style("opacity", 1)
        //@ts-ignore
        .html(
          //@ts-ignore
          d.data.key +
            ": " +
            //@ts-ignore
            d.data.value.toFixed(2) +
            " kg CO2 eq/kg de produit"
        )
        .style("left", e.pageX - tooltipWidth / 2 + "px")
        .style("top", e.pageY - tooltipHeight - 20 + "px");
      d3.select(e.target)
        .transition()
        .duration(200)
        .style("filter", "brightness(1.4)");
    })
    .on("mouseout", (e, d) => {
      d3.select("#chartContainer .tooltip").style("opacity", 0);
      d3.select(e.target)
        .transition()
        .duration(200)
        .style("filter", "brightness(1)");
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

  chartData
    .exit()
    .transition()
    .duration(500)
    .ease(d3.easeLinear)
    .attrTween("d", function (d: any, i): any {
      const interpolate = d3.interpolate(d.endAngle, d.startAngle);
      return function (t: any) {
        return arc(interpolate(t));
      };
    })
    .remove();
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
  let fullData: DataChart[] = [];
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

    let returnData = filteredData.reduce((acc, d, i) => {
      let name = type;
      let val = d["Changement climatique"];
      let value = val != undefined ? parseFloat(val.replace(",", ".")) : 0;
      if (!val || !name) return acc;
      let index = acc.findIndex((a) => a.key === name);
      if (index === -1) {
        acc.push({
          key: name,
          id: i,
          value: value,
        });
      } else {
        acc[index].value += value;
      }
      return acc;
    }, [] as DataChart[]);
    fullData.push(...returnData);
  }
  loadChart(fullData);
}
init();

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
