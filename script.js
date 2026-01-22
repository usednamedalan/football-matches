const API_KEY = 'da384c1dbf880f63dd8e398cbb3d6471';
const BASE_URL = 'https://v3.football.api-sports.io';
// Top 10 Leagues: PL, La Liga, Bundesliga, Serie A, Ligue 1, UCL, Port. Liga, Eredivisie, Brasil A, MLS
const LEAGUE_IDS = [39, 140, 78, 135, 61, 2, 94, 88, 71, 253];

async function getMatches() {
    const date = document.getElementById('dateInput').value;
    const container = document.getElementById('matches-container');
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        alert("Please use YYYY-MM-DD format");
        return;
    }

    container.innerHTML = '<div class="loading-text">Scanning pitches...</div>';

    try {
        const response = await fetch(`${BASE_URL}/fixtures?date=${date}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const data = await response.json();
        const matches = data.response.filter(m => LEAGUE_IDS.includes(m.league.id));

        if (matches.length === 0) {
            container.innerHTML = '<div class="loading-text">No big matches found for this date.</div>';
            return;
        }

        container.innerHTML = matches.map(m => {
            const status = m.fixture.status.short;
            const isLive = ["1H", "HT", "2H", "ET", "P"].includes(status);
            
            return `
            <div class="match-card" onclick="toggleEvents(${m.fixture.id})">
                <div class="league-header">${m.league.name} • ${m.fixture.status.long}</div>
                <div class="row">
                    <div class="team home">${m.teams.home.name} <img src="${m.teams.home.logo}"></div>
                    <div class="score-box">
                        <span class="score-text" style="${isLive ? 'color: var(--accent)' : ''}">
                            ${m.goals.home ?? 0}:${m.goals.away ?? 0}
                        </span>
                        ${isLive ? `<span class="live-time">${m.fixture.status.elapsed}'</span>` : ''}
                    </div>
                    <div class="team away"><img src="${m.teams.away.logo}"> ${m.teams.away.name}</div>
                </div>
                <div class="events-panel" id="events-${m.fixture.id}"></div>
            </div>`;
        }).join('');

    } catch (err) {
        container.innerHTML = '<div class="loading-text">Failed to sync with stadium.</div>';
    }
}

async function toggleEvents(fixtureId) {
    const panel = document.getElementById(`events-${fixtureId}`);
    
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
        return;
    }

    panel.innerHTML = '<div class="loading-text">Fetching goals...</div>';
    panel.style.display = 'block';

    try {
        // Fetch specific match info to define Home vs Away team ID
        const matchRes = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const matchData = await matchRes.json();
        const homeTeamId = matchData.response[0].teams.home.id;

        // Fetch events (Goals, Assists)
        const eventRes = await fetch(`${BASE_URL}/fixtures/events?fixture=${fixtureId}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const eventData = await eventRes.json();
        
        let homeSideHTML = "";
        let awaySideHTML = "";

        eventData.response.forEach(ev => {
            if (ev.type === "Goal") {
                const time = ev.time.elapsed + (ev.time.extra ? `+${ev.time.extra}` : "");
                const player = ev.player.name || "Unknown";
                const assist = ev.assist.name ? `<small>ast: ${ev.assist.name}</small>` : "";
                const isOG = ev.detail === "Own Goal" ? " <span style='color:var(--og-red)'>(OG)</span>" : "";
                
                const goalTemplate = `
                    <div class="goal-item">
                        <strong>${time}'</strong> ${player}${isOG}
                        ${assist}
                    </div>`;
                
                // Sort to correct side of the panel
                if (ev.team.id === homeTeamId) homeSideHTML += goalTemplate;
                else awaySideHTML += goalTemplate;
            }
        });

        panel.innerHTML = `
            <div class="events-grid">
                <div class="ev-home">${homeSideHTML || "--"}</div>
                <div class="ev-away">${awaySideHTML || "--"}</div>
            </div>`;

    } catch (err) {
        panel.innerHTML = '<div class="loading-text">No goal data available.</div>';
    }
}

// Optional: Initial call to show today's games automatically
// getMatches();
