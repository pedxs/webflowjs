$('.select-item').each(function(){
  var s = $(this).text();
  $('.select-field').append('<option-value="'+s+'">'+s+'</option>');
})

// Variables for the main form functionality
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

// Variables for the drag-and-drop survey functionality
let newRes = [];
let reason = [];
let offline = [];
let online = [];
let arData = {};
let stop = true;
let first_media = false;
var firstmediaInput;

// Function to handle first media selection
function addFirstMedias(elementId, type, elementName) {
  console.log("[MEDIA] Function called with arguments:", { elementId, type, elementName });

  if (elementName !== 'ไม่เคยพบเห็น') {
    firstmediaInput.value = elementName;
    console.log("[MEDIA] Updated firstmediaInput value:", firstmediaInput.value);

    const optionBox = document.querySelector("#box-" + elementId);
    if (type === 'add') {
      optionBox.classList.remove("hidden");
      console.log(`[MEDIA] Unhid option box for elementId: ${elementId}`);

      // Select the radio button within this option box
      const radioButton = optionBox.querySelector('input[type="radio"]');
      const radioVisual = optionBox.querySelector('.w-radio-input');
      if (radioButton) {
        // Set the actual radio input to checked
        radioButton.checked = true;
        firstmediaInput.value = radioButton.value;
        console.log(`[MEDIA] Automatically selected radio button: ${radioButton.value}`);

        // Add visual indication by toggling a selected style or class on the radio div
        if (radioVisual) {
          radioVisual.classList.add("selected");
          console.log(`[MEDIA] Applied selected style to radio button visual element`);
        }
      }
    } else {
      optionBox.classList.add("hidden");
      console.log(`[MEDIA] Hid option box for elementId: ${elementId}`);
    }
  }

  const new_offline = offline.filter(el => el !== 'ไม่เคยพบเห็น');
  const new_online = online.filter(el => el !== 'ไม่เคยพบเห็น');
  console.log("[MEDIA] Filtered new_offline:", new_offline);
  console.log("[MEDIA] Filtered new_online:", new_online);

  const totalVisibleOptions = new_offline.length + new_online.length;
  console.log("[MEDIA] Total visible options:", totalVisibleOptions);

  const fmedia = document.querySelector("#first-media");

  if (totalVisibleOptions === 0) {
    // Locate the label element containing 'ไม่เคยพบเห็น' and find the associated radio button
    const noMediaLabel = Array.from(document.querySelectorAll("label")).find(label => label.textContent.trim() === 'ไม่เคยพบเห็น');
    if (noMediaLabel) {
      const noMediaOption = noMediaLabel.querySelector('input[type="radio"]');
      const noMediaVisual = noMediaLabel.querySelector('.w-radio-input');
      if (noMediaOption) {
        noMediaOption.checked = true;
        firstmediaInput.value = noMediaOption.value;
        console.log(`[MEDIA] Automatically selected 'ไม่เคยพบเห็น' radio button: ${noMediaOption.value}`);

        // Add visual indication by toggling a selected style or class on the radio div
        if (noMediaVisual) {
          noMediaVisual.classList.add("selected");
          console.log(`[MEDIA] Applied selected style to 'ไม่เคยพบเห็น' radio button visual element`);
        }
      }
    }

    // Hide the first-media question block since no other options are available
    fmedia.classList.add("hidden");
    console.log("[MEDIA] Hid the first-media question block after selecting 'ไม่เคยพบเห็น'.");
  } else if (totalVisibleOptions > 1) {
    fmedia.classList.remove("hidden");
    console.log("[MEDIA] Unhid the first-media question block for user selection");

    const firstMediaRadios = fmedia.querySelectorAll('input[type="radio"]');
    firstMediaRadios.forEach(radio => {
      radio.checked = false;
      console.log(`[MEDIA] Deselected radio button: ${radio.value}`);
    });
  }
}

