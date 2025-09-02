let city = "Mecca"; // القيمة الافتراضية
let country = "Saudi Arabia";
let prayerTimes = {};
let nextPrayer = "";
let countdownInterval;

function fetchPrayerTimes() {
  const apiURL = https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5;

  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      let t = data.data.timings;
      let dateH = data.data.date.hijri;
      let dateG = data.data.date.gregorian;

      prayerTimes = t;

      document.getElementById("date").innerHTML = 
        📅 ${dateG.date} - ${dateH.date} (${dateH.weekday.ar});

      document.getElementById("times").innerHTML = `
        <strong>الفجر:</strong> ${t.Fajr} <br>
        <strong>الظهر:</strong> ${t.Dhuhr} <br>
        <strong>العصر:</strong> ${t.Asr} <br>
        <strong>المغرب:</strong> ${t.Maghrib} <br>
        <strong>العشاء:</strong> ${t.Isha}
      `;

      startCountdown();
    })
    .catch(err => {
      document.getElementById("times").innerHTML = "❌ خطأ في تحميل البيانات";
      console.error("خطأ:", err);
    });
}

function getNextPrayer() {
  let now = new Date();
  let currentTime = now.getHours() * 60 + now.getMinutes();
  let order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (let p of order) {
    let [h, m] = prayerTimes[p].split(":").map(Number);
    let prayerTime = h * 60 + m;
    if (prayerTime > currentTime) {
      return { name: p, time: prayerTimes[p] };
    }
  }
  return { name: "Fajr", time: prayerTimes["Fajr"] }; // لو اليوم خلص
}

function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    let now = new Date();
    let next = getNextPrayer();
    nextPrayer = next.name;

    let [h, m] = next.time.split(":").map(Number);
    let nextDate = new Date();
    nextDate.setHours(h, m, 0, 0);

    if (nextDate < now) nextDate.setDate(nextDate.getDate() + 1);

    let diff = Math.floor((nextDate - now) / 1000);
    let hours = Math.floor(diff / 3600);
    let minutes = Math.floor((diff % 3600) / 60);
    let seconds = diff % 60;

    document.getElementById("countdown").innerText =
      ⏳ متبقي ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية على ${translatePrayer(nextPrayer)};
  }, 1000);
}

function translatePrayer(p) {
  switch (p) {
    case "Fajr": return "الفجر";
    case "Dhuhr": return "الظهر";
    case "Asr": return "العصر";
    case "Maghrib": return "المغرب";
    case "Isha": return "العشاء";
    default: return p;
  }
}

function changeCity() {
  let newCity = document.getElementById("cityInput").value;
  if (newCity.trim() !== "") {
    city = newCity;
    fetchPrayerTimes();
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

window.onload = fetchPrayerTimes;