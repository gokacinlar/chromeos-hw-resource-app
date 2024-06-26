// Check if the current OS is ChromeOS or not
chrome.runtime.getPlatformInfo((info) => {
    if (info.os !== "cros" && info.os !== "win") {
        preventExtensionRunning();
    } else {
        return console.log("Extension is running in ChromeOS.")
    }
});

let bannerDiv = document.getElementById("banner");
let bannerHolderDiv = document.getElementById("bannerContent");
let usageIndicatorDiv = document.getElementById("hardwareInfoDiv");

function preventExtensionRunning() {
    const errorDiv = document.createElement("h1");

    if (bannerDiv) {
        const textInfo = {
            errorMessage: "This extension is only available on ChromeOS.",
            errorDivClassValue: "px-2 py-5 text-center pt-6 text-white mx-0 my-0",
            bannerDivBgColor: "bg-danger",
        };

        bannerDiv.setAttribute("class", textInfo.bannerDivBgColor);
        errorDiv.setAttribute("class", textInfo.errorDivClassValue);

        errorDiv.textContent = textInfo.errorMessage;

        bannerDiv.appendChild(errorDiv);
        bannerHolderDiv.remove();
        usageIndicatorDiv.remove();
    }
    return console.error(textInfo.errorMessage);
}