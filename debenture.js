let consent = false;
let lineuser;
let linename;
let code = "";

document.addEventListener("DOMContentLoaded", async () => {
  // Get parameters from URL 
  const urlParams = new URLSearchParams(window.location.search);
  lineuser = urlParams.get('lineId') || "";
  
  // Get session data
  linename = sessionStorage.getItem('lineName') || "";
  const lineEmail = sessionStorage.getItem('lineEmail') || "";
  
  // Populate email field if available
  if (lineEmail && document.querySelector("#email")) {
    document.querySelector("#email").value = lineEmail;
  }

  document.querySelector("#btn-submit").addEventListener("click", (e) => { 
    document.querySelector("#share-consent").classList.remove("hidden");
    document.querySelector("#share-form1").classList.add("hidden");
    generatecode();
  });
  
  document.querySelector("#share-consent-decline").addEventListener("click", (e) => {
    submitform();
    document.querySelector("#share-consent").classList.add("hidden");
    document.querySelector("#share-form2").classList.remove("hidden");
    redirectAfterDelay();
  });
  
  document.querySelector("#share-consent-accept").addEventListener("click", (e) => {
    consent = true;
    submitform();
    document.querySelector("#share-consent").classList.add("hidden");
    document.querySelector("#share-form2").classList.remove("hidden");
    redirectAfterDelay();
  });
  
  // Function to redirect after 2.5 seconds
  function redirectAfterDelay() {
    console.log("Redirecting to LINE OA in 2.5 seconds...");
    setTimeout(() => {
      window.location.href = "https://lin.ee/IqcBEHI";
    }, 2500); // 2500 milliseconds = 2.5 seconds
  }
});

async function generatecode() {
  const list = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  for(var i = 0; i < 12; i++) {
    var rnd = Math.floor(Math.random() * list.length);
    code = code + list.charAt(rnd);
  }
  console.log(code);
  document.querySelector("#code-generate").innerText = code;
}

async function submitform() {
  var url = "https://script.google.com/macros/s/AKfycby3QWJiO3zKIbUxd7KkYN94S9h4v9SReWzuXCnD9LblW7dR9ZhKFd6MUpWXzDkS3pq2/exec";
  const fname = document.querySelector("#name").value;
  const lname = document.querySelector("#surname").value;
  const phone = document.querySelector("#phone").value;
  const email = document.querySelector("#email").value;
  
  // Get UTM parameters from sessionStorage
  const utmSource = sessionStorage.getItem('utm_source') || "";
  const utmMedium = sessionStorage.getItem('utm_medium') || "";
  const utmCampaign = sessionStorage.getItem('utm_campaign') || "";
  
  const resp = await fetch(`${url}?firstname=${fname}&lastname=${lname}&phone=${phone}&email=${email}&consent=${consent}&lineuser=${lineuser}&linename=${linename}&promocode=${code}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`, 
    { redirect: 'follow', mode: 'no-cors' });
}