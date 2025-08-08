const SHEET_URL = "https://sheets.googleapis.com/v4/spreadsheets/1inuGPDSSCpBMrxxYirCa_AQ2XE3FTjvkXc_YeU_mMkQ/values/'Odjezdové panely MHD'!F3:H12?key=AIzaSyDWkH8KqIP_zg8xj-2F6SqsDXhplhSFctg";

const lineColors = {
  "10": "#ff4c00ff",   // oranžová
  "37": "#00831dff",   // zelená
  // prípadne môžeš pridať ďalšie linky a farby tu
};

function getTimeInMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentTimeStr() {
  const now = new Date();
  return now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function timeDiffMinutes(departureTimeStr) {
  const now = new Date();
  const [depH, depM] = departureTimeStr.split(":").map(Number);
  const depDate = new Date(now);
  depDate.setHours(depH, depM, 0, 0);  // nastavenie odchodového času v dnešnom dni

  const diffSec = (depDate - now) / 1000;  // rozdiel v sekundách

  if (diffSec <= 0) return "BLINK";           // už odišiel
  if (diffSec <= 60) return "<1 min";         // menej ako 1 minúta
  if (diffSec <= 600) return Math.floor(diffSec / 60) + " min";  // do 10 minút
  return departureTimeStr;                    // inak presný čas
}


function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
  document.getElementById('clock').textContent = timeStr;
}

async function fetchData() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.json();

    document.getElementById('station-name').textContent = "Hlavní Nádraží N2";

    const list = document.getElementById('upcoming-list');
    list.innerHTML = '';

    const rows = data.values || [];
    const nowMins = getTimeInMinutes(getCurrentTimeStr());

    const parsed = rows
      .filter(row => row.length >= 3)
      .map(row => ({
        line: row[0],
        destination: row[1],
        departure: row[2],
        mins: getTimeInMinutes(row[2])
      }))
      .filter(dep => dep.mins >= nowMins)
      .sort((a, b) => a.mins - b.mins);

    parsed.forEach(dep => {
      const row = document.createElement('div');
      row.className = 'upcoming-row';

      const bgColor = lineColors[dep.line] || '#555';

      const timeDisplay = timeDiffMinutes(dep.departure);

      row.innerHTML = `
        <div><span class="line-badge" style="background-color: ${bgColor}">${dep.line}</span></div>
        <div>${dep.destination}</div>
        <div class="time-cell">${timeDisplay === "BLINK" ? "<span class='blinker'>⬤ ⬤</span>" : timeDisplay}</div>
      `;

      list.appendChild(row);
    });
  } catch (error) {
    console.error("Chyba pri načítaní dát:", error);
    document.getElementById('upcoming-list').innerHTML = '<div>Chyba pri načítaní údajov.</div>';
  }
}

async function startAutoRefresh() {
  await fetchData();

  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    fetchData();
    setInterval(fetchData, 60 * 1000);
  }, msToNextMinute);
}

setInterval(updateClock, 1000);
startAutoRefresh();
