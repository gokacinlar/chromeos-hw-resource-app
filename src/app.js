// Function to read CPU information

document.addEventListener("DOMContentLoaded", function () {
    initSystemInfo();
});

function initSystemInfo() {
    getCpuUsage();
    getMemUsage();
    getStorageUsage();
}

function getCpuUsage() {
    chrome.system.cpu.getInfo(function (cpuInfo) {
        if (!cpuInfo) {
            console.error("Failed to get CPU information.");
            return;
        } else {
            const cpuStatsDiv = document.getElementById("cpuContent");
            const cpuArchitectureDiv = document.getElementById("cpuArchitecture");

            if (cpuStatsDiv) {
                const cpuInfoHolder = document.createElement("p");
                const cpuArchitectureInfoHolder = document.createElement("p");

                cpuInfoHolder.setAttribute("class", "my-0")
                cpuArchitectureInfoHolder.setAttribute("class", "my-0")

                cpuInfoHolder.textContent = `${cpuInfo.modelName}`;
                cpuArchitectureInfoHolder.textContent = `${cpuInfo.archName}`;

                if (cpuInfo.archName === "x86_64" || cpuInfo.archName === "x86") {
                    insertArchitectureIntel(cpuArchitectureDiv);
                } else if (!cpuInfo.modelName.includes("Intel(R)" && cpuInfo.includes("AMD"))) {
                    insertArchitectureAmd(cpuArchitectureDiv);
                } else if (cpuInfo.archName === "arm64" || cpuInfo.archName === "arm") {
                    insertArchitectureArm(cpuArchitectureDiv)
                }

                cpuStatsDiv.appendChild(cpuInfoHolder);
                cpuStatsDiv.classList.add("fs-5");
                cpuArchitectureDiv.appendChild(cpuArchitectureInfoHolder);
            }
        }
    });
}

function getMemUsage() {
    chrome.system.memory.getInfo(function (memInfo) {
        const availableCapacityBytes = memInfo.availableCapacity;
        const capacityBytes = memInfo.capacity;

        let availableCapacityGB = convertBytesToGb(availableCapacityBytes);
        let totalCapacityGB = convertBytesToGb(capacityBytes);

        const availableMemDiv = document.getElementById("availableMemContent");
        const totalMemDiv = document.getElementById("totalMemContent");

        if (availableMemDiv && totalMemDiv) {
            availableMemDiv.textContent = `Available Capacity: ${availableCapacityGB} GB`;
            totalMemDiv.textContent = `Total Capacity: ${totalCapacityGB} GB`;

            availableMemDiv.classList.add("fs-5");
            totalMemDiv.classList.add("fs-5");
        } else {
            console.error("Memory content elements not found.");
        }
    });
}

function getStorageUsage() {
    chrome.system.storage.getInfo(function (storageInfo) {
        console.log(storageInfo);
        const storageDiv = document.getElementById("storageContent");
        for (let i in storageInfo) {
            let storageObj = storageInfo[i];

            let storageName = storageObj.name;
            let storageId = storageObj.id;
            let storageCapacity = storageObj.capacity;

            console.log(storageName, storageId, storageCapacity);

            const ul = document.createElement("ul");
            const li = document.createElement("li")

            li.textContent = `${convertBytesToGb(storageCapacity)} GB`;

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