let defaultURL = 'https://invidious.osi.kr/';
try {
    chrome.runtime.onMessageExternal.addListener(
        (request, sender, sendResponse) => {
            if (request.message == "fetch_from_api") {
                let options = { apiKey: '', url: defaultURL };
                chrome.storage.sync.get(options, function(settings) {
                    options = Object.assign({}, options, settings);
                    if (options.apiKey || options.url) {
                        fetch(options.apiKey ? `https://www.googleapis.com/youtube/v3/videos?id=${request.videoId}&part=statistics&key=${options.apiKey}` :
                                `${options.url}/api/v1/videos/${request.videoId}?fields=likeCount,dislikeCount`)
                            .then(response => response.json())
                            .then(data => data.items ? (data.items[0] ? data.items[0].statistics : { likeCount: 0, dislikeCount: 0 }) : data)
                            .then(data => Object.assign({ url: `${options.url}/api/v1/videos/${request.videoId}?fields=likeCount,dislikeCount` }, data))
                            .then(data => sendResponse(data))
                            .catch(err => sendResponse({ error: err.message }))
                    } else { return false; }
                });
                return true;
            }
            return false;
        }
    );


} catch (e) {
    console.error(e);
}