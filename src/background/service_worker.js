// Check if the current OS is ChromeOS or not
chrome.runtime.getPlatformInfo(info => {
    if (info.os !== "cros") {
        preventExtensionRunning();
    } else {
        console.log("Extension is running in ChromeOS.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const listYear = document.getElementById("listYear");
    if (listYear) {
        listYear.innerText = new Date().getFullYear();
    }

    lightDarkModeSwitcher();
    assignDynamicCheckedAttribute();
})

// Define DOM elements
const bannerDiv = document.getElementById("banner")

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

    bannerDiv.className = textInfo.bannerDivClass;
    // Create and append error message
    const errorDiv = createErrorElement(textInfo);
    bannerDiv.appendChild(errorDiv);

    Object.values(elemsToBeRemoved).forEach(removeElement);

    console.error(textInfo.errorMessage);
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

// Handle dark/light mode switching in options page
function lightDarkModeSwitcher() {
    const staticElements = [
        document.getElementById("options"),
    ];

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        staticElements.forEach(element => {
            element.classList.remove("bg-info");
            element.classList.add("bg-dark");
        });
    } else {
        staticElements.forEach(element => {
            element.classList.remove("bg-dark");
            element.classList.add("bg-info");
        });
    }
}

// Handle hide/show content radio button checking
function assignDynamicCheckedAttribute() {
    const hsCheckList = document.querySelectorAll(".hs-input");

    // Load the checked state from chrome.storage
    chrome.storage.local.get("selectedOption", (data) => {
        const selectedOption = data.selectedOption;
        if (selectedOption) {
            hsCheckList.forEach((elem) => {
                elem.checked = elem.id === selectedOption;
            });
        }
    });

    hsCheckList.forEach((elem) => {
        elem.addEventListener("click", () => {
            chrome.storage.local.set({ selectedOption: elem.id }); // Save to chrome.storage

            // Uncheck other radio buttons
            hsCheckList.forEach((otherElem) => {
                if (otherElem !== elem) {
                    otherElem.checked = false;
                }
            });
            elem.checked = true;
        });
    });
}