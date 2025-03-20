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
      'name': 'Name',
      'surname': 'Surname',
      'id': 'p1-survey-id',
      'phone': 'Phone',
      'lineid': 'line-id',
      'email': 'Email',
      'age': 'Age',
      'marital': 'p1-q2',
      'tumbon_work': 'Tumbon Work',
      'amphur_work': 'Amphur Work',
      'province_work': 'Province Work',
      'zipcode_work': 'Zipcode Work',
      'job': 'Job',
      'tumbon_home': 'Tumbon Home',
      'amphur_home': 'Amphur Home',
      'province_home': 'Province Home',
      'zipcode_home': 'Zipcode Home',
      'realestate_installment': 'p1-q3',
      'current_home': 'p1-q4',
      'prefix': 'p1-q1'
    },
    2: {
      'income': 'slider-single',
      'budget': 'slider-single-2',
      'have_debt': 'p2-q1',
      'debt': 'slider-single-6',
      'member_family': 'slider-single-3',
      'decision': 'slider-single-4',
      'number_house': 'slider-single-5',
      'dragdrop_data': 'name-2'
    },
    3: {
      'first_media': 'p3-q1',
      'billboard': 'ads_backup',
      'website_review': 'web_backup',
      'video_ads': 'tiktok_backup',
      'google_map': 'p3-q5',
      'route': 'route_backup',
      'compare_project': 'p3-q7',
      'compare_name': 'compare-datail'
    },
    4: {
      'satisfaction': 'p4-q1',
      'comment': 'Comments'
    },
    5: {
      'consent': 'p5-q1'
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
    
    // Look for this original field name in the mapping values
    for (const [backendKey, originalKey] of Object.entries(currentMapping)) {
      if (originalKey === key) {
        newKey = backendKey;
        break;
      }
    }
    
    // Add to standardized data with the new key
    standardizedData[newKey] = value;
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