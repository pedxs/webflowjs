# WebflowJS

A collection of JavaScript utilities for Webflow sites, including LINE LIFF integration.

## LIFF Login Component

This component enables LINE Login Integration for Webflow sites.

> **Note for testing:** The UAT branch is configured to work with the test domain https://prinsiri.webflow.io/ and uses LIFF ID `1657411915-p7MDBJBd`, while production (www.prinsiri.com) uses LIFF ID `1657411915-nDO8alaM`. LIFF IDs are domain-specific.

### Features:
- Seamless authentication with LINE accounts
- Works on both desktop and mobile devices
- Preserves UTM parameters during authentication flow
- Supports different redirect paths based on URL parameters
- Fallback mechanism for devices with LIFF initialization issues
- Automatic cache purging via GitHub Actions

### Usage:
1. Add the LIFF SDK to your Webflow page:
```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
```

2. Include the lifflogin.js script:
```html
<script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@latest/lifflogin.js"></script>
```

3. Add the required HTML elements:
```html
<div id="waiting_block">
  <h2>Please wait...</h2>
  <p>We are trying to authenticate you with LINE</p>
</div>
    
<div id="samsung_block" style="display: none;">
  <h2>Authentication Required</h2>
  <p>Click below to open LINE app and authenticate</p>
  <a id="samsung_button" href="#" class="button">Login with LINE</a>
</div>
```

4. When using the script, include the necessary URL parameters:
   - `line`: The LINE Official Account ID for redirect after login
   - `page`: (Optional) Specify a specific page to redirect to after login ('walk', 'walkcms', 'assessment', 'debenture', etc.)
   - `projectid`: (Optional) Required when page is 'walkcms'

### Supported Page Redirections:
| Page Parameter | Redirects To | Description | Additional Parameters |
|----------------|--------------|-------------|------------------------|
| No page parameter (default) | LINE Official Account | Redirects directly to LINE OA specified by `line` parameter | line (required) |
| `walk` | /survey/walk | Community walkthrough | - |
| `walkcms` | /walk-survey/{projectid} | Construction walkthrough | projectid |
| `assessment` | /survey/guard-house-and-assessment | General assessment | - |
| `debenture` | /liff/debenture | Debenture registration | - |
| `commonfee_payment` | /liff/homeowner → /survey/commonfee-payment | Common fee payment | - |
| `movein_assessment` | /liff/homeowner → /survey/move-in | Move-in assessment | - |
| `case_assessment` | /liff/homeowner → /survey/case-assessment | Case assessment | case_id |
| `insurance_assessment` | /liff/homeowner → /survey/insurance-assessment | Insurance assessment | - |
| `resident_assessment` | /liff/homeowner → /survey/resident-assessment | Resident assessment | - |
| `ceo` | /liff/homeowner → Google Form | CEO direct feedback | - |

### Example URL:
`https://yourwebsite.com/login?line=12345&page=walk`

## Homeowner LIFF Component

This component enables homeowner verification through LINE Login and phone/OTP verification.

### Features:
- LINE authentication and profile retrieval
- Phone number validation with OTP verification
- Dynamic redirection to different survey types based on URL parameters
- Support for various assessment types (case, move-in, commonfee, insurance, etc.)

### Usage:
1. Add the LIFF SDK to your Webflow page:
```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
```

2. Include the homeowner.js script:
```html
<script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@main/homeowner.js"></script>
```

3. Add the required HTML elements:
```html
<!-- Loading state -->
<div id="regis_loading">
  <h2>Please wait...</h2>
  <p>Checking your profile...</p>
</div>

<!-- Phone entry form -->
<form id="submit-phone-form" class="hidden">
  <label for="regis_phone">Enter your phone number</label>
  <input type="tel" id="regis_phone" required>
  <button type="submit">Verify</button>
</form>

<!-- OTP verification form -->
<div id="submit-otp-form" class="hidden">
  <label for="regis_otp">Enter OTP</label>
  <input type="text" id="regis_otp" required>
  <button id="submit-otp">Submit</button>
  <div id="warning-otp" class="hidden">Incorrect OTP. Please try again.</div>
</div>

<!-- Error states -->
<div id="phone-not-found" class="hidden">
  <p>Phone number not found in our database.</p>
</div>

<div id="not-verified" class="hidden">
  <p>We could not verify your account. Please contact customer service.</p>
</div>

<div id="error-message" class="hidden">
  <p>An error occurred. Please try again later.</p>
</div>
```

4. Important Notes:
   - The homeowner.js script requires that the user has already been authenticated via lifflogin.js
   - lifflogin.js will store the LINE userId and name in sessionStorage, which homeowner.js will use
   - Use the same 'page' parameter name that lifflogin.js uses (not pageId)

5. Supported page values and their redirection destinations:
   | Page Parameter | Final Destination | Description | Required Parameters |
   |----------------|------------------|-------------|---------------------|
   | `case_assessment` | /survey/case-assessment | For individual case assessment | case_id |
   | `movein_assessment` | /survey/move-in | For move-in assessment | - |
   | `commonfee_payment` | /survey/commonfee-payment | For common fee payment | - |
   | `insurance_assessment` | /survey/insurance-assessment | For insurance claims | - |
   | `resident_assessment` | /survey/resident-assessment | For general resident satisfaction | - |
   | `ceo` | Google Form | Direct feedback to CEO | - |

