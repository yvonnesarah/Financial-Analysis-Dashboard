// ================= DATA =================
// Raw financial dataset: [Month-Year, Value]
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
// Holds UI + app state
let chart;          // Chart.js instance
let sortAsc = true; // Sorting direction toggle
let chartType = "line"; // Default chart type

// ================= INIT =================
// Dropdown for year filtering
const yearFilter = document.getElementById("yearFilter");

// Extract unique years from dataset
const years = [...new Set(finances.map(f => f[0].split("-")[1]))];

// Populate dropdown
yearFilter.innerHTML = `<option value="all">All</option>`;
years.forEach(y => {
  let opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearFilter.appendChild(opt);
});

// Restore saved dashboard state (filter + chart type)
const saved = JSON.parse(localStorage.getItem("dashboardState"));
if (saved) {
  yearFilter.value = saved.year || "all";
  chartType = saved.chartType || "line";
}

// Apply saved theme (dark/light)
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// ================= EVENTS =================

// Run analysis when year filter changes
yearFilter.onchange = runAnalysis;

// Change chart type (line/bar/etc.)
document.getElementById("chartType").onchange = e => {
  chartType = e.target.value;
  runAnalysis();
};

// Toggle sorting order (asc/desc)
document.getElementById("sortBtn").onclick = () => {
  sortAsc = !sortAsc;
  runAnalysis();
};

// Toggle dark/light theme and persist it
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

// Download chart as PNG image
document.getElementById("downloadChart").onclick = () => {
  const a = document.createElement("a");
  a.href = chart.toBase64Image();
  a.download = "chart.png";
  a.click();
};

// Simple AI-style summary stats popup
document.getElementById("aiSummary").onclick = () => {
  const values = finances.map(f => f[1]);
  const avg = values.reduce((a,b)=>a+b,0)/values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  alert(
    `📊 Avg: $${avg.toFixed(0)}\n📈 Max: $${max}\n📉 Min: $${min}`
  );
};

// ================= ANALYSIS =================
// Core function: filters data, computes stats, updates UI
function runAnalysis() {

  const year = yearFilter.value;

  // Filter data by selected year
  let filtered = finances.filter(f => {
    const [m, y] = f[0].split("-");
    return year === "all" || y === year;
  });

  // Sort values based on toggle
  filtered.sort((a,b) => sortAsc ? a[1]-b[1] : b[1]-a[1]);

  // Initialize stats
  let total = 0;
  let best = ["", -Infinity];
  let worst = ["", Infinity];

  // Compute total, best, worst
  for (let i = 0; i < filtered.length; i++) {
    let v = filtered[i][1];
    total += v;

    if (v > best[1]) best = filtered[i];
    if (v < worst[1]) worst = filtered[i];
  }

  let avg = total / filtered.length;

  // Update UI summary stats
  document.getElementById("months").textContent = filtered.length;
  animateValue("total", total);
  animateValue("average", avg);

  // Month-to-month change calculation
  let prev = filtered.length > 1 ? filtered[filtered.length - 2][1] : 0;
  let curr = filtered.length ? filtered[filtered.length - 1][1] : 0;
  let change = prev ? ((curr - prev) / prev) * 100 : 0;

  document.getElementById("change").textContent =
    change.toFixed(2) + "%";

  // Best / worst month display
  document.getElementById("bestMonth").textContent =
    `${best[0]} ($${best[1].toLocaleString()})`;

  document.getElementById("worstMonth").textContent =
    `${worst[0]} ($${worst[1].toLocaleString()})`;

  // Generate AI-style insights panel
  document.getElementById("insights").innerHTML =
    generateInsights(filtered);

  // Render chart with filtered data
  renderChart(filtered);

  // Save state to localStorage
  localStorage.setItem("dashboardState", JSON.stringify({
    year,
    chartType
  }));
}

