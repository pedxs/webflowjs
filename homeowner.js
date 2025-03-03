/**
 * LINE LIFF Homeowner Integration
 * 
 * This script is designed to be used on https://www.prinsiri.com/liff/homeowner
 * It handles phone verification and redirects to appropriate survey pages.
 * 
 * This script expects that the user has already been authenticated through lifflogin.js,
 * which stores the LINE userId and name in sessionStorage.
 */

// Global variables for profile information
let LineUserId = '';
let Linename = '';
let Linemail = '';

// Global variables for data and state
let data;
let data2;
let obj;
let otpCount = 0;
let urlObject;

/**
 * Main entry function that retrieves LINE user info from sessionStorage
 */
async function main() {
    // Step 1: Get the current URL parameters
    const queryString = window.location.search; // Includes all URL variables
    
    // Step 2: Retrieve LINE user info from sessionStorage
    // This info should have been set by lifflogin.js before redirecting here
    LineUserId = sessionStorage.getItem("lineUserId");
    Linename = sessionStorage.getItem("lineName");
    
    console.log("Retrieved from sessionStorage:", { LineUserId, Linename });
    
    // Step 3: Check if LINE user info is available
    if (!LineUserId) {
        console.error("LINE user ID not found in sessionStorage. Redirecting to login...");
        // Redirect back to login page with the same parameters
        window.location.href = `https://www.prinsiri.com/liff/login${queryString}`;
        return { ms: "Error", error: "No LINE user ID found" };
    }
    
    // Step 4: If LINE user info is available, proceed with profile comparison
    return await CompareProfile(LineUserId, Linename, Linemail || '');
}

/**
 * Compare and validate user profile with backend
 */  
async function CompareProfile(LineUserId, Linename, Linemail) {
    const { userAgent } = navigator;
    const url = "https://script.google.com/macros/s/AKfycbwn9PdnwmUKq0hw10x8MBC2c3FOByzC86iaEJTQqeXajWy5y890AjbcnmOEYWYNS1YX/exec";
    
    try {
        const resp = await fetch(`${url}?LineUserId=${LineUserId}&Linename=${Linename}&Linemail=${Linemail}&agent=${userAgent}`);
        data = await resp.json();
        console.log(data.ms);
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
 * Send phone number for OTP verification
 */
async function sendPhone() { 
    document.querySelector('#submit-phone-form').classList.add('hidden');
    var Phone = document.querySelector("#regis_phone").value;
    var url = "https://script.google.com/macros/s/AKfycbzR4cl-gFbYlw3Pkkw_1lofGhaZ8ULk3VXy1SHaPjS36dyTvTD_6j9PRKRAvXPQdlp4sw/exec";
    
    try {
        const resp = await fetch(`${url}?LineUserId=${LineUserId}&Phone=${Phone}`);
        data2 = await resp.json();
        
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
 * Check OTP and proceed if valid
 */
async function checkOTP() {
    otpCount += 1;
    console.log(obj);
    var inputOTP = document.querySelector("#regis_otp").value;
    
    if (inputOTP == data2.otp && otpCount <= 3) {
        var Phone = document.querySelector("#regis_phone").value;
        obj = {
            HouseNumber: data2.housenumber,
            PhoneNumber: Phone,
            ProjectName: data2.project,
            CommonFeeId: data2.commonfee,
            lineUserId: LineUserId,
            total1: data2.total1,
            total2: data2.total2,
            suffix: data2.suffix,
            customerId: data2.customerId,
            projectCode: data2.projectCode,
            billerId: data2.billerId
        };
        
        var url = "https://script.google.com/macros/s/AKfycbw0F3OArdiNizsQrXmFAroR8Tzoitqqic0Q4jBKuvGw3uhtKOSjTSeKfqfjYv3oXTvz/exec";
        try {
            fetch(`${url}?LineUserId=${LineUserId}&Phone=${Phone}&Commonfee=${data2.commonfee}&ProjectName=${data2.project}&HouseNumber=${data2.housenumber}&total1=${data2.total1}&total2=${data2.total2}&suffix=${data2.suffix}&customerId=${data2.customerId}&projectCode=${data2.projectCode}&billerId=${data2.billerId}`, 
                { redirect: 'follow', mode: 'no-cors' });
            redirectToSurvey(obj);
        } catch (error) {
            console.error("Error saving verification data:", error);
            redirectToSurvey(obj); // Still redirect even if logging fails
        }
    } else if (otpCount <= 3) {
        document.querySelector('#warning-otp').classList.remove('hidden');
    } else {
        document.querySelector('#submit-otp-form').classList.add('hidden');
        document.querySelector('#not-verified').classList.remove('hidden');
    }
}

/**
 * Initialize the page when DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        data = await main();
        urlObject = new URL(window.location.href);
        
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
        sendPhone();
    });
    
    document.querySelector("#submit-otp").addEventListener("click", (e) => {
        checkOTP();
    });
});