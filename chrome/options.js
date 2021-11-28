function restore() {
    document.getElementById('save').innerText = 'Save';
    const select = document.getElementById('url');
    fetch('https://api.invidious.io/instances.json?sort_by=type,health')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.map(entry => {
                const healthKnown = !!entry[1].monitor
                return {
                    name: entry[0],
                    details: entry[1],
                    health: +(healthKnown ? entry[1].monitor.dailyRatios[0].ratio : 95),
                    healthKnown
                }
            }).filter(entry => {
                return entry.details.type === "https" && entry.health > 0
            }).sort((a, b) => {
                return b.health - a.health
            }).forEach(entry => {
                let opt = document.createElement('option');
                opt.textContent = `${entry.details.flag} [${entry.details.region}] ${entry.name}`;
                opt.value = entry.details.uri;
                select.appendChild(opt);
            })
        })
        .catch(err => { console.error(err) })
        .finally(() => {
            chrome.storage.sync.get({
                apiKey: '',
                url: ''
            }, function(settings) {
                document.getElementById('key').value = settings && settings.apiKey && settings.apiKey.length > 0 ? settings.apiKey : '';
                select.value = settings && settings.url && settings.url.length > 0 ? settings.url : '';
            });
        })

}

function save() {
    chrome.storage.sync.set({
        apiKey: document.getElementById('key').value,
        url: document.getElementById('url').value,
    }, () => {
        document.getElementById('save').innerText = 'Saved';
        window.setTimeout(window.close, 1000);
    });

}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);