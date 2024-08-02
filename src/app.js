document.addEventListener("DOMContentLoaded", initSystemInfo());

function initSystemInfo() {
    getCpuUsage();
    getMemUsage();
    getStorageUsage();
    getDisplayInfo();
    setDocumentStyling();
}

function setDocumentStyling() {
    const documentObject = {
        hardwareContainer: "hw-info-div col-12 py-2 gap-2 d-flex flex-column align-items-start justify-content-start",
        hwTitleBg: "hw-info-title w-100 bg-primary text-white text-center rounded-2 px-2 py-2",
        hwTitleName: "display-6 fw-normal mt-0 mb-0"
    }

    const hwInfoDiv = document.querySelectorAll(".hw-info-div");
    hwInfoDiv.forEach((element) => {
        element.setAttribute("class", documentObject.hardwareContainer)
    })

    const hwTitleDiv = document.querySelectorAll(".hw-info-title");
    hwTitleDiv.forEach((element) => {
        element.setAttribute("class", documentObject.hwTitleBg)
    })

    const hwTitleName = document.querySelectorAll(".hw-title-name");
    hwTitleName.forEach((element) => {
        element.setAttribute("class", documentObject.hwTitleName)
    })
}

function getCpuUsage() {
    // Define the placeholder divs in an object for later usage
    const cpuDivsObj = {
        cpuStatsDiv: document.getElementById("cpuContent"),
        cpuNameInfoDiv: document.getElementById("cpuNameInfo"),
        cpuCoreInfoDiv: document.getElementById("cpuCoreInfo"),
        cpuArchitectureDiv: document.getElementById("cpuArchitecture"),
        cpuRuntimeInfo: document.getElementById("cpuRuntimeInfo")
    };

    if (cpuDivsObj.cpuStatsDiv) {
        const cpuRuntimeSpinner = createSpinner(document.createElement("div"), cpuDivsObj.cpuRuntimeInfo);
        cpuDivsObj.cpuStatsDiv.classList.add("fs-5");
        chrome.system.cpu.getInfo(function (cpuInfo) {
            if (!cpuInfo) {
                console.error("Failed to get CPU information.");
                return;
            }
            // Create and show spinners
            createSpinner(document.createElement("div"), cpuDivsObj.cpuRuntimeInfo);

            displayCpuInfo(cpuInfo, cpuDivsObj);

            // Hide spinners once CPU info is loaded
            cpuRuntimeSpinner.remove();

            // Update processor usage every half a second (500ms)
            setInterval(() => {
                updateProcessorUsage(cpuInfo, cpuDivsObj.cpuRuntimeInfo);
            }, 500);
        });
    }
}

function displayCpuInfo(cpuInfo, cpuDivsObj) {
    const cpuInfoHolder = createParagraph(cpuInfo.modelName, "my-0");
    const cpuArchitectureInfoHolder = createParagraph(cpuInfo.archName, "my-0");

    cpuDivsObj.cpuNameInfoDiv.appendChild(cpuInfoHolder);
    cpuDivsObj.cpuArchitectureDiv.appendChild(cpuArchitectureInfoHolder);
    setArchitecture(cpuInfo, cpuDivsObj.cpuArchitectureDiv);

    const totalCoresHolder = createParagraph(`Total CPU Cores: ${cpuInfo.processors.length} cores.`, "my-0");
    cpuDivsObj.cpuCoreInfoDiv.appendChild(totalCoresHolder);
}
function updateProcessorUsage(cpuInfo, cpuRuntimeInfoDiv) {
    chrome.system.cpu.getInfo(function (updatedCpuInfo) {
        const cpuDetailObj = calculateCpuUsage(updatedCpuInfo.processors);
        // Remove the previous usage display
        while (cpuRuntimeInfoDiv.firstChild) {
            cpuRuntimeInfoDiv.removeChild(cpuRuntimeInfoDiv.firstChild);
        }
        const overallCpuUsageHolder = createParagraph(`CPU Usage: ${cpuDetailObj.usagePercentage.toFixed(2)}%`, "my-0");
        cpuRuntimeInfoDiv.appendChild(overallCpuUsageHolder);

        // Find the progress bar inside the cpuRuntimeInfoDiv
        const progressBar = document.getElementById("cpuProgressBar");
        if (progressBar) {
            // Update the width of the progress bar & text inside it based on CPU usage
            progressBar.style.width = `${cpuDetailObj.usagePercentage.toFixed(2)}%`;
            const progressBarWidth = parseFloat(progressBar.style.width);
            const progressBarStyling = {
                basicStyling: "progress-bar progress-bar-striped progress-bar-animated",
                bgp: "bg-primary",
                bgw: "bg-warning",
                bgd: "bg-danger"
            }

            if (progressBarWidth < 50) {
                progressBar.setAttribute("class", `${progressBarStyling.basicStyling} ${progressBarStyling.bgp}`);
            } else if (progressBarWidth >= 50 && progressBarWidth <= 75) {
                progressBar.setAttribute("class", `${progressBarStyling.basicStyling} ${progressBarStyling.bgw}`);
            } else if (progressBarWidth >= 75) {
                progressBar.setAttribute("class", `${progressBarStyling.basicStyling} ${progressBarStyling.bgd}`);
            }
            // progressBar.textContent = `${cpuDetailObj.usagePercentage.toFixed(2)}%`;
        } else {
            console.log("Progress bar element could not be found.");
        }
    });
}

