function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
function generateDepartures(baseTimes, offsetMinutes, shiftStart) {
  const result = [];
  const [shiftHour, shiftMinute] = shiftStart.split(':').map(Number);
  for (const t of baseTimes) {
    let [h, m] = t.split(':').map(Number);
    m += offsetMinutes;
    while (m >= 60) {
      h += 1;
      m -= 60;
    }
    if (h > shiftHour || (h === shiftHour && m >= shiftMinute)) {
      result.push(h.toString().padStart(2,'0') + ':' + m.toString().padStart(2,'0'));
    }
  }
  return result;
}
function renderPage(lineData) {
  const stopsList = document.getElementById('stops');
  const timesTable = document.getElementById('times');
  const shift = getUrlParam('start') || '18:00';
  for (const stop of lineData) {
    const li = document.createElement('li');
    li.textContent = stop.name;
    li.onclick = () => {
      timesTable.innerHTML = '';
      const departures = generateDepartures(['18:00','18:20','18:40','19:00','19:20','19:40'], stop.timeOffset, shift);
      departures.forEach(d => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = d;
        tr.appendChild(td);
        timesTable.appendChild(tr);
      });
    };
    stopsList.appendChild(li);
  }
}