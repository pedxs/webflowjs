# WebflowJS

A collection of JavaScript utilities for Webflow sites, including LINE LIFF integration.

## LIFF Login Component

This component enables LINE Login Integration for Webflow sites.

### Features:
- Seamless authentication with LINE accounts
- Works on both desktop and mobile devices
- Preserves UTM parameters during authentication flow
- Supports different redirect paths based on URL parameters
- Fallback mechanism for Samsung and other problematic browsers

### Usage:
1. Add the LIFF SDK to your Webflow page:
```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
```

2. Include the lifflogin.js script:
```html
<script src="https://cdn.jsdelivr.net/gh/pedxs/webflowjs@main/lifflogin.js"></script>
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
   - `page`: (Optional) Specify a specific page to redirect to after login ('walk', 'walkcms', or 'assessment')
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

4. When using the script, include the pageId URL parameter to determine which survey to redirect to:
   - `pageId=case_assessment`: For case assessment (also requires case_id parameter)
   - `pageId=movein_assessment`: For move-in assessment
   - `pageId=commonfee_payment`: For common fee payment
   - `pageId=insurance_assessment`: For insurance assessment
   - `pageId=resident_assessment`: For resident assessment
   - `pageId=ceo`: For CEO survey (redirects to Google Form)

### Example URL:
`https://yourwebsite.com/homeowner?pageId=commonfee_payment`