let previousCpuTimes = null;

function calculateCpuUsage(processors) {
    const cpuObj = {
        totalKernelTime: 0,
        totalUserTime: 0,
        totalIdleTime: 0,
        totalTime: 0
    }

    // Initialize or update previous CPU times if not already done
    if (!previousCpuTimes) {
        previousCpuTimes = processors.map(procInfo => ({
            kernel: procInfo.usage.kernel,
            user: procInfo.usage.user,
            idle: procInfo.usage.idle,
            total: procInfo.usage.total
        }));
        return {
            totalCores: processors.length,
            usagePercentage: 0  // Initial call returns 0% usage
        };
    }

    processors.forEach((procInfo, index) => {
        const prevProcInfo = previousCpuTimes[index];
        const kernelDiff = procInfo.usage.kernel - prevProcInfo.kernel;
        const userDiff = procInfo.usage.user - prevProcInfo.user;
        const idleDiff = procInfo.usage.idle - prevProcInfo.idle;
        const totalDiff = kernelDiff + userDiff + idleDiff;

        cpuObj.totalKernelTime += kernelDiff;
        cpuObj.totalUserTime += userDiff;
        cpuObj.totalIdleTime += idleDiff;
        cpuObj.totalTime += totalDiff;

        // Update previous times with current values
        previousCpuTimes[index] = {
            kernel: procInfo.usage.kernel,
            user: procInfo.usage.user,
            idle: procInfo.usage.idle,
            total: procInfo.usage.total
        };
    });

    const usagePercentage = ((cpuObj.totalKernelTime + cpuObj.totalUserTime) / cpuObj.totalTime) * 100;

    return {
        totalCores: processors.length,
        usagePercentage: usagePercentage
    };
}

// Function to get memory usage
function getMemUsage() {
    const availableMemDiv = document.getElementById("availableMemContent");
    const totalMemDiv = document.getElementById("totalMemContent");

    if (availableMemDiv && totalMemDiv) {
        // Create and show spinners
        const availableMemSpinner = createSpinner(document.createElement("div"), availableMemDiv);
        const totalMemSpinner = createSpinner(document.createElement("div"), totalMemDiv);

        setInterval(() => {
            // Show spinners while loading memory info
            availableMemSpinner.style.display = "block";
            totalMemSpinner.style.display = "block";

            chrome.system.memory.getInfo(function (memInfo) {
                const availableCapacityBytes = memInfo.availableCapacity;
                const capacityBytes = memInfo.capacity;

                const availableCapacityGB = convertBytesToGb(availableCapacityBytes);
                const totalCapacityGB = convertBytesToGb(capacityBytes);

                // Hide spinners once memory info is loaded
                availableMemSpinner.style.display = "none";
                totalMemSpinner.style.display = "none";

                availableMemDiv.textContent = `Available Capacity: ${availableCapacityGB} GB`;
                totalMemDiv.textContent = `Total Capacity: ${totalCapacityGB} GB`;

                // Calculate the percentage of used & total memory to display in the progress bar
                const usedMemoryGB = totalCapacityGB - availableCapacityGB;
                const usedMemoryPercentage = (usedMemoryGB / totalCapacityGB) * 100;

                const availableMemVisualized = document.getElementById("avMemProgressBar");
                availableMemVisualized.style.width = `${usedMemoryPercentage.toFixed(2)}%`;
                availableMemVisualized.textContent = `${usedMemoryPercentage.toFixed(2)}% used`;

                availableMemDiv.classList.add("fs-5");
                totalMemDiv.classList.add("fs-5");
            });
        }, 250);
    } else {
        console.error("Memory content elements not found.");
    }
}

