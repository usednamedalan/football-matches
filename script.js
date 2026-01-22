var key = '32a94097e144fbded05a2537984eb315';
var d = new Date();

function U() {
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    var str = year + '-' + month + '-' + day;
    document.getElementById('dt').innerText = str;
    
    // Simple way to show if it's today
    var now = new Date();
    if (d.toDateString() == now.toDateString()) {
        document.getElementById('day').innerText = "Today";
    } else {
        document.getElementById('day').innerText = "Match Day";
    }
    
    G(str);
}

function B() {
    d.setDate(d.getDate() - 1);
    U();
}

function F() {
    d.setDate(d.getDate() + 1);
    U();
}

function G(s) {
    var div = document.getElementById('m-box');
    div.innerHTML = "Loading...";

    fetch('https://v3.football.api-sports.io/fixtures?date=' + s, {
        headers: { 'x-apisports-key': key }
    })
    .then(r => r.json())
    .then(res => {
        var x = res.response;
        var h = "";
        var ids = [39, 140, 78, 135, 61, 2]; // top leagues

        for (var i = 0; i < x.length; i++) {
            var m = x[i];
            if (ids.includes(m.league.id)) {
                h += '<div class="box" onclick="E(' + m.fixture.id + ')">';
                h += '<div class="row">';
                h += '<div class="tm">' + m.teams.home.name + ' <img src="' + m.teams.home.logo + '"></div>';
                h += '<div class="sc">' + m.goals.home + '-' + m.goals.away + '</div>';
                h += '<div class="tm"><img src="' + m.teams.away.logo + '"> ' + m.teams.away.name + '</div>';
                h += '</div>';
                h += '<div class="ev" id="e' + m.fixture.id + '"></div>';
                h += '</div>';
            }
        }
        div.innerHTML = h || "No big games today.";
    });
}

function E(id) {
    var eDiv = document.getElementById('e' + id);
    if (eDiv.style.display == 'block') {
        eDiv.style.display = 'none';
        return;
    }

    eDiv.innerHTML = "loading...";
    eDiv.style.display = 'block';

    fetch('https://v3.football.api-sports.io/fixtures/events?fixture=' + id, {
        headers: { 'x-apisports-key': key }
    })
    .then(r => r.json())
    .then(res => {
        var data = res.response;
        var txt = "";
        for (var i = 0; i < data.length; i++) {
            if (data[i].type == "Goal") {
                txt += data[i].time.elapsed + "' Goal: " + data[i].player.name + "<br>";
            }
        }
        eDiv.innerHTML = txt || "No goals found.";
    });
}

U();
