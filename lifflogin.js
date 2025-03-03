// Global variables
const userAgent = navigator.userAgent.toLowerCase();  
const liffId = '1657411915-nDO8alaM';  
let param = window.location.search;  
let urlParam = new URLSearchParams(param); // Defined once at the top

// Function to set timer and update UI
function setTimer() {
    setTimeout(function() {
        document.getElementById("waiting_block").style.display = "none";
        document.getElementById("samsung_block").style.display = "flex";
        document.getElementById('samsung_button').href = `line://app/${liffId}${param}`;
    }, 7000); 
}

// Function to log data to Apps Script
async function sendRequest(queryParams) {
    const url = "https://script.google.com/macros/s/AKfycbyNk2BSfGFZ6smoldTElGWmvJsnP1-tuRycUAmmbe8Q9oHR0dU04-EU5szmJl8MZhwt/exec";
    try {
        await fetch(`${url}${queryParams}`, {
            mode: 'no-cors' 
        });
    } catch (error) {
        console.error('Error during API call:', error);
    }
}


async function lifflogin() {
    const isDesktop = !/android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);

    console.log(`User Agent: ${userAgent}`);
    console.log(`isDesktop: ${isDesktop}`);
    console.log(`Current URL Parameters: ${param}`);

    // Step 1A: If desktop, restore UTM parameters **before overriding `urlParam`**
    if (isDesktop && urlParam.has("liffRedirectUri")) {
        const storedParams = localStorage.getItem("utmParams");
        if (storedParams) {
            console.log("🔹 Detected login redirect. Restoring UTM parameters:", storedParams);
            urlParam = new URLSearchParams(storedParams); // Update the global variable
        }
    }

    // Step 1B: If desktop, store UTM parameters before LIFF initialization
    if (isDesktop) {
        if (urlParam.toString()) {
            localStorage.setItem("utmParams", urlParam.toString());
            console.log("🔹 Stored UTM parameters before login:", urlParam.toString());
        }
    }

    // Step 2: Initialize LIFF
    try {
        console.log("Initializing LIFF...");
        await liff.init({ 
            liffId: liffId, 
            withLoginOnExternalBrowser: isDesktop // Use external browser login on PC/laptop
        }); 
        console.log("✅ LIFF initialized successfully.");
    } catch (error) {
        console.error("❌ Error: LIFF initialization failed.", error);
        return; // Exit if LIFF fails to initialize
    }

    // Step 3: Try fetching the profile
    console.log("🔄 Attempting to fetch profile...");
    let profile = null;
    try {
        profile = await liff.getProfile();
        console.log("✅ Profile fetched successfully:", profile);
        sendProfileAndRedirect(profile.userId, profile.displayName);
        return; // Exit after success
    } catch (error) {
        console.error("❌ Error: Failed to get profile. Error details:", error);
    }

    // Step 4: If profile fetch failed, send request before handling login
    const line = urlParam.get("line");
    if (line && line.trim() !== "") {
        const queryString = `${param}&agent=inclient-${isDesktop}&line=${line}`;
        await sendRequest(queryString);
    }

    // Step 7: Handle login failure (Desktop → Logout & Re-login, Mobile → Redirect to LINE App)
    console.warn("⚠️ Handling login failure after request completion.");

    if (isDesktop) {
        console.warn("🔄 Logging out and forcing re-login on desktop...");
        liff.logout();

        setTimeout(() => {
            liff.login({ redirectUri: window.location.href });
        }, 500); // Slight delay to ensure logout is processed
    } else {
        console.warn("📲 Redirecting mobile user to LINE app login...");
        window.location.href = `line://app/${liffId}${param}`; // Forces LINE client verification
    }
}



// Function to send profile data and handle redirection
async function sendProfileAndRedirect(lineuser, name) {
    const projectid = urlParam.get("projectid");  
    const line = urlParam.get("line");
    const page = urlParam.get("page");
    let param = `?${urlParam.toString()}`;
    if (page === "walk") {
        window.location.href = `https://www.prinsiri.com/survey/walk${param}&line_login=${lineuser}`;
    } else if (page === "walkcms") {
        window.location.href = `https://www.prinsiri.com/walk-survey/${projectid}${param}&line_login=${lineuser}`;
    } else if (page === "assessment") {
        window.location.href = `https://www.prinsiri.com/survey/guard-house-and-assessment${param}&userid=${lineuser}`;
    } else if (line && line.trim() !== "") {
        await sendRequest(`${param}&lineuser=${lineuser}&name=${name}&agent=${userAgent}&line=${line}`);
        window.location.href = "https://lin.ee/" + line;
    } else {
        console.error('Missing or empty "line" parameter in the URL');
    }
}

// Event listener that runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    setTimer();  
    lifflogin();
});