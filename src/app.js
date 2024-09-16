document.addEventListener("DOMContentLoaded", initSystemInfo);

function initSystemInfo() {
    getCpuUsage();
    getGraphicsInfo();
    getMemUsage();
    getStorageUsage();
    getDisplayInfo();
    displayNetworkInfo();
    setDocumentStyling();
    blurContent();
}

// Function to blur content based on tab switching
function blurContent() {
    const tabsConfig = {
        monitorTab: {
            button: document.querySelector(".hwmonitor-btn"),
            tab: document.querySelector("#hardwareMonitoringDiv")
        },
        infoTab: {
            button: document.querySelector(".hwinfo-btn"),
            tab: document.querySelector("#hardwareInfoDiv")
        }
    };

    // Blur the Information Div because Monitoring Div is active by default
    tabsConfig.infoTab.tab.classList.add("blur");

    const updateBlur = () => {
        const { monitorTab, infoTab } = tabsConfig;
        if (monitorTab.button.checked) {
            monitorTab.tab.classList.remove("blur");
            infoTab.tab.classList.add("blur");
        } else if (infoTab.button.checked) {
            infoTab.tab.classList.remove("blur");
            monitorTab.tab.classList.add("blur");
        }
    };

    // Add change event listeners to the radio buttons
    tabsConfig.monitorTab.button.addEventListener("change", updateBlur);
    tabsConfig.infoTab.button.addEventListener("change", updateBlur);
}

function setDocumentStyling() {
    const documentObject = {
        hardwareContainer: "hw-info-div col-12 py-2 gap-2 d-flex flex-column align-items-start justify-content-start",
        hwTitleBg: "hw-info-title w-100 bg-primary text-white text-center rounded-2 px-2 py-2",
        hwTitleName: "display-6 fw-normal mt-0 mb-0"
    };

    document.querySelectorAll(".hw-info-div").forEach(element => {
        element.className = documentObject.hardwareContainer;
    });

    document.querySelectorAll(".hw-info-title").forEach(element => {
        element.className = documentObject.hwTitleBg;
    });

    document.querySelectorAll(".hw-title-name").forEach(element => {
        element.className = documentObject.hwTitleName;
    });
}

