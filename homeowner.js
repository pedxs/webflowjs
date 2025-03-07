/**
 * LINE LIFF Homeowner Integration
 * 
 * This script is designed to be used on https://www.prinsiri.com/liff/homeowner
 * It handles phone verification and redirects to appropriate survey pages.
 * 
 * This script expects that the user has already been authenticated through lifflogin.js,
 * which stores the LINE userId and name in sessionStorage.
 * 
 * This version integrates with the new homeowner verification backend at:
 * https://homeownerverification-573852472812.asia-southeast1.run.app
 */

// API base URL
const API_BASE_URL = "https://homeownerverification-573852472812.asia-southeast1.run.app";

// Global variables for profile information
let LineUserId = '';
let Linename = '';
let Linemail = '';

// Global variables for data and state
let data;
let data2;
let obj;
let urlObject;

/**
 * Main entry function that retrieves LINE user info from sessionStorage
 */
async function main() {
    // Step 1: Get the current URL parameters and create URL object
    const queryString = window.location.search; // Includes all URL variables
    urlObject = new URL(window.location.href);
    
    // Step 2: Get LINE user ID from URL parameter (required)
    LineUserId = urlObject.searchParams.get("lineuser");
    
    // Get name and email from sessionStorage (optional)
    Linename = sessionStorage.getItem("lineName") || '';
    Linemail = sessionStorage.getItem("lineEmail") || '';
    
    console.log("Retrieved user info:", { 
        LineUserId: LineUserId, 
        Linename: Linename, 
        Linemail: Linemail,
        fromURL: 'lineuser',
        fromSession: 'lineName, lineEmail'
    });
    
    // Step 3: Check if LINE user info is available
    if (!LineUserId) {
        console.error("LINE user ID not found in URL parameters. Redirecting to login...");
        // Redirect back to login page with the same parameters
        window.location.href = `https://www.prinsiri.com/liff/login${queryString}`;
        return { ms: "Error", error: "No LINE user ID found" };
    }
    
    // Step 4: If LINE user info is available, proceed with profile verification
    return await verifyProfile(LineUserId, Linename, Linemail);
}

/**
 * Verify user profile with backend
 */  
async function verifyProfile(LineUserId, Linename, Linemail) {
    const { userAgent } = navigator;
    const url = `${API_BASE_URL}/verify/profile`;
    
    try {
        console.log("Verifying profile with backend:", { LineUserId, Linename, Linemail });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                LineUserId: LineUserId,
                Linename: Linename,
                Linemail: Linemail,
                agent: userAgent
            })
        });
        data = await resp.json();
        console.log("Profile verification response:", data);
        return data;
    } catch (error) {
        console.error("Error comparing profile:", error);
        return { ms: "Error", error: error.message };
    }
}

/**
 * Encode object to base64url format
 */
const base64url = (source) => {
    return btoa(encodeURIComponent(JSON.stringify(source)));
};

/**
 * Redirect user to appropriate survey based on page parameter
 */
function redirectToSurvey(obj) {
    let page = urlObject.searchParams.get("page");
    let nextPage = "https://www.prinsiri.com/survey/community-case?transfer="; // Default page

    if (page === "case_assessment") {
        var caseId = urlObject.searchParams.get("case_id");
        nextPage = `https://www.prinsiri.com/survey/case-assessment?case_id=${caseId}&transfer=`;
    } else if (page === "movein_assessment") {
        nextPage = `https://www.prinsiri.com/survey/move-in?transfer=`;
    } else if (page === "commonfee_payment") {
        nextPage = `https://www.prinsiri.com/survey/commonfee-payment?transfer=`;
    } else if (page === "insurance_assessment") {
        nextPage = `https://www.prinsiri.com/survey/insurance-assessment?transfer=`;
    } else if (page === "resident_assessment") {
        nextPage = `https://www.prinsiri.com/survey/resident-assessment?transfer=`;
    } else if (page === "ceo") {
        // Redirect to Google Form with only LineUserId
        const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdSpeZzmOGCeE5YgY16ambSTqwVeE-4yE378DFj-NoZOOU55Q/viewform";
        const finalUrl = `${googleFormUrl}?entry.1348731689=${encodeURIComponent(LineUserId)}`;
        window.location.href = finalUrl;
        return; // Stop further execution
    }

    console.log(`Redirecting to survey page: ${page} at URL: ${nextPage}`);
    const transferData = base64url(obj);
    const redirectUrl = nextPage + transferData;
    window.location.href = redirectUrl;
}

