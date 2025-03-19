$('.select-item').each(function(){
  var s = $(this).text();
  $('.select-field').append('<option-value="'+s+'">'+s+'</option>');
})

let page = 1;
let href;
let urlObject;
let formData;
let consent = "";
let linkData = new URL(window.location.href);
let urlPath = linkData.pathname.split('/');
let projectid = urlPath[urlPath.length - 1] || urlPath[urlPath.length - 2]; // Extract collection ID

let line_login = linkData.searchParams.get("line_login");
let visitors = linkData.searchParams.get("visitor");
let userid = linkData.searchParams.get("userid");
var customer_id;
    
const setButtonPage = (apage, subject) => {
  console.log(apage+" "+subject);
  bpage = apage+1;
  document.querySelector("#page"+apage).classList.add("hidden");
  if(bpage <= 6){
    document.querySelector("#page"+bpage).classList.remove("hidden");
  };
  window.scrollTo(0, 0);
  page = apage;
};   

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[INIT] Script initialized - DOMContentLoaded event fired");
  
  console.log("[INIT] Environment info:", {
    url: window.location.href,
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString()
  });
  
  // Check for jQuery and form elements
  if (typeof $ === 'undefined') {
    console.error("[ERROR] jQuery not loaded");
  } else {
    console.log("[INIT] jQuery is available");
  }
  
  // Find forms to ensure they exist
  const formElements = document.querySelectorAll("form");
  console.log(`[INIT] Found ${formElements.length} form elements`);
  formElements.forEach((form, index) => {
    console.log(`[INIT] Form ${index}: id=${form.id}, class=${form.className}`);
  });
  
  const randomId = `surveyid_${Math.round(Math.random(10) * 1000)}${new Date().getTime()}`;
  href = window.location.href;
  urlObject = new URL(window.location.href);
  
  console.log("[INIT] Checking for existing surveyid in URL");  
  customer_id = urlObject.searchParams.get("surveyid");  // Updated to use 'surveyid' as the parameter name
  
  if(!customer_id) {
    console.log("[INIT] No surveyid found, generating new one");
    // Generate a new customer_id and use it directly
    customer_id = `surveyid_${Math.round(Math.random() * 1000)}${new Date().getTime()}`;
    // Update the URL with the new surveyid
    urlObject.searchParams.set("surveyid", customer_id);
    window.history.replaceState(null, '', urlObject.toString());
    console.log(`[INIT] Generated new surveyid: ${customer_id}`);
  } else {
    console.log(`[INIT] Using existing surveyid: ${customer_id}`);
  }
  
  // Call the function to ensure it's executed
  try {
    console.log("[INIT] Storing customer data");
    await storeCustomerData();
    console.log("[INIT] Customer data stored successfully");
  } catch (storeError) {
    console.error("[ERROR] Failed to store customer data:", storeError);
  }
  
  // Set the survey ID for all hidden fields
  try {
    const idFields = ["#p1-survey-id", "#p2-survey-id", "#p3-survey-id", "#p4-survey-id", "#p5-survey-id"];
    idFields.forEach(selector => {
      const field = document.querySelector(selector);
      if (field) {
        field.value = customer_id;
        console.log(`[INIT] Set ${selector} to ${customer_id}`);
      } else {
        console.warn(`[WARN] Field ${selector} not found`);
      }
    });
  } catch (fieldError) {
    console.error("[ERROR] Error setting survey ID fields:", fieldError);
  }
  
  let bpage = 1;
  
  // Intercept submit button clicks, not form submissions
  // This allows the form to submit to Webflow normally, but also handles our navigation
  
  // For page 1
  const page1Buttons = document.querySelector("#page1 input[type='submit'], #page1 button[type='submit']");
  if (page1Buttons) {
    console.log("[DEBUG] Found page 1 submit button, adding click event listener");
    page1Buttons.addEventListener("click", async function(e) {
      console.log("[DEBUG] Page 1 submit button clicked");
      
      // Don't prevent default - let form submit to Webflow
      // But do our navigation after a slight delay
      const page1Form = document.querySelector("#page1");
      if (page1Form && page1Form instanceof HTMLFormElement) {
        console.log("[DEBUG] Found page 1 form, creating FormData");
        try {
          const formData = new FormData(page1Form);
          console.log("[DEBUG] FormData created for page 1");
          await sendFormDataToPubSub(1, formData);
        } catch (formDataError) {
          console.error("[ERROR] Error creating FormData for page 1:", formDataError);
        }
      } else {
        console.error("[ERROR] Page 1 form not found or not an HTMLFormElement:", page1Form);
      }
      
      // Set a timeout to navigate after form is submitted
      setTimeout(() => {
        console.log("[DEBUG] Timeout callback for page 1 navigation");
        // First check if we're still on the same page (form didn't redirect)
        if (document.querySelector("#page1") && !document.querySelector("#page1").classList.contains("hidden")) {
          console.log("[DEBUG] Navigating to next page from page 1");
          setButtonPage(1, "next");
        } else {
          console.log("[DEBUG] Not navigating from page 1 - page either hidden or not found");
        }
      }, 300); // Increased timeout for more reliability
    });
  } else {
    console.error("[ERROR] Could not find page 1 submit button");
  }
  
  // For page 2
  const page2Buttons = document.querySelector("#page2 input[type='submit'], #page2 button[type='submit']");
  if (page2Buttons) {
    page2Buttons.addEventListener("click", async function(e) {
      const page2Form = document.querySelector("#page2");
      if (page2Form && page2Form instanceof HTMLFormElement) {
        const formData = new FormData(page2Form);
        await sendFormDataToPubSub(2, formData);
      }
      
      setTimeout(() => {
        if (document.querySelector("#page2") && !document.querySelector("#page2").classList.contains("hidden")) {
          if (typeof showquestions === 'function') {
            showquestions();
          }
          setButtonPage(2, "next");
        }
      }, 200);
    });
  }
  
  // For page 3
  const page3Buttons = document.querySelector("#page3 input[type='submit'], #page3 button[type='submit']");
  if (page3Buttons) {
    page3Buttons.addEventListener("click", async function(e) {
      const page3Form = document.querySelector("#page3");
      if (page3Form && page3Form instanceof HTMLFormElement) {
        const formData = new FormData(page3Form);
        await sendFormDataToPubSub(3, formData);
      }
      
      setTimeout(() => {
        if (document.querySelector("#page3") && !document.querySelector("#page3").classList.contains("hidden")) {
          setButtonPage(3, "next");
        }
      }, 200);
    });
  }
  
  // For page 4
  const page4Buttons = document.querySelector("#page4 input[type='submit'], #page4 button[type='submit']");
  if (page4Buttons) {
    page4Buttons.addEventListener("click", async function(e) {
      const page4Form = document.querySelector("#page4");
      if (page4Form && page4Form instanceof HTMLFormElement) {
        const formData = new FormData(page4Form);
        await sendFormDataToPubSub(4, formData);
      }
      
      setTimeout(() => {
        if (document.querySelector("#page4") && !document.querySelector("#page4").classList.contains("hidden")) {
          setButtonPage(4, "next");
        }
      }, 200);
    });
  }
  
  // For page 5
  const page5Buttons = document.querySelector("#page5 input[type='submit'], #page5 button[type='submit']");
  if (page5Buttons) {
    page5Buttons.addEventListener("click", async function(e) {
      const page5Form = document.querySelector("#page5");
      if (page5Form && page5Form instanceof HTMLFormElement) {
        const formData = new FormData(page5Form);
        await sendFormDataToPubSub(5, formData);
      }
      
      setTimeout(() => {
        if (document.querySelector("#page5") && !document.querySelector("#page5").classList.contains("hidden")) {
          setButtonPage(5, "next");
        }
      }, 200);
    });
  }
  
  // Maintain backwards compatibility with original event listeners
  const page1Form = document.querySelector("#page1");
  if (page1Form) {
    page1Form.addEventListener("submit", async (e) => { 
      e.preventDefault(); 
      if (page1Form instanceof HTMLFormElement) {
        await sendFormDataToPubSub(1, new FormData(page1Form));
      }
      setButtonPage(1, "next"); 
    });
  }
  
  const page2Form = document.querySelector("#page2");
  if (page2Form) {
    page2Form.addEventListener("submit", async (e) => { 
      e.preventDefault(); 
      if (page2Form instanceof HTMLFormElement) {
        await sendFormDataToPubSub(2, new FormData(page2Form));
      }
      if (typeof showquestions === 'function') {
        showquestions();
      }
      setButtonPage(2, "next");
    });
  }
  
  const page3Form = document.querySelector("#page3");
  if (page3Form) {
    page3Form.addEventListener("submit", async (e) => { 
      e.preventDefault(); 
      if (page3Form instanceof HTMLFormElement) {
        await sendFormDataToPubSub(3, new FormData(page3Form));
      }
      setButtonPage(3, "next"); 
    });
  }
  
  const page4Form = document.querySelector("#page4");
  if (page4Form) {
    page4Form.addEventListener("submit", async (e) => { 
      e.preventDefault(); 
      if (page4Form instanceof HTMLFormElement) {
        await sendFormDataToPubSub(4, new FormData(page4Form));
      }
      setButtonPage(4, "next"); 
    });
  }
  
  const page5Form = document.querySelector("#page5");
  if (page5Form) {
    page5Form.addEventListener("submit", async (e) => { 
      e.preventDefault(); 
      if (page5Form instanceof HTMLFormElement) {
        await sendFormDataToPubSub(5, new FormData(page5Form));
      }
      setButtonPage(5, "next"); 
    });
  }
});

