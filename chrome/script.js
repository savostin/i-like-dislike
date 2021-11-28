(function(extensionId) {
    function getButtons() {
        let d = document.getElementById('menu-container');
        return d ? d.querySelector('#top-level-buttons-computed') : false;
    }


    function update() {
        let videoID = getVideoId(window.location.href);
        let buttons = getButtons();
        if (buttons) {
            buttons.children[1].querySelector('#text').innerText = 'DISLIKE';
            chrome.runtime.sendMessage(
                extensionId, {
                    message: 'fetch_from_api',
                    videoId: videoID
                },
                function(response) {
                    if (response != undefined) {
                        console.log(`[I Like Dislike] Video: ${videoID}, likes: ${response.likeCount}, dislikes: ${response.dislikeCount}, error: ${response.error || ''}`);
                        buttons.children[1].querySelector('#text').innerText = response.dislikeCount ? numberFormat(response.dislikeCount) : 'DISLIKE';
                    }
                }
            );
        }
    }


    function getVideoId(url) {
        const urlObject = new URL(url);
        const videoId = urlObject.searchParams.get('v');
        return videoId;
    }

    function isVideoLoaded() {
        const videoId = getVideoId(window.location.href);
        return (
            document.querySelector(`ytd-watch-flexy[video-id='${videoId}']`) !== null
        );
    }

    function numberFormat(numberState) {
        const userLocales = navigator.language;
        const formatter = Intl.NumberFormat(userLocales, { notation: 'compact' });
        return formatter.format(numberState);
    }

    var jsInitChecktimer = null;

    function setEventListeners(evt) {
        function checkForJS_Finish() {
            const buttons = getButtons();
            if (buttons && buttons.offsetParent && isVideoLoaded()) {
                clearInterval(jsInitChecktimer);
                jsInitChecktimer = null;
                update();
                if (!window.returnDislikeButtonlistenersSet) {
                    window.returnDislikeButtonlistenersSet = true;
                }
            }
        }

        if (window.location.href.indexOf('watch?') >= 0) {
            jsInitChecktimer = setInterval(checkForJS_Finish, 111);
        }
    }

    setEventListeners();

    document.addEventListener('yt-navigate-finish', function(event) {
        update();
    });

})(document.currentScript.getAttribute('extension-id'));