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
  
  // For page 1 - using the Webflow form IDs
  const page1Form = document.querySelector("#wf-form-walknew1");
  
  // Add event listener to the form itself, not just the button
  if (page1Form && page1Form instanceof HTMLFormElement) {
    console.log("[DEBUG] Found page 1 form, adding submit event listener");
    page1Form.addEventListener("submit", async function(e) {
      // Prevent the default form submission to avoid the brief flash of Webflow's submit page
      e.preventDefault();
      console.log("[DEBUG] Page 1 form submitted - default behavior prevented");
      
      try {
        const formData = new FormData(page1Form);
        console.log("[DEBUG] FormData created for page 1");
        
        // Submit the form data to Webflow manually if needed
        const formAction = page1Form.getAttribute("action");
        const formMethod = page1Form.getAttribute("method") || "POST";
        
        // Log form submission details
        console.log(`[DEBUG] Form action: ${formAction}, method: ${formMethod}`);
        
        // Send our data to Pub/Sub
        await sendFormDataToPubSub(1, formData);
        
        // Optionally submit to Webflow in the background
        if (formAction) {
          console.log("[DEBUG] Submitting form data to Webflow in the background");
          fetch(formAction, {
            method: formMethod,
            body: formData,
            mode: 'no-cors' // To avoid CORS issues
          }).catch(error => {
            console.error("[ERROR] Background Webflow submission failed:", error);
          });
        }
      } catch (formDataError) {
        console.error("[ERROR] Error creating FormData for page 1:", formDataError);
      }
      
      // Navigate immediately without waiting
      console.log("[DEBUG] Navigating to page 2");
      // Webflow specific - hide current page and show next
      const page1Element = document.querySelector("#page1") || document.querySelector(".page-1");
      const page2Element = document.querySelector("#page2") || document.querySelector(".page-2");
      
      if (page1Element) {
        console.log("[DEBUG] Hiding page 1");
        page1Element.classList.add("hidden");
        if (page1Element.style) page1Element.style.display = "none";
      }
      
      if (page2Element) {
        console.log("[DEBUG] Showing page 2");
        page2Element.classList.remove("hidden");
        if (page2Element.style) page2Element.style.display = "block";
      }
      
      setButtonPage(1, "next");
      window.scrollTo(0, 0); // Scroll to top of page for better UX
    });
  } else {
    console.error("[ERROR] Could not find page 1 submit button");
  }
  
  // For page 2 - using Webflow form IDs
  const page2Form = document.querySelector("#wf-form-walknew2");
  
  if (page2Form && page2Form instanceof HTMLFormElement) {
    console.log("[DEBUG] Found page 2 form, adding submit event listener");
    page2Form.addEventListener("submit", async function(e) {
      // Prevent the default form submission
      e.preventDefault();
      console.log("[DEBUG] Page 2 form submitted - default behavior prevented");
      
      try {
        const formData = new FormData(page2Form);
        console.log("[DEBUG] FormData created for page 2");
        
        // Submit the form data to Webflow manually if needed
        const formAction = page2Form.getAttribute("action");
        const formMethod = page2Form.getAttribute("method") || "POST";
        
        // Log form submission details
        console.log(`[DEBUG] Form action: ${formAction}, method: ${formMethod}`);
        
        // Send our data to Pub/Sub
        await sendFormDataToPubSub(2, formData);
        
        // Optionally submit to Webflow in the background
        if (formAction) {
          console.log("[DEBUG] Submitting form data to Webflow in the background");
          fetch(formAction, {
            method: formMethod,
            body: formData,
            mode: 'no-cors' // To avoid CORS issues
          }).catch(error => {
            console.error("[ERROR] Background Webflow submission failed:", error);
          });
        }
      } catch (formDataError) {
        console.error("[ERROR] Error creating FormData for page 2:", formDataError);
      }
      
      // Navigate immediately without waiting
      console.log("[DEBUG] Navigating to page 3");
      // Webflow specific - hide current page and show next
      const page2Element = document.querySelector("#page2") || document.querySelector(".page-2");
      const page3Element = document.querySelector("#page3") || document.querySelector(".page-3");
      
      if (page2Element) {
        console.log("[DEBUG] Hiding page 2");
        page2Element.classList.add("hidden");
        if (page2Element.style) page2Element.style.display = "none";
      }
      
      if (page3Element) {
        console.log("[DEBUG] Showing page 3");
        page3Element.classList.remove("hidden");
        if (page3Element.style) page3Element.style.display = "block";
      }
      
      if (typeof showquestions === 'function') {
        console.log("[DEBUG] Calling showquestions function");
        showquestions();
      }
      
      setButtonPage(2, "next");
      window.scrollTo(0, 0); // Scroll to top of page for better UX
    });
  } else {
    console.error("[ERROR] Could not find page 2 form");
  }
  
  // For page 3 - only listen to wf-form-walknew3-2, ignoring wf-form-walknew31
  const page3Form1 = document.querySelector("#wf-form-walknew31");
  const page3Form2 = document.querySelector("#wf-form-walknew3-2");
  
  console.log("[DEBUG] Page 3 forms found:", {
    "wf-form-walknew31": !!page3Form1, // This one will be ignored
    "wf-form-walknew3-2": !!page3Form2  // Only listening to this one
  });
  
  // Only add event listener to the second form (3-2)
  if (page3Form2 && page3Form2 instanceof HTMLFormElement) {
    console.log("[DEBUG] Found page 3-2 form, adding submit event listener");
    page3Form2.addEventListener("submit", async function(e) {
      // Prevent the default form submission
      e.preventDefault();
      console.log("[DEBUG] Page 3-2 form submitted - default behavior prevented");
      
      try {
        const formData = new FormData(page3Form2);
        console.log("[DEBUG] FormData created for page 3-2");
        
        // Submit the form data to Webflow manually if needed
        const formAction = page3Form2.getAttribute("action");
        const formMethod = page3Form2.getAttribute("method") || "POST";
        
        // Log form submission details
        console.log(`[DEBUG] Form action: ${formAction}, method: ${formMethod}`);
        
        // Send our data to Pub/Sub
        await sendFormDataToPubSub(3, formData);
        
        // Optionally submit to Webflow in the background
        if (formAction) {
          console.log("[DEBUG] Submitting form data to Webflow in the background");
          fetch(formAction, {
            method: formMethod,
            body: formData,
            mode: 'no-cors' // To avoid CORS issues
          }).catch(error => {
            console.error("[ERROR] Background Webflow submission failed:", error);
          });
        }
      } catch (formDataError) {
        console.error("[ERROR] Error creating FormData for page 3-2:", formDataError);
      }
      
      // Navigate without delay
      handlePage3Navigation();
    });
  } else {
    console.error("[ERROR] Could not find page 3-2 form");
  }
  
  // Common navigation function for page 3
  function handlePage3Navigation() {
    console.log("[DEBUG] Navigating from page 3 to page 4");
    // Webflow specific - hide current page and show next
    const page3Element = document.querySelector("#page3") || document.querySelector(".page-3");
    const page4Element = document.querySelector("#page4") || document.querySelector(".page-4");
    
    if (page3Element) {
      console.log("[DEBUG] Hiding page 3");
      page3Element.classList.add("hidden");
      if (page3Element.style) page3Element.style.display = "none";
    }
    
    if (page4Element) {
      console.log("[DEBUG] Showing page 4");
      page4Element.classList.remove("hidden");
      if (page4Element.style) page4Element.style.display = "block";
    }
    
    setButtonPage(3, "next");
    window.scrollTo(0, 0); // Scroll to top of page for better UX
  }
  
  // For page 4 - using Webflow form IDs
  const page4Form = document.querySelector("#wf-form-walknew4");
  
  if (page4Form && page4Form instanceof HTMLFormElement) {
    console.log("[DEBUG] Found page 4 form, adding submit event listener");
    page4Form.addEventListener("submit", async function(e) {
      // Prevent the default form submission
      e.preventDefault();
      console.log("[DEBUG] Page 4 form submitted - default behavior prevented");
      
      try {
        const formData = new FormData(page4Form);
        console.log("[DEBUG] FormData created for page 4");
        
        // Submit the form data to Webflow manually if needed
        const formAction = page4Form.getAttribute("action");
        const formMethod = page4Form.getAttribute("method") || "POST";
        
        // Log form submission details
        console.log(`[DEBUG] Form action: ${formAction}, method: ${formMethod}`);
        
        // Send our data to Pub/Sub
        await sendFormDataToPubSub(4, formData);
        
        // Optionally submit to Webflow in the background
        if (formAction) {
          console.log("[DEBUG] Submitting form data to Webflow in the background");
          fetch(formAction, {
            method: formMethod,
            body: formData,
            mode: 'no-cors' // To avoid CORS issues
          }).catch(error => {
            console.error("[ERROR] Background Webflow submission failed:", error);
          });
        }
      } catch (formDataError) {
        console.error("[ERROR] Error creating FormData for page 4:", formDataError);
      }
      
      // Navigate immediately without waiting
      console.log("[DEBUG] Navigating to page 5");
      // Webflow specific - hide current page and show next
      const page4Element = document.querySelector("#page4") || document.querySelector(".page-4");
      const page5Element = document.querySelector("#page5") || document.querySelector(".page-5");
      
      if (page4Element) {
        console.log("[DEBUG] Hiding page 4");
        page4Element.classList.add("hidden");
        if (page4Element.style) page4Element.style.display = "none";
      }
      
      if (page5Element) {
        console.log("[DEBUG] Showing page 5");
        page5Element.classList.remove("hidden");
        if (page5Element.style) page5Element.style.display = "block";
      }
      
      setButtonPage(4, "next");
      window.scrollTo(0, 0); // Scroll to top of page for better UX
    });
  } else {
    console.error("[ERROR] Could not find page 4 form");
  }
  
  // For page 5 - using Webflow form IDs
  const page5Form = document.querySelector("#wf-form-walknew5");
  
  if (page5Form && page5Form instanceof HTMLFormElement) {
    console.log("[DEBUG] Found page 5 form, adding submit event listener");
    page5Form.addEventListener("submit", async function(e) {
      // Prevent the default form submission
      e.preventDefault();
      console.log("[DEBUG] Page 5 form submitted - default behavior prevented");
      
      try {
        const formData = new FormData(page5Form);
        console.log("[DEBUG] FormData created for page 5");
        
        // Submit the form data to Webflow manually if needed
        const formAction = page5Form.getAttribute("action");
        const formMethod = page5Form.getAttribute("method") || "POST";
        
        // Log form submission details
        console.log(`[DEBUG] Form action: ${formAction}, method: ${formMethod}`);
        
        // Send our data to Pub/Sub
        await sendFormDataToPubSub(5, formData);
        
        // Optionally submit to Webflow in the background
        if (formAction) {
          console.log("[DEBUG] Submitting form data to Webflow in the background");
          fetch(formAction, {
            method: formMethod,
            body: formData,
            mode: 'no-cors' // To avoid CORS issues
          }).catch(error => {
            console.error("[ERROR] Background Webflow submission failed:", error);
          });
        }
      } catch (formDataError) {
        console.error("[ERROR] Error creating FormData for page 5:", formDataError);
      }
      
      // Navigate immediately without waiting
      console.log("[DEBUG] Navigating to page 6");
      // Webflow specific - hide current page and show next
      const page5Element = document.querySelector("#page5") || document.querySelector(".page-5");
      const page6Element = document.querySelector("#page6") || document.querySelector(".page-6");
      
      if (page5Element) {
        console.log("[DEBUG] Hiding page 5");
        page5Element.classList.add("hidden");
        if (page5Element.style) page5Element.style.display = "none";
      }
      
      if (page6Element) {
        console.log("[DEBUG] Showing page 6");
        page6Element.classList.remove("hidden");
        if (page6Element.style) page6Element.style.display = "block";
      }
      
      setButtonPage(5, "next");
      window.scrollTo(0, 0); // Scroll to top of page for better UX
    });
  } else {
    console.error("[ERROR] Could not find page 5 form");
  }
  
  // Debug elements and remove old event listeners - no longer needed with Webflow forms
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