async function storeCustomerData() {
  // Assuming customer_id, line_login, visitors, userid, and projectid are global variables
  const customerData = {
    customer_id: customer_id,
    line_login: line_login,
    visitors: visitors,
    userid: userid,
    projectid: projectid
  };

  const url = 'https://script.google.com/macros/s/AKfycbyseI7d49Z8faA5bLhJkLq0tj0jWvUGuryXv78dtkX7xPAVVq14Jxbo0dYzUchVSNUyvQ/exec';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'no-cors', // Using no-cors mode
    body: JSON.stringify(customerData)
  };

  console.log('Sending customer data:', customerData);

  try {
    // First attempt to send data
    await fetch(url, options);
    console.log('First data send attempt made.');
  } catch (error) {
    console.error('Error in first data send attempt:', error);
  }

  try {
    // Second attempt to send data
    await fetch(url, options);
    console.log('Second data send attempt made.');
  } catch (error) {
    console.error('Error in second data send attempt:', error);
  }
}

async function sendFormDataToPubSub(pageNumber, formData) {
  console.log(`[DEBUG] Starting sendFormDataToPubSub for page ${pageNumber}`);
  
  if (!formData || !(formData instanceof FormData)) {
    console.error(`[ERROR] Invalid FormData for page ${pageNumber}`, formData);
    return null;
  }
  
  // Log all form fields
  console.log(`[DEBUG] FormData entries for page ${pageNumber}:`);
  for (const [key, value] of formData.entries()) {
    console.log(`[DEBUG] - ${key}: ${value}`);
  }
  
  const formDataObj = {};
  
  // Convert FormData to regular object
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value;
  }
  
  // Create payload according to the API requirements
  const payload = {
    payloadkey: customer_id,
    payloaddatatype: pageNumber.toString(),
    ...formDataObj
  };
  
  console.log(`[DEBUG] Prepared payload for Pub/Sub:`, payload);
  
  // Send to Pub/Sub service
  const url = 'https://pubsub-826626291152.asia-southeast1.run.app/WalkData';
  console.log(`[DEBUG] Sending to URL: ${url}`);
  
  try {
    console.log(`[DEBUG] Making first fetch attempt for page ${pageNumber}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`[DEBUG] Fetch response status: ${response.status}`);
    console.log(`[DEBUG] Fetch response headers:`, Object.fromEntries([...response.headers]));
    
    try {
      const responseText = await response.text();
      console.log(`[DEBUG] Raw response: ${responseText}`);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log(`[SUCCESS] Page ${pageNumber} data sent to Pub/Sub:`, responseData);
        return responseData;
      } catch (jsonError) {
        console.error(`[ERROR] Could not parse JSON response: ${jsonError.message}`, responseText);
        return { status: 'parsed-error', message: responseText };
      }
    } catch (textError) {
      console.error(`[ERROR] Could not read response text: ${textError.message}`);
      return { status: 'error', message: 'Could not read response' };
    }
  } catch (error) {
    console.error(`[ERROR] Error sending page ${pageNumber} data to Pub/Sub:`, error);
    
    // Try again once on failure
    try {
      console.log(`[DEBUG] Making retry fetch attempt for page ${pageNumber}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`[DEBUG] Retry fetch response status: ${response.status}`);
      
      try {
        const responseText = await response.text();
        console.log(`[DEBUG] Raw retry response: ${responseText}`);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log(`[SUCCESS] Retry: Page ${pageNumber} data sent to Pub/Sub:`, responseData);
          return responseData;
        } catch (jsonError) {
          console.error(`[ERROR] Could not parse JSON retry response: ${jsonError.message}`, responseText);
          return { status: 'retry-parsed-error', message: responseText };
        }
      } catch (textError) {
        console.error(`[ERROR] Could not read retry response text: ${textError.message}`);
        return { status: 'retry-error', message: 'Could not read response' };
      }
    } catch (retryError) {
      console.error(`[ERROR] Retry also failed for page ${pageNumber}:`, retryError);
      return { status: 'critical-error', message: retryError.message };
    }
  }
}

// Thailand address autocomplete
$.Thailand({ 
  $district: $('#tumbon-work'),
  $amphoe: $('#amphur-work'),
  $province: $('#province-work'),
  $zipcode: $('#zipcode-work'),
});
$.Thailand({ 
  $district: $('#tumbon-home'),
  $amphoe: $('#amphur-home'),
  $province: $('#province-home'),
  $zipcode: $('#zipcode-home'),
});