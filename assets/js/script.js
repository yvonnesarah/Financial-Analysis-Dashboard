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

// ================= STATE =================
let chart;
let sortAsc = true;
let chartType = "line";

// ================= INIT =================
const yearFilter = document.getElementById("yearFilter");
const years = [...new Set(finances.map(f => f[0].split("-")[1]))];

years.forEach(y => {
  let opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearFilter.appendChild(opt);
});

// Theme persistence
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// ================= EVENTS =================
yearFilter.addEventListener("change", runAnalysis);

document.getElementById("searchBox").addEventListener("input", runAnalysis);

document.getElementById("chartType").addEventListener("change", e => {
  chartType = e.target.value;
  runAnalysis();
});

document.getElementById("sortBtn").onclick = () => {
  sortAsc = !sortAsc;
  runAnalysis();
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

// ================= ANIMATION =================
function animateValue(id, end, duration = 600) {
  const el = document.getElementById(id);
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    let progress = Math.min((timestamp - startTime) / duration, 1);
    let value = Math.floor(progress * end);

    el.textContent = `$${value.toLocaleString()}`;

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ================= MAIN =================
function runAnalysis() {
  const selectedYear = yearFilter.value;
  const search = document.getElementById("searchBox").value.toLowerCase();

  let filtered = finances.filter(f => {
    const matchYear = selectedYear === "all" || f[0].includes(selectedYear);
    const matchSearch = f[0].toLowerCase().includes(search);
    return matchYear && matchSearch;
  });

  if (filtered.length === 0) {
    document.getElementById("insights").innerHTML = "No data found";
    return;
  }

  // sort
  filtered.sort((a, b) =>
    sortAsc ? a[1] - b[1] : b[1] - a[1]
  );

  let netTotal = 0;
  let changes = [];
  let best = ["", -Infinity];
  let worst = ["", Infinity];

  for (let i = 0; i < filtered.length; i++) {
    let val = filtered[i][1];
    netTotal += val;

    if (val > best[1]) best = filtered[i];
    if (val < worst[1]) worst = filtered[i];

    if (i > 0) changes.push(val - filtered[i - 1][1]);
  }

  let avg = changes.length
    ? changes.reduce((a, b) => a + b, 0) / changes.length
    : 0;

  let returns = filtered.map((f, i) =>
    i === 0 ? 0 : f[1] - filtered[i - 1][1]
  );

  let volatility = Math.sqrt(
    returns.reduce((a, b) => a + b * b, 0) / returns.length
  );

  let growthRate =
    ((filtered[filtered.length - 1][1] - filtered[0][1]) /
      filtered[0][1]) * 100;

  document.getElementById("months").textContent = filtered.length;

  animateValue("total", netTotal);
  animateValue("average", avg);

  document.getElementById("bestMonth").textContent =
    `${best[0]} ($${best[1].toLocaleString()})`;

  document.getElementById("worstMonth").textContent =
    `${worst[0]} ($${worst[1].toLocaleString()})`;

  document.getElementById("insights").innerHTML =
    generateInsights(filtered) +
    `<div>📊 Volatility: ${Math.round(volatility).toLocaleString()}</div>
     <div>📈 Growth: ${growthRate.toFixed(2)}%</div>`;

  renderChart(filtered);
}

// ================= INSIGHTS =================
function generateInsights(data) {
  let out = [];

  for (let i = 1; i < data.length; i++) {
    let diff = data[i][1] - data[i - 1][1];

    if (diff > 600000) out.push(`🚀 Growth in ${data[i][0]}`);
    if (diff < -600000) out.push(`⚠️ Drop in ${data[i][0]}`);
  }

  out.push(data[data.length - 1][1] > data[0][1]
    ? "📈 Upward trend overall"
    : "📉 Downward trend overall");

  return out.map(i => `<div>${i}</div>`).join("");
}

// ================= CHART =================
function renderChart(data) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: chartType,
    data: {
      labels: data.map(d => d[0]),
      datasets: [{
        label: "Profit/Loss",
        data: data.map(d => d[1]),
        borderWidth: 2
      }]
    }
  });
}

// ================= EXPORT =================
document.getElementById("exportBtn").onclick = () => {
  let csv = "Month,Value\n";
  finances.forEach(f => csv += `${f[0]},${f[1]}\n`);

  let blob = new Blob([csv], { type: "text/csv" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.csv";
  a.click();
};

document.getElementById("exportJsonBtn").onclick = () => {
  let blob = new Blob([JSON.stringify(finances, null, 2)], {
    type: "application/json"
  });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";
  a.click();
};

// ================= START =================
runAnalysis();