/**
 * LINE LIFF Login Integration
 * 
 * This script is designed to be used on https://www.prinsiri.com/liff/login
 * It handles the LINE login flow and redirects users based on URL parameters.
 * 
 * Requires the LIFF SDK to be included in the HTML:
 * <script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
 */

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

// Function to get or create a session ID
function getSessionId() {
    // Try to get the existing session ID
    let sessionId = sessionStorage.getItem('lineLoginSessionId');
    
    // If no session ID exists, create a new one
    if (!sessionId) {
        sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('lineLoginSessionId', sessionId);
        console.log('Created new session ID:', sessionId);
    } else {
        console.log('Using existing session ID:', sessionId);
    }
    
    return sessionId;
}

// Function to log data to our backend
async function sendRequest(queryParams, event = "page_view") {
    const backendUrl = "https://pubsub-826626291152.asia-southeast1.run.app/LiffLogin";
    try {
        // Parse the query parameters into an object
        const urlParams = new URLSearchParams(queryParams);
        const dataObj = {};
        
        // Convert URL parameters to a proper JSON object
        for (const [key, value] of urlParams.entries()) {
            dataObj[key] = value;
        }
        
        // Add required fields for the backend
        dataObj.payloadkey = getSessionId();
        
        // Create a structured payloaddatatype as JSON object for easier filtering
        dataObj.payloaddatatype = JSON.stringify({
            type: event,
            page: urlParam.get("page") || "default",
            line: urlParam.get("line") || "",
            hasProfile: dataObj.lineuser ? true : false,
            timestamp: new Date().toISOString()
        });
        
        dataObj.timestamp = new Date().toISOString();
        
        try {
            // Make the POST request to the backend with proper CORS settings
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors', // Explicitly set CORS mode
                credentials: 'omit', // Don't send cookies
                body: JSON.stringify(dataObj)
            });
            
            console.log('Backend response:', response.status);
        } catch (fetchError) {
            // If the backend request fails, we'll log it but continue execution
            console.warn('Backend logging failed, but continuing execution:', fetchError);
        }
    } catch (error) {
        console.error('Error processing data for backend:', error);
    }
}


async function lifflogin() {
    const isDesktop = !/android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
    const sessionId = getSessionId();

    console.log(`Session ID: ${sessionId}`);
    console.log(`User Agent: ${userAgent}`);
    console.log(`isDesktop: ${isDesktop}`);
    console.log(`Current URL Parameters: ${param}`);
    
    // Log initial page load - this is the only general event we log
    await sendRequest(`${param}&agent=${userAgent}&isDesktop=${isDesktop}`, "page_load");

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
        // Check if LIFF SDK is loaded
        if (typeof liff === 'undefined') {
            throw new Error("LIFF SDK not found. Make sure to include the LINE LIFF SDK in your HTML.");
        }
        
        console.log("Initializing LIFF...");
        await liff.init({ 
            liffId: liffId, 
            withLoginOnExternalBrowser: isDesktop // Use external browser login on PC/laptop
        }); 
        console.log("✅ LIFF initialized successfully.");
    } catch (error) {
        console.error("❌ Error: LIFF initialization failed.", error);
        
        // Show the samsung_block for manual login when LIFF fails
        document.getElementById("waiting_block").style.display = "none";
        document.getElementById("samsung_block").style.display = "flex";
        document.getElementById('samsung_button').href = `line://app/${liffId}${param}`;
        
        return; // Exit if LIFF fails to initialize
    }

    // Step 3: Try fetching the profile
    console.log("🔄 Attempting to fetch profile...");
    let profile = null;
    try {
        profile = await liff.getProfile();
        console.log("✅ Profile fetched successfully:", profile);
        
        // Send the profile data to the backend
        const profileData = `${param}&lineuser=${profile.userId}&name=${profile.displayName}&agent=${userAgent}&isDesktop=${isDesktop}&pictureUrl=${profile.pictureUrl || ''}&statusMessage=${encodeURIComponent(profile.statusMessage || '')}`;
        await sendRequest(profileData, "profile_success");
        
        // Handle the redirect separately
        handleRedirect(profile.userId, profile.displayName);
        return; // Exit after success
    } catch (error) {
        console.error("❌ Error: Failed to get profile. Error details:", error);
    }

    // Step 4: If profile fetch failed, handle login fallback
    const line = urlParam.get("line");
    if (line && line.trim() !== "") {
        console.log("Handling login fallback for LINE client");
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



// Function to handle redirection based on URL parameters
async function handleRedirect(lineuser, name) {
    const projectid = urlParam.get("projectid");  
    const line = urlParam.get("line");
    const page = urlParam.get("page");
    let param = `?${urlParam.toString()}`;
    
    console.log("Handling redirect with parameters:", { lineuser, name, projectid, line, page });
    
    if (page === "walk") {
        window.location.href = `https://www.prinsiri.com/survey/walk${param}&line_login=${lineuser}`;
    } else if (page === "walkcms") {
        window.location.href = `https://www.prinsiri.com/walk-survey/${projectid}${param}&line_login=${lineuser}`;
    } else if (page === "assessment") {
        window.location.href = `https://www.prinsiri.com/survey/guard-house-and-assessment${param}&userid=${lineuser}`;
    } else if (line && line.trim() !== "") {
        window.location.href = "https://lin.ee/" + line;
    } else {
        console.error('Missing or empty "line" parameter in the URL');
    }
}

// Event listener that runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Set a timer as a fallback in case loading takes too long
    setTimer();
    
    // Initialize the LIFF login process
    lifflogin().catch(error => {
        console.error("Unhandled error in LIFF login process:", error);
        // Make sure the fallback UI is displayed in case of any unhandled errors
        document.getElementById("waiting_block").style.display = "none";
        document.getElementById("samsung_block").style.display = "flex";
        document.getElementById('samsung_button').href = `line://app/${liffId}${param}`;
    });
});