### Complete User Journey:
1. User visits: `[domain]/liff/login?page=commonfee_payment`
2. lifflogin.js authenticates the user with LINE
3. lifflogin.js stores userId and name in sessionStorage
4. lifflogin.js redirects to: `[domain]/liff/homeowner?page=commonfee_payment&lineuser=[LINE_USER_ID]`
5. homeowner.js checks if user is already verified in the backend:
   - If verified, redirects directly to the appropriate survey page
   - If not verified, shows phone number form for verification
6. After phone verification, user enters OTP code
7. Upon successful OTP verification, the page reloads and redirects to the appropriate survey page with user data
8. The survey page receives the user data in encrypted format through the URL

## Debenture LIFF Component

This component provides a debenture registration form that integrates with LINE Login.

### Features:
- Uses LINE profile information from lifflogin.js
- Auto-fills email field with LINE email if available
- Generates unique promotion codes
- Handles consent flow for marketing communications
- Redirects to LINE Official Account after submission

### Usage:
1. Include the debenture.js script on your debenture page:
```html
<script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@latest/debenture.js"></script>
```

2. Add the required HTML elements:
```html
<!-- Initial form -->
<div id="share-form1">
  <form>
    <input type="text" id="name" placeholder="First Name">
    <input type="text" id="surname" placeholder="Last Name">
    <input type="tel" id="phone" placeholder="Phone">
    <input type="email" id="email" placeholder="Email">
    <button id="btn-submit">Submit</button>
  </form>
</div>

<!-- Consent dialog -->
<div id="share-consent" class="hidden">
  <h3>Marketing Consent</h3>
  <p>Do you consent to receiving marketing communications?</p>
  <div id="code-generate"></div>
  <button id="share-consent-accept">Yes, I consent</button>
  <button id="share-consent-decline">No, I decline</button>
</div>

<!-- Thank you / confirmation -->
<div id="share-form2" class="hidden">
  <h3>Thank You!</h3>
  <p>Your registration has been submitted.</p>
</div>
```

3. Access via lifflogin.js by setting page=debenture:
```
[domain]/liff/login?page=debenture
```

## Walk Survey JS Component

This component enables multi-page survey forms with data submission to Google Cloud Pub/Sub.

### Features:
- Multi-page survey navigation
- Automatic generation and persistence of survey IDs
- Thailand address autocomplete integration
- Form data submission to Google Cloud Pub/Sub
- Fallback mechanism for failed data submissions

### Usage:
1. Include the required libraries in your HTML:
```html
<!-- jQuery and Thailand autocomplete dependencies -->
<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dependencies/JQL.min.js"></script>
<script src="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dependencies/typeahead.bundle.js"></script>
<link rel="stylesheet" href="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dist/jquery.Thailand.min.css">
<script src="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dist/jquery.Thailand.min.js"></script>

<!-- Walk Survey script -->
<script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@latest/walksurvey.js"></script>
```

2. Add the required HTML forms structure:
```html
<!-- Page 1 -->
<form id="page1">
  <input type="hidden" id="p1-survey-id" name="survey_id">
  <!-- Form fields for page 1 -->
  <button type="submit">Next</button>
</form>

<!-- Page 2 -->
<form id="page2" class="hidden">
  <input type="hidden" id="p2-survey-id" name="survey_id">
  <!-- Form fields for page 2 -->
  <button type="submit">Next</button>
</form>

<!-- Continue for pages 3-5 -->
```

3. For Thailand address autocomplete, use these field IDs:
```html
<!-- Work address -->
<input id="tumbon-work" placeholder="ตำบล / แขวง">
<input id="amphur-work" placeholder="อำเภอ / เขต">
<input id="province-work" placeholder="จังหวัด">
<input id="zipcode-work" placeholder="รหัสไปรษณีย์">

<!-- Home address -->
<input id="tumbon-home" placeholder="ตำบล / แขวง">
<input id="amphur-home" placeholder="อำเภอ / เขต">
<input id="province-home" placeholder="จังหวัด">
<input id="zipcode-home" placeholder="รหัสไปรษณีย์">
```

4. The script will automatically:
   - Generate and persist a unique survey ID
   - Show/hide form pages as the user navigates
   - Submit form data to Pub/Sub when moving between pages
   - Handle data persistence and retries on submission failure

### Available Versions:
- Basic version (without Pub/Sub integration):
  ```html
  <script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@d052a3e6cbff6bf7ff5aec9239806d42402173aa/walksurvey.js"></script>
  ```
- Full version (with Pub/Sub integration):
  ```html
  <script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@2687fb521ae5a774e8d4c08a5a6a6a1cfd75a424/walksurvey.js"></script>
  ```

## Automatic Cache Purging

This repository includes a GitHub Actions workflow that automatically purges the jsDelivr cache when JavaScript files are updated. This ensures that the latest versions are always available without manual intervention.

The workflow:
1. Triggers when JS files are pushed to the main branch
2. Identifies which files were changed
3. Sends purge requests to jsDelivr for both specific commit and @latest versions
4. Provides logs of the purge operations