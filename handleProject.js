var maxWidth = 0;
var jszip = null;
var id = null;

function logMessage(msg) {
    $("#log").text(msg + "\n" + $("#log").text());
}

function setProgress(perc) {
    maxWidth = $("#downloader").width();
    $("#progress").width(perc + '%');
}

function animError() {
    setProgress(100);
    $("#progress").addClass("error");
    $("#progress").animate({opacity: 0}, 1000, function() {
        $(this).css({"opacity": 1, width: 0});
    });
}

function psuccess() {
    setProgress(100);
    setTimeout(() => {
        $("#progress").addClass("success");
        $("#progress").animate({opacity: 0}, 1000, function() {
            $(this).css({"opacity": 1, width: 0});
        });
    }, 100);
}

function perror(err) {
    console.error(err);
    alert("Error: " + err.message);
    logMessage("Error: " + err.message);
    animError();
}

async function startDownload(projectId) {
    $("#log").text("");
    $("#progress").removeClass("error success");
    $("#progress").css("opacity", 1);

    logMessage("Starting download for ID: " + projectId);
    setProgress(5);

    try {
        if (!window.SB3ToSB2) {
            throw new Error("Conversion library not found.");
        }

        window.SB3ToSB2.setLogHandler(logMessage);
        window.SB3ToSB2.logginglevel('heavy');

        const result = await window.SB3ToSB2.downloadProject(projectId, (prog) => {
            setProgress(prog);
        });

        const { projectData, sourceZip, type, base64 } = result;

        if (type === 'base64' || type === 'legacy') {
            finish(base64);
            return;
        }

        jszip = new JSZip();

        if (type === 'sb3') {
            logMessage("Detected Scratch 3.0 project.");
            await window.SB3ToSB2.processSB3(projectData, jszip, sourceZip, (prog) => {
                setProgress(prog);
            });
            finalizeZip();
        } else if (type === 'normal') {
            logMessage("Detected Scratch 2.0 project.");
            await window.SB3ToSB2.processNormal(projectData, jszip, (prog) => {
                setProgress(prog);
            });
            finalizeZip();
        } else {
            throw new Error("Unrecognized project format.");
        }

    } catch (err) {
        perror(err);
    }
}

function finalizeZip() {
    logMessage("Compressing archive...");
    setProgress(95);

    if (typeof jszip.generateAsync === "function") {
        jszip.generateAsync({type: "base64"}).then(function(content) {
            finish(content);
        }).catch(function(err) {
            perror(err);
        });
    } else {
        try {
            var content = jszip.generate({type: "base64"});
            finish(content);
        } catch (err) {
            perror(err);
        }
    }
}

function finish(content) {
    logMessage("Passing to player...");
    setProgress(100);
    if (window.gotZipBase64) {
        window.gotZipBase64(content);
        psuccess();
    } else {
        logMessage("Error: window.gotZipBase64 not found.");
    }
}
