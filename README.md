# WebflowJS

A collection of JavaScript utilities for Webflow sites, including LINE LIFF integration.

## LIFF Login Component

This component enables LINE Login Integration for Webflow sites.

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

5. Supported page values:
   - `page=case_assessment`: For case assessment (also requires case_id parameter)
   - `page=movein_assessment`: For move-in assessment
   - `page=commonfee_payment`: For common fee payment
   - `page=insurance_assessment`: For insurance assessment
   - `page=resident_assessment`: For resident assessment
   - `page=ceo`: For CEO survey (redirects to Google Form)

### Example Flow:
1. User visits: `https://www.prinsiri.com/liff/login?page=commonfee_payment`
2. lifflogin.js authenticates the user with LINE
3. lifflogin.js stores userId and name in sessionStorage
4. lifflogin.js redirects to: `https://www.prinsiri.com/liff/homeowner?page=commonfee_payment`
5. homeowner.js verifies the user with their phone number
6. homeowner.js redirects to the appropriate survey page

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
https://www.prinsiri.com/liff/login?page=debenture
```

## Automatic Cache Purging

This repository includes a GitHub Actions workflow that automatically purges the jsDelivr cache when JavaScript files are updated. This ensures that the latest versions are always available without manual intervention.

The workflow:
1. Triggers when JS files are pushed to the main branch
2. Identifies which files were changed
3. Sends purge requests to jsDelivr for both specific commit and @latest versions
4. Provides logs of the purge operations