// Function to get Storage Usage Information from user
// NOTE: There could be problem with listing storage names & their total spaces
// since it sometimes returns NULL, sometimes returns name of the storage
// without its capacity shown.
function getStorageUsage() {
    chrome.system.storage.getInfo(function (storageInfo) {
        const storageDiv = document.getElementById("storageContent");
        const storageUl = document.createElement("ul");

        for (let i in storageInfo) {
            let storageObj = storageInfo[i];

            const storagePlaceHolderObj = {
                storageName: storageObj.name.replace(/\u0000/g, ""), // Replace \u0000 with regex (ai)
                storageId: storageObj.id,
                storageCapacity: storageObj.capacity
            }
            const storageLi = document.createElement("li");

            if (storagePlaceHolderObj.storageName.length === 0) {
                storageLi.textContent = `Storage Name: null ${convertBytesToGb(storagePlaceHolderObj.storageCapacity)} GB`;
            } else {
                storageLi.textContent = `Storage Name: ${storagePlaceHolderObj.storageName} ${convertBytesToGb(storagePlaceHolderObj.storageCapacity)} GB`;
            }

            storageDiv.appendChild(storageUl);
            storageUl.appendChild(storageLi);
        }
    });
}

// Function to get Display Information from user hardware
function getDisplayInfo() {
    chrome.system.display.getInfo(function (displayInfo) {
        const displayDiv = document.getElementById("displayContent");
        displayDiv.classList.add("fs-5");

        for (let i in displayInfo) {
            const displayJsonInfoProperties = {
                "Monitor Name": displayInfo[i].name,
                "Width (px)": displayInfo[i].bounds.width,
                "Height (px)": displayInfo[i].bounds.height,
                "Touch Support": displayInfo[i].hasTouchSupport ? "Yes" : "No",
                "Accelerometer Support": displayInfo[i].hasAccelerometerSupport ? "Yes" : "No",
                "DPI X": displayInfo[i].dpiX,
                "DPI Y": displayInfo[i].dpiY,
            };

            const displayUl = document.createElement("ul");

            for (let [key, value] of Object.entries(displayJsonInfoProperties)) {
                console.log(`${key}: ${value}`);
                const displayLi = document.createElement("li");
                displayLi.textContent = `${key}: ${value}`;
                displayUl.appendChild(displayLi);
            }

            displayDiv.appendChild(displayUl);
        }
    });
}


/**
 * Helper Functions
 */

function createParagraph(text, className) {
    const p = document.createElement("p");
    p.setAttribute("class", className);
    p.textContent = text;
    return p;
}

function setArchitecture(cpuInfo, cpuArchitectureDiv) {
    if (cpuInfo.archName === "x86_64" || cpuInfo.archName === "x86") {
        insertArchitectureIntel(cpuArchitectureDiv);
    } else if (!cpuInfo.modelName.includes("Intel(R)") && cpuInfo.modelName.includes("AMD")) {
        insertArchitectureAmd(cpuArchitectureDiv);
    } else if (cpuInfo.archName === "arm64" || cpuInfo.archName === "arm") {
        insertArchitectureArm(cpuArchitectureDiv);
    }
}

function createSpinner(spinner, divName) {
    spinner = document.createElement("div");
    spinner.setAttribute("class", "spinner-border text-white");
    divName.appendChild(spinner);
    return spinner;
}

function convertBytesToGb(bytes) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

let cpuArchInfo = {
    caiClass: "img-fluid object-fit-cover rounded-3 mx-0 my-0",
    caiStyling: "width: 64px !important;"
}

function insertArchitectureIntel(divName) {
    const intel = document.createElement("img");
    intel.setAttribute("class", cpuArchInfo.caiClass);
    intel.setAttribute("style", cpuArchInfo.caiStyling)
    intel.setAttribute("src", "/images/intel.png");
    divName.appendChild(intel);
}

function insertArchitectureAmd(divName) {
    const amd = document.createElement("img");
    amd.setAttribute("class", cpuArchInfo.caiClass);
    amd.setAttribute("style", cpuArchInfo.caiStyling)
    amd.setAttribute("src", "/images/amd.png");
    divName.appendChild(amd);
}

function insertArchitectureArm(divName) {
    const arm = document.createElement("img");
    arm.setAttribute("class", cpuArchInfo.caiClass);
    arm.setAttribute("style", cpuArchInfo.caiStyling)
    arm.setAttribute("src", "/images/arm.png");
    divName.appendChild(arm);
}
