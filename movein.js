/**
 * Survey Form Navigation and Submission Handler for Move-in Assessment
 * 
 * This script is designed to handle multi-page form navigation and submission
 * for the move-in assessment survey at www.prinsiri.com/survey/move-in
 * 
 * Features:
 * - Multi-page form navigation
 * - Form data collection and storage
 * - URL parameter parsing for customer data
 * - Consent verification
 * - Form submission to Google Apps Script endpoint
 * - Retry logic for failed submissions
 * 
 * Version: 2025-03-21
 */

// Logs version info to console to verify which version is loaded
console.log("Movein.js loaded - Version: 2025-03-21");

const formData = new FormData(); // Stores form data
let warningShown = false; // Tracks whether the consent warning has already been shown

const parseBase64Url = (token) => {
  // Parses a base64-encoded URL token into a JSON object
  return JSON.parse(decodeURIComponent(window.atob(token)));
};

const navHandler = (curPage, nextOrPrevPage, btn, questions) => {
  // Handles navigation between pages in the form
  if (btn === "next") {
    curPage.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevents default form submission
      getInputData(questions); // Collects input data for the current page
      curPage.classList.add("hidden"); // Hides the current page
      nextOrPrevPage.classList.remove("hidden"); // Shows the next page
      return false;
    });
  } else if (btn === "previous") {
    curPage.querySelector("#btn-previous").addEventListener("click", function (e) {
      e.preventDefault(); // Prevents default click action
      curPage.classList.add("hidden"); // Hides the current page
      nextOrPrevPage.classList.remove("hidden"); // Shows the previous page
      return false;
    });
  }
};

const getInputData = (questions) => {
  // Collects input data for each question and adds it to FormData
  questions.forEach((question) => {
    const quest = question.replace("-", ""); // Removes hyphens from question names
    const value = document.querySelector(`input[name='${question}']:checked`).value; // Gets the selected value
    console.log(`Saving response for ${quest}: ${value}`); // Logs collected input data
    formData.set(quest, value); // Adds the data to FormData
  });
};

const pages = {
  page1: document.querySelector("#page1"),
  page2: document.querySelector("#page2"),
  page3: document.querySelector("#page3"),
  page4: document.querySelector("#page4"),
  page5: document.querySelector("#page5"),
  page6: document.querySelector("#page6"),
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page fully loaded, initializing form navigation."); // Logs initialization
  const urlData = new URL(window.location.href);

  try {
    const data = parseBase64Url(urlData.searchParams.get("transfer"));
    console.log("Parsed data from URL:", data); // Logs parsed URL data
    for (const [key, value] of Object.entries(data)) {
      formData.set(key, value); // Adds parsed data to FormData
      console.log(`Set ${key}: ${value} in formData`); // Logs each key-value pair added
    }
  } catch (e) {
    console.error("Error parsing customer data from URL:", e); // Logs error in parsing
    alert("No customer data came through, please start again");
  }

  // Initialize navigation handlers
  navHandler(pages.page1, pages.page2, "next", ["p1-q1", "p1-q2", "p1-q3", "p1-q4", "p1-q5"]);
  navHandler(pages.page2, pages.page3, "next", ["p2-q1", "p2-q2", "p2-q3", "p2-q4"]);
  navHandler(pages.page2, pages.page1, "previous", []);
  navHandler(pages.page3, pages.page4, "next", ["p3-q1", "p3-q2", "p3-q3"]);
  navHandler(pages.page3, pages.page2, "previous", []);
  navHandler(pages.page4, pages.page5, "next", ["p4-q1", "p4-q2", "p4-q3", "p4-q4", "p4-q5", "p4-q6"]);
  navHandler(pages.page4, pages.page3, "previous", []);
  navHandler(pages.page5, pages.page6, "next", ["p5-q1", "p5-q2"]);
  navHandler(pages.page5, pages.page4, "previous", []);
  navHandler(pages.page6, pages.page5, "previous", []);
});

pages.page6.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevents default form submission
  console.log("Page 6 form submitted."); // Logs form submission

  let consentChecked = document.querySelector("input[name='consent-check']").checked;
  formData.set("consentChecked", consentChecked); // Records consent status
  console.log("Consent checked:", consentChecked); // Logs consent status

  if (!consentChecked && !warningShown) {
    warningShown = true;
    const consentWarning = document.querySelector("#consent-warning");
    consentWarning.classList.remove("hidden"); // Shows consent warning
    console.warn("Consent not checked. Showing warning."); // Logs consent warning
    window.scrollTo(0, 0);
    return;
  }

  // Add surveyId to FormData
  const surveyId = `case_${Math.round(Math.random(10) * 1000)}${new Date().getTime()}`;
  formData.set("surveyId", surveyId);
  console.log("Generated survey ID:", surveyId); // Logs generated survey ID

  // Convert FormData to query string
  const queryString = new URLSearchParams(formData).toString();
  const appscript = `https://script.google.com/macros/s/AKfycbw_N4YW6uVhG2ox5FQPH84zx5ydOtN343xtap1eV3W2zjmiJGUT8gc7uO_AeoUKH84L/exec`;

  // Immediate UI update
  console.log("Updating UI immediately after form submission."); // Logs UI update action
  document.querySelector("#image--main").remove();
  document.querySelector("#banner--text").remove();
  document.querySelector("#page6").classList.add("hidden");
  document.querySelector("#image--success").classList.remove("hidden");

  // Backend call with retry logic
  async function sendRequest(attempt = 1) {
    try {
      console.log(`Attempt ${attempt}: Sending request to backend.`); // Logs request attempt
      const resp = await fetch(`${appscript}?${queryString}`);
      const responseData = await resp.json();
      console.log(`Response from backend (Attempt ${attempt}):`, responseData); // Logs backend response

      if (responseData.message === "Data saved successfully") {
        console.log("Success: Data saved successfully."); // Logs success message
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error(`Error during fetch (Attempt ${attempt}):`, error);

      if (attempt < 3) {
        console.log("Retrying request..."); // Logs retry action
        await sendRequest(attempt + 1); // Retry request
      } else {
        console.error("Failed after 3 attempts. Giving up."); // Logs final failure
      }
    }
  }

  sendRequest(); // Initial request
});