// Function to add or remove items from arrays for the survey
function addtoArray(elementId, text, type) {
  let actualArray;
  if (elementId.includes('residence')) {
    actualArray = newRes;
  } else if (elementId.includes('reason')) {
    actualArray = reason;
  } else if (elementId.includes('offline')) {
    actualArray = offline;
  } else if (elementId.includes('online')) {
    actualArray = online;
  }

  if (type === 'add') {
    actualArray.push(text);
  } else if (type === 'remove') {
    const index = actualArray.indexOf(text);
    if (index !== -1) {
      actualArray.splice(index, 1);
    }
  }
  
  arData = {
    new_residences: newRes, 
    buying_reasons: reason, 
    offline_medias: offline, 
    online_medias: online
  };
  
  console.log("[SURVEY] Updated array data:", arData);
  var arDataString = JSON.stringify(arData);
  document.getElementById('dragdrop-data').value = arDataString;
  
  if (newRes.length < 1 || reason.length < 1 || offline.length < 1 || online.length < 1) {
    stop = true;
    document.querySelector("#btn-next2").classList.add("hidden");
    document.querySelector("#btn-error").classList.remove("hidden");
  } else {
    stop = false;
    document.querySelector("#btn-next2").classList.remove("hidden");
    document.querySelector("#btn-error").classList.add("hidden");
  }
  
  if (elementId.includes('online') || elementId.includes('offline')) {
    addFirstMedias(elementId, type, text);
  }
}
    
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
  
  // Initialize state variables for form interactions
  let compared = "NO";
  let dept = "YES";
  
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
  
  // Add interactive form behavior
  
  // Project comparison radio button behavior
  const compareYesButton = document.querySelector("#compare-yes");
  const compareNoButton = document.querySelector("#compare-no");
  const compareDetailField = document.querySelector("#compare-detail");
  
  if (compareYesButton && compareNoButton && compareDetailField) {
    console.log("[INIT] Setting up project comparison behavior");
    
    compareYesButton.addEventListener("click", () => {
      compared = "YES";
      console.log("[FORM] Project comparison - Yes selected");
      compareDetailField.classList.remove("hidden");
      compareDetailField.setAttribute("required", true);
    });
    
    compareNoButton.addEventListener("click", () => {
      compared = "NO";
      console.log("[FORM] Project comparison - No selected");
      compareDetailField.classList.add("hidden");
      compareDetailField.removeAttribute("required");
    });
  } else {
    console.log("[INIT] Project comparison elements not all found, skipping setup");
  }
  
  // Debt radio button behavior
  const debtYesButton = document.querySelector("#havedebt-yesihave");
  const debtNoButton = document.querySelector("#havedebt-noidont");
  const debtRangeField = document.querySelector("#dept-range");
  
  if (debtYesButton && debtNoButton && debtRangeField) {
    console.log("[INIT] Setting up debt slider behavior");
    
    debtYesButton.addEventListener("click", () => {
      dept = "YES";
      console.log("[FORM] Debt - Yes selected");
      debtRangeField.classList.remove("hidden");
    });
    
    debtNoButton.addEventListener("click", () => {
      dept = "NO";
      console.log("[FORM] Debt - No selected");
      debtRangeField.classList.add("hidden");
    });
  } else {
    console.log("[INIT] Debt field elements not all found, skipping setup");
  }
  
  // Initialize drag-drop survey functionality
  try {
    console.log("[SURVEY] Initializing drag-drop survey elements");
    
    // Set firstmediaInput
    firstmediaInput = document.querySelector('#firstmedia_backup');
    console.log("[SURVEY] First media input found:", !!firstmediaInput);
    
    // Hide elements with auto-hidden class
    const hiddenElements = document.querySelectorAll('.auto-hidden');
    hiddenElements.forEach((element) => {
      element.classList.add("hidden");
      console.log("[SURVEY] Added hidden class to element:", element.className);
    });
    
    // Set up drag-drop functionality
    var boxitems = document.querySelectorAll('.survey-form-drag-drop');
    boxitems.forEach(function (item) {
      var rightbox = item.querySelector('.rightbox');
      var leftbox = item.querySelector('.leftbox');
      
      console.log("[SURVEY] Setting up drag-drop for:", item.className);
      
      // Bind initial click event listeners to all items in both boxes
      var allItems = item.querySelectorAll(".drag-drop-items");
      allItems.forEach(function (dragItem) {
        dragItem.addEventListener("click", function(event) {
          var targetBox = dragItem.closest('.leftbox') ? rightbox : leftbox; 
          var sourceBox = dragItem.closest('.leftbox') ? leftbox : rightbox;
          moveItemToBox(event, targetBox, sourceBox);
        });
        console.log("[SURVEY] Added click listener to drag item:", dragItem.textContent);
      });
    });
  } catch (surveyError) {
    console.error("[ERROR] Failed to initialize survey elements:", surveyError);
  }
  
  let bpage = 1;
  
  // A reusable function for handling form submissions
  function handleFormSubmission(formSelector, pageNumber) {
    const form = document.querySelector(formSelector);
    
    if (!form || !(form instanceof HTMLFormElement)) {
      console.error(`[ERROR] Form ${formSelector} not found or is not a form element`);
      return;
    }
    
    console.log(`[DEBUG] Found page ${pageNumber} form (${formSelector}), adding submit event listener`);
    
    form.addEventListener("submit", async function(e) {
      // Prevent the default form submission
      e.preventDefault();
      console.log(`[DEBUG] Page ${pageNumber} form submitted - default behavior prevented`);
      
      try {
        const formData = new FormData(form);
        console.log(`[DEBUG] FormData created for page ${pageNumber}`);
        
        // Submit the form data to Webflow manually if needed
        const formAction = form.getAttribute("action");
        const formMethod = form.getAttribute("method") || "POST";
        
        // Log form submission details
        console.log(`[DEBUG] Form action: ${formAction}, method: ${formMethod}`);
        
        // Send our data to Pub/Sub
        await sendFormDataToPubSub(pageNumber, formData);
        
        // Optionally submit to Webflow in the background
        if (formAction) {
          console.log(`[DEBUG] Submitting form data to Webflow in the background`);
          fetch(formAction, {
            method: formMethod,
            body: formData,
            mode: 'no-cors' // To avoid CORS issues
          }).catch(error => {
            console.error(`[ERROR] Background Webflow submission failed:`, error);
          });
        }
      } catch (formDataError) {
        console.error(`[ERROR] Error creating FormData for page ${pageNumber}:`, formDataError);
      }
      
      // Handle specific page actions after submission
      if (pageNumber === 2 && typeof showquestions === 'function') {
        console.log("[DEBUG] Calling showquestions function for page 2");
        showquestions();
      }
      
      // Navigate to the next page
      console.log(`[DEBUG] Navigating from page ${pageNumber} to page ${pageNumber + 1}`);
      
      // Hide current page and show next
      const currentPageElement = document.querySelector(`#page${pageNumber}`) || document.querySelector(`.page-${pageNumber}`);
      const nextPageElement = document.querySelector(`#page${pageNumber + 1}`) || document.querySelector(`.page-${pageNumber + 1}`);
      
      if (currentPageElement) {
        console.log(`[DEBUG] Hiding page ${pageNumber}`);
        currentPageElement.classList.add("hidden");
        if (currentPageElement.style) currentPageElement.style.display = "none";
      }
      
      if (nextPageElement) {
        console.log(`[DEBUG] Showing page ${pageNumber + 1}`);
        nextPageElement.classList.remove("hidden");
        if (nextPageElement.style) nextPageElement.style.display = "block";
      }
      
      setButtonPage(pageNumber, "next");
      window.scrollTo(0, 0); // Scroll to top of page for better UX
    });
  }
  
  // Log the forms we found for debugging
  const page3Form1 = document.querySelector("#wf-form-walknew31");
  const page3Form2 = document.querySelector("#wf-form-walknew3-2");
  
  console.log("[DEBUG] Page 3 forms found:", {
    "wf-form-walknew31": !!page3Form1, // This one will be ignored
    "wf-form-walknew3-2": !!page3Form2  // Only listening to this one
  });
  
  // Set up form submission handlers for all pages
  handleFormSubmission("#wf-form-walknew1", 1);
  handleFormSubmission("#wf-form-walknew2", 2);
  handleFormSubmission("#wf-form-walknew3-2", 3); // Only for the second form on page 3
  handleFormSubmission("#wf-form-walknew4", 4);
  handleFormSubmission("#wf-form-walknew5", 5);
  
  // Show additional questions based on selected media types  
  function showquestions() {
    console.log("[SURVEY] Checking for conditional questions to show");
    //show youtube and billboard questions
    if (stop === false) {
      var i = 1;
      while (offline.length >= i) {
        if (offline[i-1] == "ป้ายโฆษณา") {
          document.querySelector("#billboard-question-block").classList.remove("hidden");
          document.querySelector("#billboard-question-block").setAttribute("required", true);
          console.log("[SURVEY] Showing billboard question block");
          i = offline.length;
        }
        i+=1;
      }
      
      i = 1;
      while (online.length >= i) {
        if ((online[i-1]) == "เว็บไซต์รีวิว" || online[i-1] == "Youtube") {
          document.querySelector("#youtube-block").classList.remove("hidden");
          document.querySelector("#youtube-block").setAttribute("required", true);
          console.log("[SURVEY] Showing youtube block");
        }
        
        if (["TikTok", "Youtube", "Google", "Facebook", "Instagram"].includes(online[i-1])) {
          document.querySelector("#tiktok-block").classList.remove("hidden");
          document.querySelector("#tiktok-block").setAttribute("required", true);
          console.log("[SURVEY] Showing tiktok block");
        }
        
        i+=1;
      }
    }
  }
  
  // Function to move an item from left to right in drag-drop survey
  function moveItemToBox(event, dropBox, dragBox) {
    var itemToMove;
    if (event.target) {
      if (event.target.classList.contains('drag-drop-items')) {
        itemToMove = event.target;
      } else {
        itemToMove = event.target.parentElement;
      }
    } else { 
      itemToMove = event;
    }
    
    var count = dropBox.id.includes('right') ? dropBox.children.length : dragBox.children.length - 1;
    console.log(`[SURVEY] Move item count: ${count}, dropBox: ${dropBox.id}, dragBox: ${dragBox.id}`);
    
    if (count < 3) {
      console.log(`[SURVEY] Moving item: ${itemToMove.textContent}`);
      // add selected color
      if (dropBox.id.includes('right')) {
        itemToMove.classList.remove("disable"); 
        addtoArray(itemToMove.id, itemToMove.textContent, 'add');
      } else {
        itemToMove.classList.add("disable");
        addtoArray(itemToMove.id, itemToMove.textContent, 'remove');
      }
  
      const clonedItem = itemToMove.cloneNode(true);
      dropBox.appendChild(clonedItem);
      itemToMove.remove();
          
      //add click back to the item
      clonedItem.addEventListener("click", function(event) {
        moveItemToBox(event, dragBox, dropBox);
      });
    }
  }
});

