function restore() {
    document.getElementById('save').innerText = 'Save';
    chrome.storage.sync.get({
        apiKey: '',
    }, function(settings) {
        document.getElementById('key').value = settings && settings.apiKey && settings.apiKey.length > 0 ? settings.apiKey : '';
    });

}

function save() {
    chrome.storage.sync.set({
        apiKey: document.getElementById('key').value,
    }, () => {
        document.getElementById('save').innerText = 'Saved';
        window.setTimeout(window.close, 1000);
    });

}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);