function getCpuUsage() {
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

        chrome.system.cpu.getInfo(cpuInfo => {
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
    chrome.system.cpu.getInfo(updatedCpuInfo => {
        const cpuDetailObj = calculateCpuUsage(updatedCpuInfo.processors);
        // Remove the previous usage display
        cpuRuntimeInfoDiv.innerHTML = "";

        const overallCpuUsageHolder = createParagraph(`CPU Usage: ${cpuDetailObj.usagePercentage.toFixed(2)}%`, "my-0");
        cpuRuntimeInfoDiv.appendChild(overallCpuUsageHolder);

        // Update the progress bar
        const progressBar = document.getElementById("cpuProgressBar");
        if (progressBar) {
            const usagePercentage = cpuDetailObj.usagePercentage.toFixed(2);
            progressBar.style.width = `${usagePercentage}%`;
            updateProgressBarClass(progressBar, usagePercentage);
        } else {
            console.log("Progress bar element could not be found.");
        }
    });
}

function updateProgressBarClass(progressBar, usagePercentage) {
    const progressBarStyling = {
        basicStyling: "progress-bar progress-bar-striped progress-bar-animated",
        bgp: "bg-primary",
        bgw: "bg-warning",
        bgd: "bg-danger"
    };

    if (usagePercentage < 50) {
        progressBar.setAttribute("class", `${progressBarStyling.basicStyling} ${progressBarStyling.bgp}`);
    } else if (usagePercentage >= 50 && usagePercentage <= 75) {
        progressBar.setAttribute("class", `${progressBarStyling.basicStyling} ${progressBarStyling.bgw}`);
    } else {
        progressBar.setAttribute("class", `${progressBarStyling.basicStyling} ${progressBarStyling.bgd}`);
    }
}

let previousCpuTimes = null;

function calculateCpuUsage(processors) {
    const cpuObj = {
        totalKernelTime: 0,
        totalUserTime: 0,
        totalIdleTime: 0,
        totalTime: 0
    };

    if (!previousCpuTimes) {
        previousCpuTimes = processors.map(procInfo => ({
            kernel: procInfo.usage.kernel,
            user: procInfo.usage.user,
            idle: procInfo.usage.idle,
            total: procInfo.usage.total
        }));
        return {
            totalCores: processors.length,
            usagePercentage: 0 // Initial call returns 0% usage
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
        usagePercentage
    };
}

// Function to get GPU Information using WebGL API
function getGraphicsInfo() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
        console.error("WebGL not supported.");
        return null;
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return { vendor, renderer };
    } else {
        console.warn("WEBGL_debug_renderer_info extension is not supported.");
        return null;
    }
}

const cpuArchInfo = {
    caiClass: "img-fluid object-fit-cover rounded-3 mx-0 my-0",
    caiStyling: "width: 64px !important;"
};

const webGLInfo = getGraphicsInfo();

function displayGPUInfo(webGLInfo) {
    if (!webGLInfo) {
        console.log("Failed to retrieve WebGL information.");
        return;
    }

    const gpuVendorDiv = document.getElementById("gpuVendorLogo");
    const gpuInfoDiv = document.getElementById("gpuInfo");

    const vendorImages = {
        "AMD": "/images/amd.png",
        "Nvidia": "/images/nvidia.png",
        "Intel": "/images/intel.png",
        "Arm": "/images/arm.png"
    };

    const selectedVendor = Object.keys(vendorImages).find(vendor => webGLInfo.vendor.includes(vendor));

    if (selectedVendor) {
        insertArchitecture(gpuVendorDiv, vendorImages[selectedVendor]);
    }

    gpuInfoDiv.textContent = webGLInfo.renderer;
}

displayGPUInfo(webGLInfo);

// Function to get memory usage
function getMemUsage() {
    const availableMemDiv = document.getElementById("availableMemContent");
    const totalMemDiv = document.getElementById("totalMemContent");

    if (availableMemDiv && totalMemDiv) {
        const availableMemSpinner = createSpinner(document.createElement("div"), availableMemDiv);
        const totalMemSpinner = createSpinner(document.createElement("div"), totalMemDiv);

        setInterval(() => {
            availableMemSpinner.style.display = "block";
            totalMemSpinner.style.display = "block";

            chrome.system.memory.getInfo(memInfo => {
                const availableCapacityGB = convertBytesToGb(memInfo.availableCapacity);
                const totalCapacityGB = convertBytesToGb(memInfo.capacity);

                availableMemSpinner.style.display = "none";
                totalMemSpinner.style.display = "none";

                availableMemDiv.textContent = `Available Capacity: ${availableCapacityGB} GB`;
                totalMemDiv.textContent = `Total Capacity: ${totalCapacityGB} GB`;

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
function getStorageUsage() {
    chrome.system.storage.getInfo(storageInfo => {
        const storageDiv = document.getElementById("storageContent");
        const storageUl = document.createElement("ul");
        storageUl.className = "col-12 w-100 d-flex flex-column gap-2 my-0 py-0";

        storageInfo.forEach(storageObj => {
            const storageName = storageObj.name.replace(/\u0000/g, ""); // Replace \u0000 with regex
            const storageCapacityGB = convertBytesToGb(storageObj.capacity);
            const storageLi = document.createElement("li");

            storageLi.textContent = storageName.length === 0
                ? `Storage Name: null = ${storageCapacityGB} GB`
                : `Storage Name: ${storageName} = ${storageCapacityGB} GB`;

            storageUl.appendChild(storageLi);
        });

        storageDiv.appendChild(storageUl);
    });
}

// Function to get Display Information from user hardware
function getDisplayInfo() {
    chrome.system.display.getInfo(displayInfo => {
        const displayDiv = document.getElementById("displayContent");
        displayDiv.classList.add("fs-5");

        displayInfo.forEach(display => {
            const displayJsonInfoProperties = {
                "Monitor Name": display.name,
                "Width (px)": display.bounds.width,
                "Height (px)": display.bounds.height,
                "Touch Support": display.hasTouchSupport ? "Yes" : "No",
                "Accelerometer Support": display.hasAccelerometerSupport ? "Yes" : "No",
                "DPI X": display.dpiX,
                "DPI Y": display.dpiY,
            };

            const displayUl = document.createElement("ul");
            displayUl.className = "d-flex flex-column gap-2 my-0 py-0";

            Object.entries(displayJsonInfoProperties).forEach(([key, value]) => {
                const displayLi = document.createElement("li");
                displayLi.textContent = `${key}: ${value}`;
                displayUl.appendChild(displayLi);
            });

            displayDiv.appendChild(displayUl);
        });
    });
}

// Function to display network information
function displayNetworkInfo() {
    const networkDiv = document.getElementById("networkContent");
    updateNetworkStatus(networkDiv, window.navigator.onLine);

    navigator.connection.addEventListener("change", event => {
        console.log(event.currentTarget.effectiveType);
    });

    window.addEventListener("online", () => {
        console.log("This machine is connected to the internet.");
        updateNetworkStatus(networkDiv, true);
        getNetworkType();
    });

    window.addEventListener("offline", () => {
        console.alert("This machine is not connected to the internet.");
        updateNetworkStatus(networkDiv, false);
    });
}

/**
 * Helper Functions
 */

// Function to get network properties based on NetworkInformation API
function updateNetworkStatus(target, isConnected) {
    if (navigator.connection) {
        const { effectiveType, downlink, rtt, saveData } = navigator.connection;

        console.log(`Connection type: ${effectiveType}`);
        console.log(`Downlink speed: ${downlink} Mbps`);
        console.log(`Round-trip time: ${rtt} ms`);

        const statusMessage = isConnected
            ? `
            <div class="d-flex flex-column gap-2">
                <div class="alert alert-success mb-0" role="alert">
                    <div class="d-flex flex-row align-items-center justify-content-start gap-4 my-0 py-0 fs-5">
                        <span><img class="bootstrap-icon" src="/images/bootstrap/check-circle.svg"></span>
                        <div>Computer is connected to a network.</div>
                    </div>
                </div>
                <div>
                    <ul class="d-flex flex-column gap-2 my-0 py-0">
                        <li>Network Quality: ${effectiveType.toUpperCase()}</li>
                        <li>Latency: ${rtt}</li>
                        <li>Estimated Download Speed: ${downlink} Mbps</li>
                        <li>Reduced Data Usage is ${saveData ? "ON" : "OFF"}</li>
                    </ul>
                </div>
            </div>
            `
            : `
            <div class="alert alert-danger mb-0" role="alert">
                <div class="d-flex flex-row align-items-center justify-content-start gap-4 my-0 py-0 fs-5">
                    <span><img class="bootstrap-icon" src="/images/bootstrap/exclamation-circle.svg"></span>
                    <div>Computer is not connected to a network.</div>
                </div>
            </div>`;

        target.innerHTML = statusMessage;
    } else {
        console.log("Network Information API is not supported in this browser.");
    }
}

function createParagraph(text, className) {
    const p = document.createElement("p");
    p.className = className;
    p.textContent = text;
    return p;
}

// Function to set architecture
function setArchitecture(cpuInfo, cpuArchitectureDiv) {
    const architectureImages = {
        "x86_64": "/images/intel.png",
        "x86": "/images/intel.png",
        "arm64": "/images/arm.png",
        "arm": "/images/arm.png",
        "AMD": "/images/amd.png"
    };

    const isAMD = cpuInfo.modelName.includes("AMD") && !cpuInfo.modelName.includes("Intel");
    const imgSource = isAMD ? architectureImages.AMD : architectureImages[cpuInfo.archName];

    if (imgSource) {
        insertArchitecture(cpuArchitectureDiv, imgSource);
    }
}

// Function to create a loader spinner
function createSpinner(spinner, divName) {
    spinner = document.createElement("div");
    spinner.className = "spinner-border text-white";
    divName.appendChild(spinner);
    return spinner;
}

// Function to convert byte data to gb
function convertBytesToGb(bytes) {
    return (bytes / (1024 ** 3)).toFixed(2);
}

// Function to insert logo to proper architectures
function insertArchitecture(divName, imgSource) {
    const img = document.createElement("img");
    img.className = cpuArchInfo.caiClass;
    img.style = cpuArchInfo.caiStyling;
    img.src = imgSource;
    divName.appendChild(img);
}