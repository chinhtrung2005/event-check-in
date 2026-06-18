const goal = 50;
let attendeeCount = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
const attendees = [];

const attendeeCountElement = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const waterCountElement = document.getElementById("waterCount");
const zeroCountElement = document.getElementById("zeroCount");
const powerCountElement = document.getElementById("powerCount");
const attendeeListElement = document.getElementById("attendeeList");
const form = document.getElementById("checkInForm");

function getTeamLabel(value) {
  if (value === "water") {
    return "Team Water Wise";
  }
  if (value === "zero") {
    return "Team Net Zero";
  }
  if (value === "power") {
    return "Team Renewables";
  }
  return "";
}

function saveToStorage() {
  localStorage.setItem("attendeeCount", attendeeCount);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));
}

function loadFromStorage() {
  var storedCount = localStorage.getItem("attendeeCount");
  var storedTeamCounts = localStorage.getItem("teamCounts");
  var storedAttendees = localStorage.getItem("attendees");

  if (storedCount !== null) {
    attendeeCount = Number(storedCount);
  }
  if (storedTeamCounts !== null) {
    teamCounts = JSON.parse(storedTeamCounts);
  }
  if (storedAttendees !== null) {
    var parsedAttendees = JSON.parse(storedAttendees);
    if (Array.isArray(parsedAttendees)) {
      parsedAttendees.forEach(function (entry) {
        attendees.push(entry);
      });
    }
  }
}

function getWinningTeam() {
  var winningValue = teamCounts.water;
  var winningKey = "water";

  if (teamCounts.zero > winningValue) {
    winningValue = teamCounts.zero;
    winningKey = "zero";
  }
  if (teamCounts.power > winningValue) {
    winningValue = teamCounts.power;
    winningKey = "power";
  }

  return {
    key: winningKey,
    count: winningValue,
    label: getTeamLabel(winningKey),
  };
}

function renderStats() {
  attendeeCountElement.textContent = attendeeCount;
  waterCountElement.textContent = teamCounts.water;
  zeroCountElement.textContent = teamCounts.zero;
  powerCountElement.textContent = teamCounts.power;
  var progressPercent = Math.min(100, Math.round((attendeeCount / goal) * 100));
  progressBar.style.width = progressPercent + "%";
}

function renderAttendeeList() {
  if (attendees.length === 0) {
    attendeeListElement.innerHTML =
      '<li class="empty">No attendees checked in yet.</li>';
    return;
  }

  var listHtml = "";
  attendees.forEach(function (entry) {
    listHtml += '<li class="attendee-item">';
    listHtml += '<span class="attendee-name">' + entry.name + "</span>";
    listHtml += '<span class="attendee-team">' + entry.teamLabel + "</span>";
    listHtml += "</li>";
  });
  attendeeListElement.innerHTML = listHtml;
}

function showGreeting(text, isCelebration) {
  greeting.textContent = text;
  greeting.className = isCelebration ? "success-message" : "";
  greeting.style.display = "block";
}

function handleCheckIn(name, teamValue, teamLabel) {
  attendeeCount = attendeeCount + 1;
  teamCounts[teamValue] = teamCounts[teamValue] + 1;
  attendees.push({
    name: name,
    team: teamValue,
    teamLabel: teamLabel,
  });

  saveToStorage();
  renderStats();
  renderAttendeeList();

  var progressPercent = Math.min(100, Math.round((attendeeCount / goal) * 100));
  if (progressPercent >= 100) {
    var winner = getWinningTeam();
    showGreeting(
      "🎉 Goal reached! " +
        winner.label +
        " is leading with " +
        winner.count +
        " attendees.",
      true,
    );
  } else {
    showGreeting(
      "Welcome " + name + "! You are now checked in to " + teamLabel + ".",
      false,
    );
  }
}

loadFromStorage();
renderStats();
renderAttendeeList();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var nameInput = document.getElementById("attendeeName");
  var teamSelect = document.getElementById("teamSelect");
  var name = nameInput.value.trim();
  var teamValue = teamSelect.value;
  var teamLabel = teamSelect.options[teamSelect.selectedIndex].text;

  if (name === "" || teamValue === "") {
    return;
  }

  handleCheckIn(name, teamValue, teamLabel);

  form.reset();
  nameInput.focus();
});
