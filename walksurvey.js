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
  const randomId = `surveyid_${Math.round(Math.random(10) * 1000)}${new Date().getTime()}`;
  href = window.location.href;
  urlObject = new URL(window.location.href);
      
  customer_id = urlObject.searchParams.get("surveyid");  // Updated to use 'surveyid' as the parameter name
  
  if(!customer_id) {
    // Generate a new customer_id and use it directly
    customer_id = `surveyid_${Math.round(Math.random() * 1000)}${new Date().getTime()}`;
    // Update the URL with the new surveyid
    urlObject.searchParams.set("surveyid", customer_id);
    window.history.replaceState(null, '', urlObject.toString());
  }
  // Call the function to ensure it's executed
  storeCustomerData();
  document.querySelector("#p1-survey-id").value = customer_id;
  document.querySelector("#p2-survey-id").value = customer_id;
  document.querySelector("#p3-survey-id").value = customer_id;
  document.querySelector("#p4-survey-id").value = customer_id;
  document.querySelector("#p5-survey-id").value = customer_id;
  
  let bpage = 1;
  
  // Intercept submit button clicks, not form submissions
  // This allows the form to submit to Webflow normally, but also handles our navigation
  
  // For page 1
  const page1Buttons = document.querySelector("#page1 input[type='submit'], #page1 button[type='submit']");
  if (page1Buttons) {
    page1Buttons.addEventListener("click", async function(e) {
      // Don't prevent default - let form submit to Webflow
      // But do our navigation after a slight delay
      const formData = new FormData(document.querySelector("#page1"));
      await sendFormDataToPubSub(1, formData);
      
      // Set a timeout to navigate after form is submitted
      setTimeout(() => {
        // First check if we're still on the same page (form didn't redirect)
        if (!document.querySelector("#page1").classList.contains("hidden")) {
          setButtonPage(1, "next");
        }
      }, 200);
    });
  }
  
  // For page 2
  const page2Buttons = document.querySelector("#page2 input[type='submit'], #page2 button[type='submit']");
  if (page2Buttons) {
    page2Buttons.addEventListener("click", async function(e) {
      const formData = new FormData(document.querySelector("#page2"));
      await sendFormDataToPubSub(2, formData);
      
      setTimeout(() => {
        if (!document.querySelector("#page2").classList.contains("hidden")) {
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
      const formData = new FormData(document.querySelector("#page3"));
      await sendFormDataToPubSub(3, formData);
      
      setTimeout(() => {
        if (!document.querySelector("#page3").classList.contains("hidden")) {
          setButtonPage(3, "next");
        }
      }, 200);
    });
  }
  
  // For page 4
  const page4Buttons = document.querySelector("#page4 input[type='submit'], #page4 button[type='submit']");
  if (page4Buttons) {
    page4Buttons.addEventListener("click", async function(e) {
      const formData = new FormData(document.querySelector("#page4"));
      await sendFormDataToPubSub(4, formData);
      
      setTimeout(() => {
        if (!document.querySelector("#page4").classList.contains("hidden")) {
          setButtonPage(4, "next");
        }
      }, 200);
    });
  }
  
  // For page 5
  const page5Buttons = document.querySelector("#page5 input[type='submit'], #page5 button[type='submit']");
  if (page5Buttons) {
    page5Buttons.addEventListener("click", async function(e) {
      const formData = new FormData(document.querySelector("#page5"));
      await sendFormDataToPubSub(5, formData);
      
      setTimeout(() => {
        if (!document.querySelector("#page5").classList.contains("hidden")) {
          setButtonPage(5, "next");
        }
      }, 200);
    });
  }
  
  // Maintain backwards compatibility with original event listeners
  document.querySelector("#page1").addEventListener("submit", async (e) => { 
    e.preventDefault(); 
    await sendFormDataToPubSub(1, new FormData(document.querySelector("#page1")));
    setButtonPage(1, "next"); 
  });
  
  document.querySelector("#page2").addEventListener("submit", async (e) => { 
    e.preventDefault(); 
    await sendFormDataToPubSub(2, new FormData(document.querySelector("#page2")));
    showquestions();
    setButtonPage(2, "next");
  });
  
  document.querySelector("#page3").addEventListener("submit", async (e) => { 
    e.preventDefault(); 
    await sendFormDataToPubSub(3, new FormData(document.querySelector("#page3")));
    setButtonPage(3, "next"); 
  });
  
  document.querySelector("#page4").addEventListener("submit", async (e) => { 
    e.preventDefault(); 
    await sendFormDataToPubSub(4, new FormData(document.querySelector("#page4")));
    setButtonPage(4, "next"); 
  });
  
  document.querySelector("#page5").addEventListener("submit", async (e) => { 
    e.preventDefault(); 
    await sendFormDataToPubSub(5, new FormData(document.querySelector("#page5")));
    setButtonPage(5, "next"); 
  });
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
  
  // Send to Pub/Sub service
  const url = 'https://pubsub-826626291152.asia-southeast1.run.app/WalkData';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    console.log(`Page ${pageNumber} data sent to Pub/Sub:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Error sending page ${pageNumber} data to Pub/Sub:`, error);
    // Try again once on failure
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseData = await response.json();
      console.log(`Retry: Page ${pageNumber} data sent to Pub/Sub:`, responseData);
      return responseData;
    } catch (retryError) {
      console.error(`Retry also failed for page ${pageNumber}:`, retryError);
      return null;
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