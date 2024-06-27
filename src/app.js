// Function to read CPU information

// add function to display current cpu usage
// add function to display storage usage in a progress bar
// add function to display available mem usage in a progress bar 


document.addEventListener("DOMContentLoaded", function () {
    initSystemInfo();
});

function initSystemInfo() {
    getCpuUsage();
    getMemUsage();
    getStorageUsage();
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

    const totalCoresHolder = createParagraph(`Total CPU Cores: ${cpuInfo.processors.length}`, "my-0");
    cpuDivsObj.cpuCoreInfoDiv.appendChild(totalCoresHolder);
}

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

function updateProcessorUsage(cpuInfo, cpuRuntimeInfoDiv) {
    chrome.system.cpu.getInfo(function (updatedCpuInfo) {
        const cpuDetailObj = calculateCpuUsage(updatedCpuInfo.processors);
        // Remove the previous usage display
        while (cpuRuntimeInfoDiv.firstChild) {
            cpuRuntimeInfoDiv.removeChild(cpuRuntimeInfoDiv.firstChild);
        }
        const overallCpuUsageHolder = createParagraph(`CPU Usage: ${cpuDetailObj.usagePercentage.toFixed(2)}%`, "my-0");
        cpuRuntimeInfoDiv.appendChild(overallCpuUsageHolder);
    });
}

function calculateCpuUsage(processors) {
    let totalKernelTime = 0;
    let totalUserTime = 0;
    let totalTime = 0;

    processors.forEach(procInfo => {
        totalKernelTime += procInfo.usage.kernel;
        totalUserTime += procInfo.usage.user;
        totalTime += procInfo.usage.total;
    });

    const usagePercentage = ((totalKernelTime + totalUserTime) / totalTime) * 100;

    return {
        totalCores: processors.length,
        usagePercentage: usagePercentage
    };
}

function createSpinner(spinner, divName) {
    spinner = document.createElement("div");
    spinner.setAttribute("class", "spinner-border text-white");
    divName.appendChild(spinner);
    return spinner;
}

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

                let availableCapacityGB = convertBytesToGb(availableCapacityBytes);
                let totalCapacityGB = convertBytesToGb(capacityBytes);

                // Hide spinners once memory info is loaded
                availableMemSpinner.style.display = "none";
                totalMemSpinner.style.display = "none";

                availableMemDiv.textContent = `Available Capacity: ${availableCapacityGB} GB`;
                totalMemDiv.textContent = `Total Capacity: ${totalCapacityGB} GB`;

                availableMemDiv.classList.add("fs-5");
                totalMemDiv.classList.add("fs-5");
            });
        }, 250);
    } else {
        console.error("Memory content elements not found.");
    }
}

function getStorageUsage() {
    chrome.system.storage.getInfo(function (storageInfo) {
        const storageDiv = document.getElementById("storageContent");
        for (let i in storageInfo) {
            let storageObj = storageInfo[i];

            const storagePlaceHolderObj = {
                storageName: storageObj.name,
                storageId: storageObj.id,
                storageCapacity: storageObj.capacity
            }

            console.log(storagePlaceHolderObj.storageName, storagePlaceHolderObj.storageId, storagePlaceHolderObj.storageCapacity);

            const ul = document.createElement("ul");
            const li = document.createElement("li")

            li.textContent = `${convertBytesToGb(storagePlaceHolderObj.storageCapacity)} GB`;

            storageDiv.appendChild(ul);
            ul.appendChild(li);
        }
    });
}

function convertBytesToGb(bytes) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function insertArchitectureIntel(divName) {
    const intel = document.createElement("img");
    intel.setAttribute("class", "img-fluid object-fit-cover rounded-3 mx-0 my-0");
    intel.setAttribute("style", "width: 64px !important;")
    intel.setAttribute("src", "/images/intel.png");
    divName.appendChild(intel);
}

function insertArchitectureAmd(divName) {
    const amd = document.createElement("img");
    amd.setAttribute("class", "img-fluid object-fit-cover rounded-3 mx-0 my-0");
    amd.setAttribute("style", "width: 64px !important;")
    amd.setAttribute("src", "/images/amd.png");
    divName.appendChild(amd);
}

function insertArchitectureArm(divName) {
    const arm = document.createElement("img");
    arm.setAttribute("class", "img-fluid object-fit-cover rounded-3 mx-0 my-0");
    arm.setAttribute("style", "width: 64px !important;")
    arm.setAttribute("src", "/images/arm.png");
    divName.appendChild(arm);
}