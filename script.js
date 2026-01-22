const API_KEY = '32a94097e144fbded05a2537984eb315';
const BASE_URL = 'https://v3.football.api-sports.io';

let currentDate = new Date();

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchMatches(currentDate);
    fetchTopTransfers();
});

// Navigation Logic
function showPage(pageId) {
    document.getElementById('home-page').style.display = pageId === 'home' ? 'block' : 'none';
    document.getElementById('team-page').style.display = pageId === 'team-page' ? 'block' : 'none';
    document.getElementById('transfers-page').style.display = pageId === 'transfers-page' ? 'block' : 'none';
}

// Fetch Matches
async function fetchMatches(date) {
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById('current-date-display').innerText = formattedDate;
    
    const response = await fetch(`${BASE_URL}/fixtures?date=${formattedDate}`, {
        headers: { 'x-apisports-key': API_KEY }
    });
    const data = await response.json();
    displayMatches(data.response);
}

function displayMatches(matches) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';

    // Filter for Top 5 Leagues only (IDs: 39, 140, 78, 135, 61, 2)
    const topLeagues = [39, 140, 78, 135, 61, 2];
    const filtered = matches.filter(m => topLeagues.includes(m.league.id));

    if (filtered.length === 0) {
        container.innerHTML = '<p>No major league matches today.</p>';
        return;
    }

    filtered.forEach(m => {
        container.innerHTML += `
            <div class="match-card">
                <div class="team-info">
                    <img src="${m.teams.home.logo}" width="25">
                    <span>${m.teams.home.name}</span>
                </div>
                <div class="score">
                    ${m.goals.home ?? ''} - ${m.goals.away ?? 'vs'}
                </div>
                <div class="team-info away">
                    <span>${m.teams.away.name}</span>
                    <img src="${m.teams.away.logo}" width="25">
                </div>
            </div>
        `;
    });
}

// Date Navigation
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    fetchMatches(currentDate);
}

// Search Team
async function searchTeam() {
    const query = document.getElementById('teamSearch').value;
    if (!query) return;

    const response = await fetch(`${BASE_URL}/teams?search=${query}`, {
        headers: { 'x-apisports-key': API_KEY }
    });
    const data = await response.json();
    
    if (data.response.length > 0) {
        displayTeamPage(data.response[0].team.id);
    } else {
        alert("Team not found!");
    }
}

async function displayTeamPage(teamId) {
    showPage('team-page');
    const container = document.getElementById('team-page');
    container.innerHTML = 'Loading team details...';

    // In a real app, you'd fetch standings, last 5 matches, and squad here.
    // Example layout for Team Page:
    const res = await fetch(`${BASE_URL}/teams?id=${teamId}`, { headers: { 'x-apisports-key': API_KEY } });
    const teamData = await res.json();
    const team = teamData.response[0].team;

    container.innerHTML = `
        <div class="team-header">
            <img src="${team.logo}" width="80">
            <h1>${team.name}</h1>
            <p>${team.country}</p>
        </div>
        <h3>Recent Form & Standings (Placeholders)</h3>
        <p>Current Rank: 1st (Sample Data)</p>
    `;
}

// Transfers (Simplified)
async function fetchTopTransfers() {
    // API-Football has a specific transfers endpoint
    const response = await fetch(`${BASE_URL}/transfers?league=39&season=2025`, {
        headers: { 'x-apisports-key': API_KEY }
    });
    const data = await response.json();
    const recent = data.response.slice(0, 5);
    
    const container = document.getElementById('recent-transfers');
    recent.forEach(t => {
        container.innerHTML += `
            <div class="transfer-item">
                <strong>${t.player.name}</strong><br>
                ${t.transfers[0].teams.out.name} ➔ ${t.transfers[0].teams.in.name}
            </div>
        `;
    });
}
