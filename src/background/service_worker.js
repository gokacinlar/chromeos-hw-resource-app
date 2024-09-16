// Check if the current OS is ChromeOS or not
chrome.runtime.getPlatformInfo(info => {
    if (info.os !== "cros") {
        preventExtensionRunning();
    } else {
        console.log("Extension is running in ChromeOS.");
    }
});

// Define DOM elements
const documentElements = {
    bannerDiv: document.getElementById("banner")
};

const elemsToBeRemoved = {
    bannerHolderDiv: document.getElementById("bannerContent"),
    usageIndicatorDiv: document.getElementById("hardwareInfoDiv"),
    usageStatsDiv: document.getElementById("hardwareMonitoringDiv"),
    tabsDiv: document.getElementById("tabsDiv")
};

// Function to prevent user from running the extension if OS is not intended to run it
function preventExtensionRunning() {
    const textInfo = {
        errorMessage: "This extension is only available on ChromeOS.",
        errorDivClass: "px-2 py-5 text-center pt-6 text-white mx-0 my-0",
        bannerDivClass: "bg-black text-white",
        bannerDivImgClass: "img-fluid m-auto pb-4",
        bannerDivImgSrc: "/images/cros-logo.png"
    };

    if (documentElements.bannerDiv) {
        documentElements.bannerDiv.className = textInfo.bannerDivClass;

        // Create and append error message
        const errorDiv = createErrorElement(textInfo);
        documentElements.bannerDiv.appendChild(errorDiv);

        Object.values(elemsToBeRemoved).forEach(removeElement);

        console.error(textInfo.errorMessage);
    } else {
        console.error("Banner div not found.");
    }
}

// Function to create an error element to display error state
function createErrorElement({ errorMessage, errorDivClass, bannerDivImgClass, bannerDivImgSrc }) {
    const errorDiv = document.createElement("h1");
    errorDiv.className = errorDivClass;
    errorDiv.textContent = errorMessage;

    const errorDivImg = document.createElement("img");
    errorDivImg.className = bannerDivImgClass;
    errorDivImg.src = bannerDivImgSrc;

    // Append image to error div
    errorDiv.appendChild(errorDivImg);
    return errorDiv;
}

/**
 * Helper Functions
 */

function removeElement(elem) {
    if (elem) {
        elem.remove();
    } else {
        console.error("Provided element could not be found.");
    }
}