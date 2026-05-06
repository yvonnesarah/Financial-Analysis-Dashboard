// ================= DATA =================
const finances = [
  ['Jan-2010', 867884], ['Feb-2010', 984655], ['Mar-2010', 322013],
  ['Apr-2010', -69417], ['May-2010', 310503], ['Jun-2010', 522857],
  ['Jul-2010', 1033096], ['Aug-2010', 604885], ['Sep-2010', -216386],
  ['Oct-2010', 477532], ['Nov-2010', 893810], ['Dec-2010', -80353],
  ['Jan-2011', 779806], ['Feb-2011', -335203], ['Mar-2011', 697845],
  ['Apr-2011', 793163], ['May-2011', 485070], ['Jun-2011', 584122],
  ['Jul-2011', 62729], ['Aug-2011', 668179], ['Sep-2011', 899906],
  ['Oct-2011', 834719], ['Nov-2011', 132003], ['Dec-2011', 309978],
  ['Jan-2012', -755566], ['Feb-2012', 1170593], ['Mar-2012', 252788],
  ['Apr-2012', 1151518], ['May-2012', 817256], ['Jun-2012', 570757],
  ['Jul-2012', 506702], ['Aug-2012', -1022534], ['Sep-2012', 475062],
  ['Oct-2012', 779976], ['Nov-2012', 144175], ['Dec-2012', 542494],
  ['Jan-2013', 359333], ['Feb-2013', 321469], ['Mar-2013', 67780],
  ['Apr-2013', 471435], ['May-2013', 565603], ['Jun-2013', 872480],
  ['Jul-2013', 789480], ['Aug-2013', 999942], ['Sep-2013', -1196225],
  ['Oct-2013', 268997], ['Nov-2013', -687986], ['Dec-2013', 1150461],
  ['Jan-2014', 682458], ['Feb-2014', 617856], ['Mar-2014', 824098],
  ['Apr-2014', 581943], ['May-2014', 132864], ['Jun-2014', 448062],
  ['Jul-2014', 689161], ['Aug-2014', 800701], ['Sep-2014', 1166643],
  ['Oct-2014', 947333], ['Nov-2014', 578668], ['Dec-2014', 988505],
  ['Jan-2015', 1139715], ['Feb-2015', 1029471], ['Mar-2015', 687533],
  ['Apr-2015', -524626], ['May-2015', 158620], ['Jun-2015', 87795],
  ['Jul-2015', 423389], ['Aug-2015', 840723], ['Sep-2015', 568529],
  ['Oct-2015', 332067], ['Nov-2015', 989499], ['Dec-2015', 778237],
  ['Jan-2016', 650000], ['Feb-2016', -1100387], ['Mar-2016', -174946],
  ['Apr-2016', 757143], ['May-2016', 445709], ['Jun-2016', 712961],
  ['Jul-2016', -1163797], ['Aug-2016', 569899], ['Sep-2016', 768450],
  ['Oct-2016', 102685], ['Nov-2016', 795914], ['Dec-2016', 60988],
  ['Jan-2017', 138230], ['Feb-2017', 671099]
];

// ================= SETUP =================
const yearFilter = document.getElementById("yearFilter");

// Populate dropdown
const years = [...new Set(finances.map(f => f[0].split("-")[1]))];
years.forEach(y => {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearFilter.appendChild(option);
});

yearFilter.addEventListener("change", runAnalysis);

let chart;

// ================= MAIN =================
function runAnalysis() {
  const selectedYear = yearFilter.value;

  let filtered = finances.filter(f =>
    selectedYear === "all" || f[0].includes(selectedYear)
  );

  let netTotal = 0;
  let changes = [];

  let bestMonth = ["", -Infinity];
  let worstMonth = ["", Infinity];

  for (let i = 0; i < filtered.length; i++) {
    let value = filtered[i][1];
    netTotal += value;

    if (value > bestMonth[1]) bestMonth = filtered[i];
    if (value < worstMonth[1]) worstMonth = filtered[i];

    if (i > 0) {
      changes.push(value - filtered[i - 1][1]);
    }
  }

  let avg = changes.length
    ? changes.reduce((a, b) => a + b, 0) / changes.length
    : 0;

  const forecast = generateForecast(filtered, 6);
  const movingAvg = calculateMovingAverage(filtered, 3);
  const insights = generateInsights(filtered);

  document.getElementById("months").textContent = filtered.length;
  document.getElementById("total").textContent = `$${netTotal.toLocaleString()}`;
  document.getElementById("average").textContent = `$${avg.toFixed(2)}`;
  document.getElementById("bestMonth").textContent =
    `${bestMonth[0]} ($${bestMonth[1].toLocaleString()})`;
  document.getElementById("worstMonth").textContent =
    `${worstMonth[0]} ($${worstMonth[1].toLocaleString()})`;

  document.getElementById("insights").innerHTML = insights;

  renderChart(filtered, movingAvg, forecast);
}

// ================= FORECAST =================
function generateForecast(data, monthsAhead) {
  let x = data.map((_, i) => i);
  let y = data.map(d => d[1]);

  let n = x.length;
  let sumX = x.reduce((a, b) => a + b, 0);
  let sumY = y.reduce((a, b) => a + b, 0);
  let sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  let sumXX = x.reduce((acc, val) => acc + val * val, 0);

  let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  let intercept = (sumY - slope * sumX) / n;

  let forecast = [];

  for (let i = 1; i <= monthsAhead; i++) {
    let nextX = n + i;
    let value = slope * nextX + intercept;

    forecast.push({
      label: `Forecast ${i}`,
      value: Math.round(value)
    });
  }

  return forecast;
}

// ================= MOVING AVG =================
function calculateMovingAverage(data, windowSize) {
  let result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      let slice = data.slice(i - windowSize + 1, i + 1);
      let avg =
        slice.reduce((sum, d) => sum + d[1], 0) / windowSize;
      result.push(avg);
    }
  }

  return result;
}

// ================= AI INSIGHTS =================
function generateInsights(data) {
  let insights = [];

  for (let i = 1; i < data.length; i++) {
    let change = data[i][1] - data[i - 1][1];

    if (change < -500000) {
      insights.push(`⚠️ Drop in ${data[i][0]} — possible expense spike.`);
    }

    if (change > 500000) {
      insights.push(`🚀 Growth in ${data[i][0]} — strong revenue.`);
    }
  }

  if (insights.length === 0) {
    insights.push("Stable financial trend.");
  }

  return insights.map(i => `<div>${i}</div>`).join("");
}

// ================= CHART =================
function renderChart(data, movingAvg, forecast) {
  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        ...data.map(d => d[0]),
        ...forecast.map(f => f.label)
      ],
      datasets: [
        {
          label: "Profit/Loss",
          data: [
            ...data.map(d => d[1]),
            ...forecast.map(f => f.value)
          ],
          tension: 0.3
        },
        {
          label: "Moving Average",
          data: [...movingAvg, ...Array(forecast.length).fill(null)],
          borderDash: [5, 5]
        }
      ]
    }
  });
}

// ================= DARK MODE =================
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ================= EXPORT =================
document.getElementById("exportBtn").addEventListener("click", () => {
  let csv = "Month,Profit/Loss\n";

  finances.forEach(f => {
    csv += `${f[0]},${f[1]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "financials.csv";
  a.click();
});

// Initial run
runAnalysis();