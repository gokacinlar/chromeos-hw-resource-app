// Check if the current OS is ChromeOS or not
chrome.runtime.getPlatformInfo((info) => {
    if (info.os !== "cros") {
        preventExtensionRunning();
    } else {
        return console.log("Extension is running in ChromeOS.")
    }
});

const documentElements = {
    bannerDiv: document.getElementById("banner"),
    bannerHolderDiv: document.getElementById("bannerContent"),
    usageIndicatorDiv: document.getElementById("hardwareInfoDiv")
}

function preventExtensionRunning() {
    const textInfo = {
        errorMessage: "This extension is only available on;",
        errorDivClassValue: "px-2 py-5 text-center pt-6 text-white mx-0 my-0",
        bannerDivBgColor: "bg-black text-white",
        bannerDivImg: "img-fluid m-auto pb-4"
    };

    const errorDiv = document.createElement("h1");
    const errorDivImg = document.createElement("img");
    errorDivImg.setAttribute("class", textInfo.bannerDivImg);
    errorDivImg.src = "/images/cros-logo.png";

    if (documentElements.bannerDiv) {
        documentElements.bannerDiv.setAttribute("class", textInfo.bannerDivBgColor);
        errorDiv.setAttribute("class", textInfo.errorDivClassValue);

        errorDiv.textContent = textInfo.errorMessage;

        documentElements.bannerDiv.appendChild(errorDiv);
        documentElements.bannerDiv.appendChild(errorDivImg);

        documentElements.bannerHolderDiv.remove();
        documentElements.usageIndicatorDiv.remove();
    }
    return console.error(textInfo.errorMessage);
}