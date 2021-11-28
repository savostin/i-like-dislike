function restore() {
    document.getElementById('save').innerText = 'Save';
    const select = document.getElementById('url');
    fetch('https://api.invidious.io/instances.json?sort_by=type,health')
        .then(response => response.json())
        .then(data => {
            const list = data.map(entry => {
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
            });
            list.forEach(entry => {
                let opt = document.createElement('option');
                opt.textContent = `${entry.details.flag} [${entry.details.region}] ${entry.name}`;
                opt.value = entry.details.uri;
                select.appendChild(opt);
                entry.opt = opt;
            })
            return list;
        })
        .then(list => {
            const threads = list.map(entry => {
                return new Promise((resolve, reject) => {
                    fetch(`${entry.details.uri}/api/v1/videos/kJQP7kiw5Fk?fields=likeCount,dislikeCount`)
                        .then(response => response.json())
                        .then(data => {
                            console.log(`${entry.name} is ${!data.likeCount && !data.dislikeCount ? 'dead' : 'OK'}`);
                            entry.opt.disabled = !data.likeCount && !data.dislikeCount;
                        })
                        .catch(err => { reject(entry.details.uri) })
                })
            })
            Promise.all(threads);
            return list;
        })
        .catch(err => { console.error(err) })
        .finally((list) => {
            chrome.storage.sync.get({
                apiKey: '',
                url: ''
            }, function(settings) {
                document.getElementById('key').value = settings && settings.apiKey && settings.apiKey.length > 0 ? settings.apiKey : '';
                if (settings && settings.url && settings.url.length > 0) {
                    select.value = settings.url;
                } else {
                    select.selectedIndex = list.findIndex(entry =>
                        entry.opt.disabled == false);
                }
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