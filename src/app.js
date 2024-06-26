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
        const cpuStatsDiv = document.getElementById("cpuContent");
        if (cpuStatsDiv) {
            const cpuInfoHolder = document.createElement("p");
            cpuInfoHolder.textContent = `${cpuInfo.archName} \r\n ${cpuInfo.modelName}`;
            cpuStatsDiv.appendChild(cpuInfoHolder)
            cpuStatsDiv.classList.add("fs-5");
        } else {
            console.error("CPU content element not found.");
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