async function storeCustomerData() {
  // Assuming customer_id, line_login, visitors, userid, and projectid are global variables
  const customerData = {
    customer_id: customer_id,
    line_login: line_login,
    visitors: visitors,
    userid: userid,
    projectid: projectid,
    timestamp: new Date().toISOString() // Add ISO timestamp
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
  
  // Create standardized data object based on page number
  let standardizedData = {};
  
  // Define field mappings for each page (LEFT: backend field name, RIGHT: original form field name)
  const fieldMappings = {
    1: {
      'name': 'Name',                 // Map Name → name
      'surname': 'Surname',           // Map Surname → surname
      'id': 'p1-survey-id',           // Map p1-survey-id → id
      'phone': 'Phone',               // Map Phone → phone
      'lineid': 'line-id',            // Map line-id → lineid
      'email': 'Email',               // Map Email → email
      'age': 'Age',                   // Map Age → age  
      'marital': 'p1-q2',             // Map p1-q2 → marital
      'tumbon_work': 'tumbon-work',   // FIX: Map tumbon-work → tumbon_work
      'amphur_work': 'amphur-work',   // FIX: Map amphur-work → amphur_work
      'province_work': 'province-work', // FIX: Map province-work → province_work
      'zipcode_work': 'zipcode-work', // FIX: Map zipcode-work → zipcode_work
      'job': 'Job',                   // Map Job → job
      'tumbon_home': 'tumbon-home',   // FIX: Map tumbon-home → tumbon_home
      'amphur_home': 'amphur-home',   // FIX: Map amphur-home → amphur_home
      'province_home': 'province-home', // FIX: Map province-home → province_home
      'zipcode_home': 'zipcode-home', // FIX: Map zipcode-home → zipcode_home
      'realestate_installment': 'p1-q3', // Map p1-q3 → realestate_installment
      'current_home': 'p1-q4',        // Map p1-q4 → current_home
      'prefix': 'p1-q1'               // Map p1-q1 → prefix
    },
    2: {
      // LEFT SIDE: Backend field name we want to use
      // RIGHT SIDE: Original field name from the form
      'income': 'slider-single',         // Map slider-single → income
      'budget': 'Slider-Single-2',       // Map Slider-Single-2 → budget
      'have_debt': 'p2-q1',              // FIX: Map p2-q1 → have_debt
      'debt': 'Slider-Single-6',         // Map Slider-Single-6 → debt
      'member_family': 'Slider-Single-3', // Map Slider-Single-3 → member_family
      'decision': 'slider-single-4',     // FIX: Map slider-single-4 → decision (lowercase)
      'number_house': 'slider-single-5', // FIX: Map slider-single-5 → number_house (lowercase)
      'dragdrop_data': 'name-2'          // FIX: Map name-2 → dragdrop_data
    },
    3: {
      'first_media': 'p3-q1',              // Map p3-q1 → first_media
      'billboard': 'ads_backup',           // Map ads_backup → billboard
      'website_review': 'web_backup',      // Map web_backup → website_review
      'video_ads': 'tiktok_backup',        // Map tiktok_backup → video_ads
      'google_map': 'p3-q5',               // Map p3-q5 → google_map
      'route': 'route_backup',             // Map route_backup → route
      'compare_project': 'p3-q7',          // Map p3-q7 → compare_project
      'compare_name': 'compare-datail',    // Map compare-datail → compare_name
      'firstmedia_backup': 'firstmedia_backup' // FIX: Add mapping for firstmedia_backup
    },
    4: {
      'satisfaction': 'p4-q1',
      'comment': 'Comments'      // Map Comments → comment (already correct)
    },
    5: {
      'consent': 'p5-q1',
      'id': 'P-5-Survey-Id'     // Map P-5-Survey-Id → id
    }
  };
  
  // Get the mapping for the current page or use an empty object if not defined
  const currentMapping = fieldMappings[pageNumber] || {};
  
  if (Object.keys(currentMapping).length === 0) {
    console.log(`[DEBUG] No field mapping defined for page ${pageNumber}, using original field names`);
  }
  
  // Process each form field through the mapping
  for (const [key, value] of formData.entries()) {
    let newKey = key; // Default to original key
    let mappingFound = false;
    
    // Look for this original field name in the mapping values - do a careful debug
    console.log(`[DEBUG] Processing form field: "${key}" with value: "${value}"`);
    
    // Look for exact matches first, then case-insensitive matches
    for (const [backendKey, originalKey] of Object.entries(currentMapping)) {
      if (originalKey === key) {
        newKey = backendKey;
        mappingFound = true;
        console.log(`[DEBUG] Found exact match: "${originalKey}" -> "${backendKey}"`);
        break;
      }
    }
    
    // If no exact match found, try case-insensitive match as a fallback
    if (!mappingFound) {
      const keyLower = key.toLowerCase();
      for (const [backendKey, originalKey] of Object.entries(currentMapping)) {
        if (originalKey.toLowerCase() === keyLower) {
          newKey = backendKey;
          mappingFound = true;
          console.log(`[DEBUG] Found case-insensitive match: "${originalKey}" -> "${backendKey}"`);
          break;
        }
      }
    }
    
    // Add to standardized data with the new key
    standardizedData[newKey] = value;
    if (mappingFound) {
      console.log(`[DEBUG] Field mapped: "${key}" -> "${newKey}"`);
    } else {
      console.log(`[DEBUG] No mapping found for "${key}", keeping original name`);
    }
  }
  
  // Log standardized data
  console.log(`[DEBUG] Standardized data for page ${pageNumber}:`, standardizedData);
  
  // Create payload according to the API requirements
  const payload = {
    payloadkey: customer_id,
    payloaddatatype: pageNumber.toString(),
    timestamp: new Date().toISOString(), // Add ISO timestamp
    ...standardizedData
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