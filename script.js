const a = '54SxQNR5EHjCMTWe';
const b = 'EU606jiKxvOfaCGfHyMxlEC0mWD8Qznu';

async function c() {
    const d = document.getElementById('dateInput').value;
    const e = document.getElementById('matches-container');

    const f = `https://livescore-api.com/api-client/fixtures/matches.json?key=${a}&secret=${b}&date=${d}`;

    e.innerHTML = '<div style="text-align:center">Loading...</div>';

    try {
        const g = await fetch(f);
        const h = await g.json();
        if (!h.success) { e.innerHTML = ''; return; }

        const i = h.data.fixtures;

        e.innerHTML = i.map(j => {
            const k = j.status === 'LIVE' || j.status === 'IN PLAY';
            const l = j.score ? j.score : (j.time ? j.time.substring(0,5) : 'VS');

            return `
            <div class="match-card" onclick="m(${j.id})">
                <div class="league-name">${j.competition_name}</div>
                <div class="row">
                    <div class="team home">${j.home_name}</div>
                    <div class="score-box">
                        <div style="${k ? 'color:var(--accent)' : ''}">${l}</div>
                        ${k ? `<div class="live-mark"><span class="red-dot"></span> LIVE</div>` : ''}
                    </div>
                    <div class="team away">${j.away_name}</div>
                </div>
                <div class="events-panel" id="n-${j.id}"></div>
            </div>`;
        }).join('');
    } catch {
        e.innerHTML = '';
    }
}

async function m(o) {
    const p = document.getElementById(`n-${o}`);
    if (p.style.display === 'block') { p.style.display = 'none'; return; }

    p.style.display = 'block';
    p.innerHTML = 'Loading';

    const q = `https://livescore-api.com/api-client/scores/events.json?key=${a}&secret=${b}&id=${o}`;

    try {
        const r = await fetch(q);
        const s = await r.json();
        const t = s.data.event || [];

        let u = '', v = '';

        t.forEach(w => {
            if (w.event === 'GOAL') {
                const x = `<div class="ev-item"><strong>${w.time}'</strong> ${w.player}</div>`;
                if (w.home_away === 'home') u += x;
                else v += x;
            }
        });

        p.innerHTML = `
        <div class="events-grid">
            <div class="ev-home">${u || '--'}</div>
            <div class="ev-away">${v || '--'}</div>
        </div>`;
    } catch {
        p.innerHTML = '--';
    }
}
