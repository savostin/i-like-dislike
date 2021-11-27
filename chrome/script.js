(function(extensionId) {
    function getButtons() {
        let d = document.getElementById('menu-container');
        return d ? d.querySelector('#top-level-buttons-computed') : false;
    }

    function getLikeButton() {
        return getButtons().children[0];
    }

    function getDislikeButton() {
        return getButtons().children[1];
    }

    function setLikes(likesCount) {
        getLikeButton().querySelector('#text').innerText = likesCount;
    }

    function setDislikes(dislikesCount) {
        getDislikeButton().querySelector('#text').innerText = dislikesCount;
    }

    function setState() {
        chrome.runtime.sendMessage(
            extensionId, {
                message: 'fetch_from_api',
                videoId: getVideoId(window.location.href)
            },
            function(response) {
                if (response != undefined) {
                    try {
                        if (response.dislikeCount) {
                            setLikes(numberFormat(response.likeCount));
                            setDislikes(numberFormat(response.dislikeCount));
                        }
                    } catch (e) {
                        console.error('I Like Dislike', e);
                    }
                }
            }
        );
    }

    function setInitalState() {
        setState();
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
                if (!window.returnDislikeButtonlistenersSet) {
                    window.returnDislikeButtonlistenersSet = true;
                }
                //setInitalState();
            }
        }

        if (window.location.href.indexOf('watch?') >= 0) {
            jsInitChecktimer = setInterval(checkForJS_Finish, 111);
        }
    }


    setEventListeners();

    document.addEventListener('yt-navigate-finish', function(event) {
        setInitalState();
    });
    document.addEventListener('beforeunload', function(event) {
        console.log('UnLoad');
        chrome.extension.getBackgroundPage().console.log('UnLoad');
    });

})(document.currentScript.getAttribute('extension-id'));