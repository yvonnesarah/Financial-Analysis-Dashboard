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

document.getElementById("chartType").onchange = e => {
  chartType = e.target.value;
  runAnalysis();
};

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

// ================= ANALYSIS =================
function runAnalysis() {
  const year = yearFilter.value;
  const search = document.getElementById("searchBox").value.toLowerCase();

  let filtered = finances.filter(f =>
    (year === "all" || f[0].includes(year)) &&
    f[0].toLowerCase().includes(search)
  );

  if (filtered.length === 0) return;

  filtered.sort((a, b) =>
    sortAsc ? a[1] - b[1] : b[1] - a[1]
  );

  let total = 0;
  let best = ["", -Infinity];
  let worst = ["", Infinity];

  for (let i = 0; i < filtered.length; i++) {
    let v = filtered[i][1];
    total += v;

    if (v > best[1]) best = filtered[i];
    if (v < worst[1]) worst = filtered[i];
  }

  let avg = total / filtered.length;

  document.getElementById("months").textContent = filtered.length;
  animateValue("total", total);
  animateValue("average", avg);

  document.getElementById("bestMonth").textContent =
    `${best[0]} ($${best[1].toLocaleString()})`;

  document.getElementById("worstMonth").textContent =
    `${worst[0]} ($${worst[1].toLocaleString()})`;

  document.getElementById("insights").innerHTML =
    generateInsights(filtered);

  renderChart(filtered);
}

// ================= INSIGHTS =================
function generateInsights(data) {
  let insights = [];

  // ================= BASIC TREND =================
  let start = data[0][1];
  let end = data[data.length - 1][1];
  let trendStrength = ((end - start) / Math.abs(start)) * 100;

  insights.push(
    trendStrength > 0
      ? `📈 Upward trend: +${trendStrength.toFixed(2)}% overall growth`
      : `📉 Downward trend: ${trendStrength.toFixed(2)}% decline`
  );

  // ================= VOLATILITY =================
  let changes = data.map((d, i) =>
    i === 0 ? 0 : d[1] - data[i - 1][1]
  );

  let volatility = Math.sqrt(
    changes.reduce((a, b) => a + b * b, 0) / changes.length
  );

  let risk =
    volatility > 800000 ? "🔴 High risk"
    : volatility > 400000 ? "🟠 Medium risk"
    : "🟢 Low risk";

  insights.push(`⚠️ Risk level: ${risk}`);

  // ================= CONSISTENCY =================
  let positive = changes.filter(c => c > 0).length;
  let consistency = (positive / changes.length) * 100;

  insights.push(`📊 Positive months: ${consistency.toFixed(1)}% consistency`);

  // ================= BEST / WORST STREAK =================
  let bestStreak = 0, worstStreak = 0;
  let currentBest = 0, currentWorst = 0;

  for (let i = 1; i < changes.length; i++) {
    if (changes[i] > 0) {
      currentBest++;
      currentWorst = 0;
    } else if (changes[i] < 0) {
      currentWorst++;
      currentBest = 0;
    }

    bestStreak = Math.max(bestStreak, currentBest);
    worstStreak = Math.max(worstStreak, currentWorst);
  }

  insights.push(`🔥 Longest gain streak: ${bestStreak} months`);
  insights.push(`💥 Longest loss streak: ${worstStreak} months`);

  // ================= MOMENTUM =================
  let recent = data.slice(-6).map(d => d[1]);
  let earlier = data.slice(0, 6).map(d => d[1]);

  let recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  let earlyAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

  let momentum = ((recentAvg - earlyAvg) / earlyAvg) * 100;

  insights.push(
    momentum > 0
      ? `⚡ Positive momentum: +${momentum.toFixed(2)}% (recent vs early)`
      : `⚡ Negative momentum: ${momentum.toFixed(2)}% slowdown`
  );

  // ================= DRAWDOWN =================
  let peak = -Infinity;
  let maxDrawdown = 0;

  for (let i = 0; i < data.length; i++) {
    peak = Math.max(peak, data[i][1]);
    let drawdown = ((peak - data[i][1]) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  insights.push(`📉 Max drawdown: ${maxDrawdown.toFixed(2)}%`);

  // ================= SUMMARY =================
  insights.push(
    trendStrength > 20 && consistency > 60
      ? "🧠 Summary: Strong, stable growth pattern"
      : trendStrength < -20 && volatility > 600000
      ? "🧠 Summary: High-risk declining market"
      : "🧠 Summary: Mixed signals, moderate uncertainty"
  );

  return insights.map(i => `<div>${i}</div>`).join("");
}

// ================= CHART =================
function renderChart(data) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: chartType,
    data: {
      labels: data.map(d => d[0]),
      datasets: [{
        label: "Value",
        data: data.map(d => d[1]),
        borderWidth: 2
      }]
    }
  });
}

// ================= ANIMATION =================
function animateValue(id, end, duration = 600) {
  const el = document.getElementById(id);
  let startTime = null;

  function step(t) {
    if (!startTime) startTime = t;
    let p = Math.min((t - startTime) / duration, 1);
    el.textContent = `$${Math.floor(p * end).toLocaleString()}`;
    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
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
  let blob = new Blob([JSON.stringify(finances)], {
    type: "application/json"
  });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";
  a.click();
};

// ================= START =================
runAnalysis();