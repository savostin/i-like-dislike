try {
    chrome.runtime.onMessageExternal.addListener(
        (request, sender, sendResponse) => {
            if (request.message == "fetch_from_api") {
                let options = { apiKey: '', changeIcon: false };
                chrome.storage.sync.get(options, function(settings) {
                    options = Object.assign({}, options, settings);
                    fetch(options.apiKey ? `https://www.googleapis.com/youtube/v3/videos?id=${request.videoId}&part=statistics&key=${options.apiKey}` :
                            `https://yt.artemislena.eu/api/v1/videos/${request.videoId}?fields=likeCount,dislikeCount`)
                        .then(response => response.json())
                        .then(data => data.items ? (data.items[0] ? data.items[0].statistics : { likeCount: 0, dislikeCount: 0 }) : data)
                        // .then(data => { chrome.action.setTitle({ title: `Likes: ${data.likeCount}\nDislikes: ${data.dislikeCount}` }); return data; })
                        .then(data => sendResponse(data))
                        .catch(err => console.error(err))
                });
                return true;
            }
            return false;
        }
    );


} catch (e) {
    console.error(e);
}