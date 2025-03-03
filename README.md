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