// ================= INSIGHTS =================
// Generates business-style analytics insights
function generateInsights(data) {

  let insights = [];
  const values = data.map(d => d[1]);

  // Overall trend calculation
  let start = values[0];
  let end = values[values.length - 1];
  let trend = ((end - start) / Math.abs(start)) * 100;

  insights.push(
    trend > 0
      ? `📈 Overall Growth: +${trend.toFixed(2)}%`
      : `📉 Overall Decline: ${trend.toFixed(2)}%`
  );

  // Average value
  let avg = values.reduce((a,b)=>a+b,0)/values.length;
  insights.push(`📊 Average Value: $${avg.toLocaleString(undefined,{maximumFractionDigits:0})}`);

  // Volatility calculation
  let changes = values.map((v,i)=> i?Math.abs(v-values[i-1]):0);
  let volatility = Math.sqrt(changes.reduce((a,b)=>a+b*b,0)/changes.length);
  insights.push(`⚠️ Volatility Index: ${volatility.toFixed(0)}`);

  // Extremes
  let max = Math.max(...values);
  let min = Math.min(...values);

  insights.push(`🏆 Peak: $${max.toLocaleString()}`);
  insights.push(`📉 Lowest: $${min.toLocaleString()}`);

  // Momentum (recent vs early performance)
  let last6 = values.slice(-6);
  let first6 = values.slice(0,6);

  let momentum =
    ((last6.reduce((a,b)=>a+b,0)/last6.length -
      first6.reduce((a,b)=>a+b,0)/first6.length)
    / Math.abs(first6.reduce((a,b)=>a+b,0)/first6.length)) * 100;

  insights.push(
    momentum > 0
      ? `⚡ Momentum: +${momentum.toFixed(2)}%`
      : `⚡ Momentum: ${momentum.toFixed(2)}%`
  );

  // Consistency score
  let positive = changes.filter(c => c > 0).length;
  let consistency = (positive / changes.length) * 100;
  insights.push(`📊 Consistency: ${consistency.toFixed(1)}%`);

  // Streak tracking
  let bestStreak = 0, worstStreak = 0;
  let cBest = 0, cWorst = 0;

  for (let i = 1; i < changes.length; i++) {
    if (changes[i] > 0) {
      cBest++; cWorst = 0;
    } else if (changes[i] < 0) {
      cWorst++; cBest = 0;
    }
    bestStreak = Math.max(bestStreak, cBest);
    worstStreak = Math.max(worstStreak, cWorst);
  }

  insights.push(`🔥 Growth Streak: ${bestStreak}`);
  insights.push(`💥 Loss Streak: ${worstStreak}`);

  // Risk scoring model
  let risk =
    volatility * 0.4 + (100 - consistency) * 3000 + worstStreak * 50000;

  insights.push(
    risk > 900000 ? "🔴 Extreme Risk"
    : risk > 500000 ? "🟠 High Risk"
    : risk > 200000 ? "🟡 Moderate Risk"
    : "🟢 Stable"
  );

  return insights.map(i => `<div>${i}</div>`).join("");
}

// ================= CHART =================
// Renders Chart.js visualization
function renderChart(data) {

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: chartType,
    data: {
      labels: data.map(d => d[0]),
      datasets: [
        {
          label: "Value",
          data: data.map(d => d[1]),
          borderWidth: 2,
          backgroundColor: data.map(d =>
            d[1] >= 0 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"
          )
        }
      ]
    }
  });
}

// ================= ANIMATION =================
// Animates number counting effect in UI
function animateValue(id, end, duration = 600) {
  const el = document.getElementById(id);
  let start = 0, t0 = null;

  function step(t) {
    if (!t0) t0 = t;
    let p = Math.min((t - t0)/duration,1);
    el.textContent = `$${Math.floor(p*end).toLocaleString()}`;
    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ================= EXPORT =================

// Export dataset as CSV file
document.getElementById("exportBtn").onclick = () => {
  let csv = "Month,Value\n";
  finances.forEach(f => csv += `${f[0]},${f[1]}\n`);

  let blob = new Blob([csv], { type: "text/csv" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.csv";
  a.click();
};

// Export dataset as JSON file
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
// Initial app load
runAnalysis();