var swf = document.querySelector('#scratch embed');

window.gotZipBase64 = function(content) {
    let tries = 0;
    const interval = setInterval(() => {
        swf = document.querySelector('#scratch embed');
        if (swf && swf.ASopenProjectFromData) {
            clearInterval(interval);
            swf.ASopenProjectFromData(content);
            setTimeout(() => {
                $('#downloader').animate({height: 0}, 1000);
            }, 100);
        } else {
            tries++;
            if (tries >= 40) {
                clearInterval(interval);
                throw new Error("Unable to run ASopenProjectFromData from swf");
            }
        }
    }, 1000);
};

window.JSdownloadSB2 = function(data, filename) {
    var a = document.createElement('a');
    a.href = 'data:application/octet-stream;charset=utf-16le;base64,' + data;
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
};

if (JSwillDownload()) {
    document.body.classList.add('download');
    startDownload(location.hash.slice(1));
}
