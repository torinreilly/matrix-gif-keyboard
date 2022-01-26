let widgetId = null;
window.onmessage = function(ev) {
    let capabilities = ['m.sticker'];
    let error_message = "Action is not supported.";
    if (!window.parent) return;
    const message = ev.data;

    if (!message.requestId || !message.widgetId || !message.action || message.api !== "toWidget") return;

    if (widgetId) {
        if (widgetId !== message.widgetId) return;
    } else {
        widgetId = message.widgetId;
    }

    let res = (message.action === 'capabilities')? {capabilities: capabilities}: (message.action === 'visibility')? {} : {error: {message: error_message}};
    window.parent.postMessage({
        ...message,
        response: res
    }, ev.origin);
};

function sendGif(src, width, height, size, title) {
    if (!src) {
        alert("Error: unknown gif");
        return;
    }
    uploadGif(src).then(function (data) {
        const mxc_uri = data.content_uri;
        size = (typeof size == 'undefined' ? data.size : size);
        const id = mxc_uri.substring(mxc_uri.lastIndexOf('/') + 1)
        const gif = {
            name: title,
            content: {
                body: title,
                url: mxc_uri,
                msgtype: "m.sticker",
                info: {
                    w: parseInt(width),
                    h: parseInt(height),
                    thumbnail_info: { h: parseInt(height), mimetype: "image/gif", size: parseInt(size), w: parseInt(width) },
                    thumbnail_url: mxc_uri,
                    size: parseInt(size),
                    mimetype: "image/gif",
                }
            }
        };

        const widgetData = {
            ...gif,
            description: gif.name,
            file: id + '.gif',
        }

        var message = {
            api: "fromWidget",
            action: "m.sticker",
            requestId: "gif-" + Date.now(),
            widgetId: widgetId,
            data: gif,
            widgetData: widgetData
        };
        window.parent.postMessage(message, '*');
    });

}

$(document).ready(function () {
    //load initial trending gifs
    searchGif();

    //bind form submit to gif search
    $("#search").on("submit", function (event) {
        event.preventDefault();
        var str = $("#q").val();
        searchGif(str);
    });
    $("#results").on("click", "li div img", function () {
        sendGif($(this).attr('full_src'), $(this).attr('img_width'), $(this).attr('img_height'), $(this).attr('img_size'), $(this).attr('img_title'));
    });

    $('#q').focus();
});

function searchGif(keyword) {
    if (typeof keyword == 'undefined') {
        // DuckDuckGo does not have treding images, so by default use the day of the week as a search term
        // This is a pretty lame way to determine what service we are using, but whatever
        if ($('#service').attr('alt') == "duck") {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();
            let day = weekday[d.getDay()];
            $.get('/search?keyword=' + day).then(function (data) { $('#results').html(data); });
        }//If using GIPHY or Tenor, a blank search will get the trending gifs
        else {
            $.get('/search').then(function (data) { $('#results').html(data); });
        }
    }
    else {
        $.get('/search?keyword=' + keyword).then(function (data) { $('#results').html(data); });
    }
    $('#results').hide().show(0);
}

function uploadGif(src) {
    $.ajaxSetup({
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return $.post('/upload', JSON.stringify({ url: src }));
}