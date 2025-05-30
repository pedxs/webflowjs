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
 * 
 * Version: 2025-03-21
 */

// Log version info to console to verify which version is loaded
console.log("Homeowner.js loaded - Version: 2025-03-21 - Enhanced OTP verification process and form handling");

// API base URL
const API_BASE_URL = "https://homeownerverification-573852472812.asia-southeast1.run.app";

// API endpoints
const ENDPOINTS = {
  profile: "/check_user",          // Verify user based on LINE user ID
  phone: "/verify_phone_number",   // Send OTP to the provided phone number
  otp: "/verify_otp"               // Verify the OTP entered by the user
};

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
        // Redirect back to login page with the same parameters using relative path
        const origin = window.location.origin;
        window.location.href = `${origin}/liff/login${queryString}`;
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
    const url = `${API_BASE_URL}${ENDPOINTS.profile}`;
    
    try {
        console.log("Verifying profile with backend:", { LineUserId, Linename, Linemail });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                user_id: LineUserId,
                name: Linename,
                email: Linemail,
                agent: userAgent
            })
        });
        
        console.log("Profile verification status:", resp.status);
        
        // Return the HTTP status code and data (if available)
        if (resp.status === 204) {
            // User not found, 204 No Content
            console.log("User not found (204 No Content)");
            return { status: 204 };
        }
        
        if (resp.status === 200) {
            // Only attempt to parse JSON if the response is 200 OK
            try {
                const responseData = await resp.json();
                console.log("Profile verification response:", responseData);
                return { 
                    status: 200,
                    data: responseData
                };
            } catch (jsonError) {
                console.error("Error parsing JSON response:", jsonError);
                return { 
                    status: 200,
                    data: {} // Return empty object if JSON parsing fails
                };
            }
        }
        
        // Handle error responses
        return { 
            status: resp.status,
            error: `HTTP error: ${resp.status}`
        };
    } catch (error) {
        console.error("Error comparing profile:", error);
        return { 
            status: 500,
            error: error.message
        };
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
    const origin = window.location.origin;
    let nextPage = `${origin}/survey/community-case?transfer=`; // Default page

    if (page === "case_assessment") {
        var caseId = urlObject.searchParams.get("case_id");
        nextPage = `${origin}/survey/case-assessment?case_id=${caseId}&transfer=`;
    } else if (page === "movein_assessment") {
        nextPage = `${origin}/survey/move-in?transfer=`;
    } else if (page === "commonfee_payment") {
        nextPage = `${origin}/survey/commonfee-payment?transfer=`;
    } else if (page === "insurance_assessment") {
        nextPage = `${origin}/survey/insurance-assessment?transfer=`;
    } else if (page === "resident_assessment") {
        nextPage = `${origin}/survey/resident-assessment?transfer=`;
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
    // Show loading animation while waiting for response
    document.querySelector('#regis_loading').classList.remove('hidden');
    
    var Phone = document.querySelector("#regis_phone").value;
    var url = `${API_BASE_URL}${ENDPOINTS.phone}`;
    
    try {
        console.log("Sending phone number for verification:", { LineUserId, Phone });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                user_id: LineUserId,
                phone_number: Phone
            })
        });
        
        // Hide loading animation
        document.querySelector('#regis_loading').classList.add('hidden');
        console.log("Phone verification status:", resp.status);
        
        // Handle different HTTP status codes
        if (resp.status === 204) {
            // Phone not found
            console.log("Phone not found (204 No Content)");
            document.querySelector('#phone-not-found').classList.remove('hidden');
            return;
        }
        
        if (resp.status === 200) {
            // OTP sent successfully
            try {
                const responseData = await resp.json();
                console.log("Phone verification response:", responseData);
                data2 = responseData; // Store for OTP verification
                document.querySelector('#submit-otp-form').classList.remove('hidden');
                return;
            } catch (jsonError) {
                console.error("Error parsing JSON response:", jsonError);
                // If we can't parse the response, still show the OTP form
                document.querySelector('#submit-otp-form').classList.remove('hidden');
                return;
            }
        }
        
        if (resp.status === 429) {
            // Too many attempts
            console.log("Too many verification attempts (429 Too Many Requests)");
            document.querySelector('#not-verified').classList.remove('hidden');
            return;
        }
        
        // Any other status is an error
        console.error("Unexpected status:", resp.status);
        document.querySelector('#not-verified').classList.remove('hidden');
    } catch (error) {
        // Hide loading animation on error
        document.querySelector('#regis_loading').classList.add('hidden');
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
    
    // Show loading while verifying OTP
    document.querySelector('#submit-otp-form').classList.add('hidden');
    document.querySelector('#regis_loading').classList.remove('hidden');
    
    // Verify OTP with backend
    const url = `${API_BASE_URL}${ENDPOINTS.otp}`;
    try {
        console.log("Verifying OTP:", { LineUserId, Phone, OTP: inputOTP });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                user_id: LineUserId,
                phone_number: Phone,
                otp: inputOTP
            })
        });
        
        console.log("OTP verification status:", resp.status);
        
        // Handle response based on HTTP status code
        if (resp.status === 200) {
            // OTP verification successful
            try {
                // Clone the response to read it as JSON
                const respClone = resp.clone();
                const jsonData = await respClone.json();
                console.log("OTP verification successful response:", jsonData);
            } catch (e) {
                console.log("Could not parse JSON response, but proceeding with reload");
            }
            
            console.log("OTP verification successful (200 OK), refreshing page to enter verified path");
            // Don't hide the loading animation on success to maintain consistent UX
            // Just reload the page immediately
            window.location.reload();
            return;
        }
        
        // If we get here, it's not a success, so hide loading
        document.querySelector('#regis_loading').classList.add('hidden');
        
        // For other status codes, try to log the JSON response if possible
        let errorData = null;
        try {
            // Clone the response to read it as JSON (if possible)
            const respClone = resp.clone();
            const text = await respClone.text();
            console.log("OTP verification raw response:", text);
            if (text) {
                try {
                    errorData = JSON.parse(text);
                    console.log("Parsed error response:", errorData);
                } catch (e) {
                    console.log("Could not parse error response as JSON");
                }
            }
        } catch (e) {
            console.log("Could not read error response", e);
        }
        
        if (resp.status === 204) {
            // User or phone not found
            console.log("User or phone not found (204 No Content)");
            document.querySelector('#not-verified').classList.remove('hidden');
            return;
        }
        
        if (resp.status === 400) {
            // Invalid OTP
            console.log("Invalid OTP (400 Bad Request)");
            // Show OTP form again with warning
            document.querySelector('#submit-otp-form').classList.remove('hidden');
            document.querySelector('#warning-otp').classList.remove('hidden');
            return;
        }
        
        if (resp.status === 429) {
            // Max attempts reached
            console.log("Maximum OTP attempts reached (429 Too Many Requests)");
            document.querySelector('#not-verified').classList.remove('hidden');
            return;
        }
        
        // Any other status is an error
        console.error("Unexpected status:", resp.status);
        document.querySelector('#not-verified').classList.remove('hidden');
    } catch (error) {
        // Hide loading animation and show error
        document.querySelector('#regis_loading').classList.add('hidden');
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
        let profileResponse = await main();
        let isVerified = false;
        
        // Check if user verification was successful (200 OK response)
        if (profileResponse.status === 200) {
            // User is verified: construct payload with exact required keys
            const fullResponse = profileResponse.data;
            const apiData = fullResponse.data || fullResponse;
            const payload = {
                CommonFeeId: apiData.commonfee_id || null,
                ProjectName: apiData.project_name__c || null,
                HouseNumber: apiData.house_number__c || null,
                PhoneNumber: apiData.mobilephone__c || null,
                authorize: apiData.authorize != null ? apiData.authorize : null,
                lineUserId: LineUserId,
                total1: apiData.last_overdue_value__c != null ? apiData.last_overdue_value__c : null,
                total2: apiData.now_overdue_value__c != null ? apiData.now_overdue_value__c : null,
                suffix: apiData.suffix_code__c || null,
                customerId: apiData.customer_id__c || null,
                projectCode: apiData.project_code__c || null,
                billerId: apiData.biller_id__c || null
            };
            redirectToSurvey(payload);
            return;
        } else {
            // User not found (204) or other error: show phone entry form
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
    
    // Enhanced submit-otp button handler with additional protection
    const otpButton = document.querySelector("#submit-otp");
    if (otpButton) {
        otpButton.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent the default link behavior
            e.stopPropagation(); // Prevent event bubbling
            console.log("OTP submit button clicked");
            verifyOTP();
            return false; // Extra insurance against form submission
        });
        console.log("OTP submit event listener added with enhanced protection");
    } else {
        console.error("OTP submit button not found in DOM");
    }
    
    // Add direct form handler regardless of button presence
    const otpForm = document.querySelector('#submit-otp-form');
    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Critical to prevent normal form submission
            e.stopPropagation(); // Prevent event bubbling
            console.log("OTP form submitted via form submit event");
            verifyOTP();
            return false; // Extra insurance against form submission
        });
        console.log("OTP form submit event listener added with enhanced protection");
    }
    
    // Add input handler to submit on Enter key
    const otpInput = document.querySelector("#regis_otp");
    if (otpInput) {
        otpInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                console.log("Enter key pressed in OTP input");
                verifyOTP();
            }
        });
        console.log("OTP input keyup event listener added");
    } else {
        console.log("OTP input field not found in DOM");
    }
});