/**
 * Verify phone number and send OTP
 */
async function verifyPhone() { 
    document.querySelector('#submit-phone-form').classList.add('hidden');
    var Phone = document.querySelector("#regis_phone").value;
    var url = `${API_BASE_URL}/verify/phone`;
    
    try {
        console.log("Sending phone number for verification:", { LineUserId, Phone });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                LineUserId: LineUserId,
                Phone: Phone
            })
        });
        data2 = await resp.json();
        console.log("Phone verification response:", data2);
        
        if (data2.ms == 'NotFound') {
            document.querySelector('#phone-not-found').classList.remove('hidden');
        } else if (data2.ms == 'Limit') {
            document.querySelector('#not-verified').classList.remove('hidden');
        } else {
            document.querySelector('#submit-otp-form').classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error sending phone for verification:", error);
        document.querySelector('#not-verified').classList.remove('hidden');
    }
}

/**
 * Verify OTP with backend
 */
async function verifyOTP() {
    var inputOTP = document.querySelector("#regis_otp").value;
    var Phone = document.querySelector("#regis_phone").value;
    
    // Verify OTP with backend
    const url = `${API_BASE_URL}/verify/otp`;
    try {
        console.log("Verifying OTP:", { LineUserId, Phone, OTP: inputOTP });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                LineUserId: LineUserId,
                Phone: Phone,
                OTP: inputOTP
            })
        });
        const result = await resp.json();
        console.log("OTP verification response:", result);
        
        // Handle response based on status from backend
        if (result.success) {
            console.log("OTP verification successful, refreshing page to enter verified path");
            // OTP verification successful - user is now verified in backend
            // Refresh the page to enter the verified path
            window.location.reload();
        } else {
            // OTP verification failed - show error message
            document.querySelector('#warning-otp').classList.remove('hidden');
            
            // If max attempts reached, show not verified message
            if (result.status === 'MaxAttemptsReached') {
                console.log("Maximum OTP attempts reached");
                document.querySelector('#submit-otp-form').classList.add('hidden');
                document.querySelector('#not-verified').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        document.querySelector('#not-verified').classList.remove('hidden');
    }
}

/**
 * Initialize the page when DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Initialize with LINE user data and process profile
        data = await main();
        
        // Handle the response based on verification status
        if (data.ms == 'Verified') {
            obj = {
                CommonFeeId: data.commonfee,
                ProjectName: data.project,
                HouseNumber: data.housenumber,
                PhoneNumber: data.userphone,
                authorize: data.authorize,
                lineUserId: LineUserId,
                total1: data.total1,
                total2: data.total2,
                suffix: data.suffix,
                customerId: data.customerId,
                projectCode: data.projectCode,
                billerId: data.billerId
            };
            redirectToSurvey(obj);
        } else if (data.ms == 'New') {
            document.querySelector('#regis_loading').classList.add('hidden');
            document.querySelector('#submit-phone-form').classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error during initialization:", error);
        // Show appropriate error UI
        if (document.querySelector('#regis_loading')) {
            document.querySelector('#regis_loading').classList.add('hidden');
        }
        if (document.querySelector('#error-message')) {
            document.querySelector('#error-message').classList.remove('hidden');
        }
    }
    
    // Add event listeners
    document.querySelector("#submit-phone-form").addEventListener("submit", (e) => {
        e.preventDefault();
        verifyPhone();
    });
    
    document.querySelector("#submit-otp").addEventListener("click", (e) => {
        verifyOTP();
    });
});