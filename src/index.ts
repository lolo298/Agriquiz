import "./global.css";
import "./style.css";
import Chart from "chart.js/auto";

const infos = document.querySelector("#infos") as HTMLDivElement;

const canvas = document.querySelector("#myChart") as HTMLCanvasElement;

const myChart = new Chart(canvas, {
  type: "doughnut",
  data: {
    datasets: [
      {
        label: "# of Votes",
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
        display: false
      },
      x: {
        display: false
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }
});
