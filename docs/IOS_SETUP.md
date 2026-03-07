# PhoNo — Apple Developer Portal & Xcode Setup Guide

Complete step-by-step instructions for configuring PhoNo in the Apple Developer Portal, App Store Connect, and Xcode.

## Reference Info

| Field | Value |
|-------|-------|
| App Name | PhoNo |
| Company | PhoNo Inc. |
| Domain | phonoinc.co |
| Team ID | V4SX56P296 |
| Bundle ID (main) | `co.phonoinc.app` |
| App Group | `group.co.phonoinc.app` |
| Merchant ID | `merchant.co.phonoinc.app` |

---

## 1. Register Bundle IDs

Go to [Apple Developer Portal](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles** → **Identifiers**.

Register all 5 bundle IDs. For each one:

1. Click **+** (blue plus button)
2. Select **App IDs** → **Continue**
3. Select type **App** → **Continue**
4. Fill in:
   - **Description**: (see table below)
   - **Bundle ID**: Select **Explicit**, enter the ID from the table
5. Click **Continue** → **Register**

| # | Bundle ID | Description |
|---|-----------|-------------|
| 1 | `co.phonoinc.app` | PhoNo |
| 2 | `co.phonoinc.app.widget` | PhoNo Widget |
| 3 | `co.phonoinc.app.DeviceActivityMonitor` | PhoNo Device Activity Monitor |
| 4 | `co.phonoinc.app.ShieldConfiguration` | PhoNo Shield Configuration |
| 5 | `co.phonoinc.app.ShieldAction` | PhoNo Shield Action |

> **Important**: Register the main app (`co.phonoinc.app`) first. Apple may auto-register it when creating your App Store Connect record, but it's best to do it explicitly so you can configure capabilities.

---

## 2. Create the App Group

1. In **Certificates, Identifiers & Profiles** → **Identifiers**
2. Change the filter dropdown (top-right) from **App IDs** to **App Groups**
3. Click **+** → Select **App Groups** → **Continue**
4. Fill in:
   - **Description**: `PhoNo App Group`
   - **Identifier**: `group.co.phonoinc.app`
5. Click **Continue** → **Register**

### Assign App Group to All 5 Bundle IDs

For **each** of the 5 bundle IDs registered in Step 1:

1. Go to **Identifiers** → filter by **App IDs** → click the bundle ID
2. Scroll down to **App Groups** → check the checkbox to enable it
3. Click **Configure** next to App Groups
4. Check `group.co.phonoinc.app`
5. Click **Continue** → **Save**

All 5 bundle IDs must have the App Group enabled and assigned.

---

## 3. Enable Capabilities per Bundle ID

For each bundle ID, go to **Identifiers** → click the ID → enable the listed capabilities → **Save**.

### Main App — `co.phonoinc.app`

| Capability | Notes |
|-----------|-------|
| **App Groups** | Select `group.co.phonoinc.app` |
| **Family Controls** | Requires approval (see Section 4) |
| **In-App Purchase** | Enabled by default on most App IDs |
| **Push Notifications** | Enable for APNs |
| **Sign in with Apple** | Enable, configure as primary App ID |
| **Apple Pay / Merchant ID** | If shown, configure with `merchant.co.phonoinc.app` |

### Widget — `co.phonoinc.app.widget`

| Capability | Notes |
|-----------|-------|
| **App Groups** | Select `group.co.phonoinc.app` |

No other capabilities needed. The widget only reads shared data via the App Group.

### DeviceActivityMonitor — `co.phonoinc.app.DeviceActivityMonitor`

| Capability | Notes |
|-----------|-------|
| **App Groups** | Select `group.co.phonoinc.app` |
| **Family Controls** | Requires approval (see Section 4) |

### ShieldConfiguration — `co.phonoinc.app.ShieldConfiguration`

| Capability | Notes |
|-----------|-------|
| **App Groups** | Select `group.co.phonoinc.app` |
| **Family Controls** | Requires approval (see Section 4) |

### ShieldAction — `co.phonoinc.app.ShieldAction`

| Capability | Notes |
|-----------|-------|
| **App Groups** | Select `group.co.phonoinc.app` |
| **Family Controls** | Requires approval (see Section 4) |

### Summary Matrix

| Capability | Main App | Widget | DeviceActivityMonitor | ShieldConfiguration | ShieldAction |
|-----------|:--------:|:------:|:--------------------:|:-------------------:|:------------:|
| App Groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| Family Controls | ✅ | — | ✅ | ✅ | ✅ |
| In-App Purchase | ✅ | — | — | — | — |
| Push Notifications | ✅ | — | — | — | — |
| Sign in with Apple | ✅ | — | — | — | — |

---

## 4. Request the Family Controls Entitlement

Family Controls / Screen Time API access requires explicit approval from Apple. You must submit a request for **each** bundle ID that uses it (main app + 3 extensions = 4 requests).

### How to Submit

1. Go to [developer.apple.com/contact/request/family-controls-distribution](https://developer.apple.com/contact/request/family-controls-distribution)
   - If the direct link doesn't work: **Account** → **Certificates, Identifiers & Profiles** → select a bundle ID → click **Family Controls** → you'll see a link to request access
2. Fill in the form for each bundle ID:
   - `co.phonoinc.app`
   - `co.phonoinc.app.DeviceActivityMonitor`
   - `co.phonoinc.app.ShieldConfiguration`
   - `co.phonoinc.app.ShieldAction`

### Draft Request Text

Use this template (adapt as needed) for the description field:

---

> **App Name**: PhoNo
>
> **Bundle ID**: `co.phonoinc.app` *(adjust for each submission)*
>
> **Category**: Productivity / Health & Fitness
>
> **Description of Family Controls Usage**:
>
> PhoNo is a self-directed focus and productivity timer app. It helps users stay focused during study or work sessions by voluntarily blocking distracting apps on their own device.
>
> **How it works**:
> - The user sets a focus timer (25–180 minutes) and optionally selects apps they want to block during the session.
> - The app uses the FamilyControls framework to request authorization (`AuthorizationCenter.shared.requestAuthorization`), which presents the system consent dialog.
> - When a focus session starts, the app creates a `DeviceActivitySchedule` via `DeviceActivityCenter` to monitor the session window.
> - Selected apps are shielded using `ManagedSettingsStore` so they cannot be opened during the session.
> - The `DeviceActivityMonitor` extension detects when the session schedule ends and removes the shields automatically.
> - The `ShieldConfiguration` extension provides a custom UI shown when the user attempts to open a blocked app, displaying a motivational message and remaining session time.
> - The `ShieldAction` extension handles the user's response to the shield (dismiss or end session early).
>
> **Key points**:
> - **Entirely self-directed**: Users choose which apps to block and for how long. There is no parental control, MDM, enterprise management, or monitoring of other users' devices.
> - **User-initiated**: Blocking only activates when the user explicitly starts a focus session. The app never blocks apps without the user's active, voluntary participation.
> - **Temporary**: All shields are automatically removed when the focus session timer expires or when the user ends the session early.
> - **Standard Screen Time APIs**: We use only the public FamilyControls, DeviceActivity, and ManagedSettings frameworks as documented by Apple.
> - **Privacy-first**: We do not collect, store, or transmit any information about which apps the user has installed or uses. App selection data stays on-device in the App Group container.
>
> **Target audience**: Students, professionals, and anyone seeking to reduce phone distractions during focused work periods.
>
> We are happy to provide a TestFlight build, demo video, or any additional information upon request.

---

### After Submitting

- Apple typically responds within **1–5 business days**, but it can take up to 2 weeks.
- You may receive follow-up questions — respond promptly.
- Once approved, the Family Controls capability will become available in your provisioning profiles.
- You can develop and test locally in the meantime using **development** profiles — Family Controls works on physical devices with development signing even before distribution approval, but you'll need approval for App Store / TestFlight distribution.

---

## 5. Create Provisioning Profiles

Go to **Certificates, Identifiers & Profiles** → **Profiles**.

### Prerequisites

Before creating profiles, ensure you have:
- An **iOS Development** certificate (for dev profiles)
- An **iOS Distribution** certificate (for App Store profiles)
- At least one test device registered in **Devices** (for dev profiles)

If you don't have certificates yet:
1. Go to **Certificates** → **+**
2. Select **iOS App Development** → follow the CSR steps → download and install
3. Repeat with **iOS Distribution (App Store Connect)**

### Create Development Profiles (5 total)

For each bundle ID, create a development profile:

1. Click **+** → Select **iOS App Development** → **Continue**
2. Select the bundle ID → **Continue**
3. Select your development certificate → **Continue**
4. Select your test devices → **Continue**
5. Name the profile (see table) → **Generate** → **Download**

| Profile Name | Bundle ID |
|-------------|-----------|
| `PhoNo Development` | `co.phonoinc.app` |
| `PhoNo Widget Development` | `co.phonoinc.app.widget` |
| `PhoNo DeviceActivityMonitor Development` | `co.phonoinc.app.DeviceActivityMonitor` |
| `PhoNo ShieldConfiguration Development` | `co.phonoinc.app.ShieldConfiguration` |
| `PhoNo ShieldAction Development` | `co.phonoinc.app.ShieldAction` |

### Create Distribution Profiles (5 total)

For each bundle ID, create a distribution profile:

1. Click **+** → Select **App Store Connect** → **Continue**
2. Select the bundle ID → **Continue**
3. Select your distribution certificate → **Continue**
4. Name the profile (see table) → **Generate** → **Download**

| Profile Name | Bundle ID |
|-------------|-----------|
| `PhoNo Distribution` | `co.phonoinc.app` |
| `PhoNo Widget Distribution` | `co.phonoinc.app.widget` |
| `PhoNo DeviceActivityMonitor Distribution` | `co.phonoinc.app.DeviceActivityMonitor` |
| `PhoNo ShieldConfiguration Distribution` | `co.phonoinc.app.ShieldConfiguration` |
| `PhoNo ShieldAction Distribution` | `co.phonoinc.app.ShieldAction` |

### Install Profiles

Double-click each downloaded `.mobileprovision` file to install it, or drag them into Xcode.

> **Tip**: If you use Xcode's **Automatic Signing**, you don't need to manually create or download profiles — Xcode generates them on-demand. However, automatic signing may not always pick up the Family Controls entitlement correctly until Apple has approved your request. Manual profiles give you more control.

---

## 6. Set Up App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **Apps** → **+** → **New App**
2. Fill in:

| Field | Value |
|-------|-------|
| Platform | iOS |
| Name | PhoNo |
| Primary Language | English (U.S.) |
| Bundle ID | `co.phonoinc.app` (select from dropdown — must be registered first) |
| SKU | `phonoinc-phono` |
| User Access | Full Access |

3. Click **Create**

### After Creating the App

Configure these sections in the app record:

**App Information** (left sidebar):
- **Category**: Primary — `Productivity`, Secondary — `Health & Fitness`
- **Content Rights**: Does not contain third-party content (or declare if it does)
- **Age Rating**: Complete the questionnaire (likely 4+)

**Pricing and Availability**:
- Set your price (free with IAP)
- Select availability (all territories, or specific ones)

**App Privacy**:
- Fill in the privacy nutrition labels based on what data PhoNo collects
- Link your privacy policy: `https://phonoinc.co/privacy` (update with your actual URL)

**Prepare for Submission** (under the version):
- App Store icon (1024×1024 PNG, no transparency, no rounded corners)
- Screenshots for required device sizes (6.7", 6.5", 5.5" minimum; iPad if universal)
- Description, keywords, support URL, marketing URL
- Build (upload from Xcode first)

---

## 7. Create In-App Purchase Products

In App Store Connect → your app → **Monetization** (or **In-App Purchases** in the sidebar, depending on ASC version).

### 7a. Create the Subscription Group

1. Go to **Subscriptions** (left sidebar) → **+** next to "Subscription Groups"
2. **Reference Name**: `PhoNo Premium`
3. Click **Create**

### 7b. Create Subscription Products

Inside the "PhoNo Premium" group, create each subscription:

For each subscription, click **+** next to the group name → **Create Subscription**:

| Reference Name | Product ID | Duration |
|---------------|-----------|----------|
| Premium Weekly | `co.phonoinc.app.premium.weekly` | 1 Week |
| Premium Monthly | `co.phonoinc.app.premium.monthly` | 1 Month |
| Premium Yearly | `co.phonoinc.app.premium.yearly` | 1 Year |

For each subscription, configure:

1. **Subscription Duration**: Select from dropdown (1 Week / 1 Month / 1 Year)
2. **Subscription Prices**: Click **+** → select base country → set price → **Next** → auto-generate other territories → **Create**
3. **Localizations**: Click **+** → English (U.S.):
   - **Subscription Display Name**: e.g., "PhoNo Premium Weekly"
   - **Description**: e.g., "Unlock premium features: 2x XP, 2x coins, extra streak freezes, more sound slots, and 15% egg discount."
4. **Review Screenshot**: Upload a screenshot showing the subscription UI (required for review)
5. **Review Notes**: "Auto-renewable subscription for premium features. See attached screenshot."

**Set Subscription Order** (ranking within the group):
1. Yearly (highest value — Level 1)
2. Monthly (Level 2)
3. Weekly (Level 3)

This lets users upgrade without losing their current period and prevents downgrades from taking effect until the current period ends.

### 7c. Create Consumable Products (Coin Packs)

Go to **In-App Purchases** → **+** → Select **Consumable**:

| Reference Name | Product ID | Price (suggested) |
|---------------|-----------|-------------------|
| Handful of Coins | `co.phonoinc.app.coins.handful` | $0.99 |
| Pouch of Coins | `co.phonoinc.app.coins.pouch` | $2.99 |
| Chest of Coins | `co.phonoinc.app.coins.chest` | $4.99 |
| Trove of Coins | `co.phonoinc.app.coins.trove` | $9.99 |
| Hoard of Coins | `co.phonoinc.app.coins.hoard` | $19.99 |

For each:
1. Enter Product ID and Reference Name
2. **Pricing**: Click **+** → set base price → auto-generate territories
3. **Localizations**: Add English (U.S.) — Display Name and Description
4. **Review Screenshot**: Upload a screenshot of the purchase UI
5. Click **Save**

### 7d. Create Non-Consumable Products (Bundles)

Go to **In-App Purchases** → **+** → Select **Non-Consumable**:

| Reference Name | Product ID | Price (suggested) |
|---------------|-----------|-------------------|
| Welcome Bundle | `co.phonoinc.app.bundle.welcome` | $1.99 |
| Egg Hunter Bundle | `co.phonoinc.app.bundle.egghunter` | $4.99 |
| Island Master Bundle | `co.phonoinc.app.bundle.islandmaster` | $9.99 |

For each:
1. Enter Product ID and Reference Name
2. **Pricing**: Click **+** → set base price
3. **Localizations**: Add English (U.S.) — Display Name and Description
4. **Review Screenshot**: Upload a screenshot
5. Click **Save**

### 7e. Testing In-App Purchases

1. In App Store Connect → **Users and Access** → **Sandbox** → **Testers** → create a sandbox Apple ID
2. On your test device, sign into the **sandbox** account (Settings → App Store → Sandbox Account, on iOS 16+ it's separate from your main Apple ID)
3. Sandbox subscriptions auto-renew at accelerated rates (weekly = every 3 minutes, monthly = every 5 minutes, yearly = every 30 minutes) and auto-cancel after 6 renewals

---

## 8. Configure Sign in with Apple

### 8a. Create a Services ID (for web-based auth via Supabase)

1. Go to **Certificates, Identifiers & Profiles** → **Identifiers**
2. Click **+** → Select **Services IDs** → **Continue**
3. Fill in:
   - **Description**: `PhoNo Auth Service`
   - **Identifier**: `co.phonoinc.app.auth`
4. Click **Continue** → **Register**
5. Click on the newly created Services ID → check **Sign in with Apple** → click **Configure**
6. Configure:
   - **Primary App ID**: Select `co.phonoinc.app (PhoNo)`
   - **Domains and Subdomains**: Add your Supabase project domain:
     ```
     <YOUR_SUPABASE_PROJECT_REF>.supabase.co
     ```
   - **Return URLs**: Add:
     ```
     https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
     ```
   - Replace `<YOUR_SUPABASE_PROJECT_REF>` with your actual Supabase project reference ID (found in Supabase Dashboard → Settings → General)
7. Click **Next** → **Done** → **Continue** → **Save**

### 8b. Create a Sign in with Apple Key

1. Go to **Certificates, Identifiers & Profiles** → **Keys**
2. Click **+**
3. **Key Name**: `PhoNo Sign in with Apple`
4. Check **Sign in with Apple** → click **Configure**
5. **Primary App ID**: Select `co.phonoinc.app (PhoNo)`
6. Click **Save** → **Continue** → **Register**
7. **Download** the `.p8` key file — **save it securely, you can only download it once**
8. Note the **Key ID** displayed on the confirmation page

### 8c. Configure Supabase

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers** → **Apple**:

| Field | Value |
|-------|-------|
| Enabled | ON |
| Client ID (Services ID) | `co.phonoinc.app.auth` |
| Secret Key | Paste the contents of the `.p8` file |
| Key ID | The Key ID from step 8b.8 |
| Team ID | `V4SX56P296` |

Click **Save**.

### 8d. Native iOS Sign in with Apple

For the native Capacitor app, Sign in with Apple works differently — it uses the native `ASAuthorizationController` flow, not the web-based redirect. The **Sign in with Apple** capability on the main app bundle ID (`co.phonoinc.app`) handles this. No Services ID is needed for native auth, but you need it for Supabase's server-side token validation.

The existing entitlement in `App.entitlements` already includes:
```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

---

## 9. Set Up Push Notification Key (APNs)

Apple recommends using an **APNs Auth Key** (`.p8`) over per-app certificates. One key works for all your apps.

### Create APNs Key

1. Go to **Certificates, Identifiers & Profiles** → **Keys**
2. Click **+**
3. **Key Name**: `PhoNo APNs Key`
4. Check **Apple Push Notifications service (APNs)**
5. Click **Continue** → **Register**
6. **Download** the `.p8` key file — **save it securely, one-time download only**
7. Note the **Key ID**

> **Tip**: You can reuse the same `.p8` key for both Sign in with Apple and APNs by enabling both services on one key. If you already created a key in Section 8b, you can edit it to also enable APNs, or create a separate key.

### Configure Your Push Service

Provide these values to your push notification service (Supabase, Firebase, OneSignal, etc.):

| Field | Value |
|-------|-------|
| Auth Key (.p8 file) | The downloaded file contents |
| Key ID | From the key registration page |
| Team ID | `V4SX56P296` |
| Bundle ID | `co.phonoinc.app` |

### Verify Push Notifications Entitlement

The `aps-environment` entitlement is already configured in `App.entitlements`:
```xml
<key>aps-environment</key>
<string>production</string>
```

For development builds, Xcode automatically uses the `development` APNs environment regardless of this value. The `production` value is used for App Store / TestFlight builds.

---

## 10. Xcode Project Configuration

### 10a. Project-Level Settings

Open `ios/App/App.xcworkspace` in Xcode.

1. Select the **App** project in the navigator (blue icon, top level)
2. Under **Info** → **Deployment Target**: Set to iOS 16.0 (or your minimum)

### 10b. Main App Target — `App`

Select the **App** target → **Signing & Capabilities**:

| Setting | Value |
|---------|-------|
| Team | `PhoNo Inc. (V4SX56P296)` |
| Bundle Identifier | `co.phonoinc.app` |
| Signing | Automatic (recommended) or manual with `PhoNo Development` / `PhoNo Distribution` profiles |

**Capabilities** (already configured via `App.entitlements`):
- App Groups → `group.co.phonoinc.app`
- Family Controls
- In-App Purchase (merchant ID: `merchant.co.phonoinc.app`)
- Push Notifications
- Sign in with Apple

**Build Settings**:
- **Code Sign Entitlements**: `App/App.entitlements` (verify this is set)

### 10c. Existing Extension Targets

The following targets should already exist in the Xcode project. Verify their configuration:

#### ShieldConfiguration Target

| Setting | Value |
|---------|-------|
| Team | `PhoNo Inc. (V4SX56P296)` |
| Bundle Identifier | `co.phonoinc.app.ShieldConfiguration` |
| Entitlements File | `App/Extensions/ShieldConfiguration/ShieldConfiguration.entitlements` |
| Info.plist | `App/Extensions/ShieldConfiguration/Info.plist` |
| Deployment Target | iOS 16.0 |

Capabilities: Family Controls, App Groups (`group.co.phonoinc.app`)

Linked Frameworks: `ManagedSettings`, `ManagedSettingsUI`, `FamilyControls`

#### DeviceActivityMonitor Target

| Setting | Value |
|---------|-------|
| Team | `PhoNo Inc. (V4SX56P296)` |
| Bundle Identifier | `co.phonoinc.app.DeviceActivityMonitor` |
| Entitlements File | `App/Extensions/DeviceActivityMonitor/DeviceActivityMonitor.entitlements` |
| Info.plist | `App/Extensions/DeviceActivityMonitor/Info.plist` |
| Deployment Target | iOS 15.0 |

Capabilities: Family Controls, App Groups (`group.co.phonoinc.app`)

Linked Frameworks: `DeviceActivity`, `ManagedSettings`, `FamilyControls`

#### PhoNoWidget Target

| Setting | Value |
|---------|-------|
| Team | `PhoNo Inc. (V4SX56P296)` |
| Bundle Identifier | `co.phonoinc.app.widget` |
| Entitlements File | `App/Extensions/PhoNoWidget/PhoNoWidget.entitlements` |
| Info.plist | `App/Extensions/PhoNoWidget/Info.plist` |
| Deployment Target | iOS 16.0 |

Capabilities: App Groups (`group.co.phonoinc.app`)

Linked Frameworks: `WidgetKit`, `SwiftUI`

### 10d. Add the ShieldAction Target (New)

The ShieldAction extension files exist at `ios/App/App/Extensions/ShieldAction/` but the Xcode target has not been created yet.

1. **File → New → Target**
2. Search for **Shield Action Extension** → select it → **Next**
3. Fill in:
   - **Product Name**: `ShieldAction`
   - **Bundle Identifier**: `co.phonoinc.app.ShieldAction`
   - **Embed in Application**: App
   - **Language**: Swift
4. Click **Finish**
5. When prompted "Activate ShieldAction scheme?", click **Activate**

**Replace auto-generated files:**

6. Delete the auto-generated `.swift` file that Xcode created in the new target folder
7. Delete any auto-generated `Info.plist` in the target folder (we use the one in `Extensions/`)
8. In the **ShieldAction** target → **Build Settings**:
   - Search for **Info.plist File** → set to: `App/Extensions/ShieldAction/Info.plist`
   - Search for **Code Sign Entitlements** → set to: `App/Extensions/ShieldAction/ShieldAction.entitlements`

**Add source files to the target:**

9. In Project Navigator, select `App/Extensions/ShieldAction/ShieldActionExtension.swift`
10. Open the File Inspector (right panel) → under **Target Membership**, check the `ShieldAction` box
11. Also add to the ShieldAction target:
    - `App/Shared/SharedConstants.swift`
    - Any other shared files the extension needs

**Link frameworks** (Build Phases → Link Binary With Libraries):
- `ManagedSettings.framework`
- `FamilyControls.framework`

**Add capabilities** (Signing & Capabilities → **+ Capability**):
- **Family Controls**
- **App Groups** → add `group.co.phonoinc.app`

**Configure signing:**

| Setting | Value |
|---------|-------|
| Team | `PhoNo Inc. (V4SX56P296)` |
| Bundle Identifier | `co.phonoinc.app.ShieldAction` |
| Deployment Target | iOS 16.0 |

### 10e. Verify Embed App Extensions

1. Select the main **App** target → **Build Phases**
2. Find **Embed App Extensions** (or **Embed Foundation Extensions**)
3. Verify all 4 extensions are listed:
   - `ShieldConfiguration.appex`
   - `DeviceActivityMonitor.appex`
   - `PhoNoWidget.appex`
   - `ShieldAction.appex`
4. If ShieldAction is missing, click **+** → select `ShieldAction.appex` → **Add**

### 10f. Entitlements File Reference

Verify each target points to the correct entitlements file:

| Target | Entitlements Path | Key Entitlements |
|--------|------------------|-----------------|
| App | `App/App.entitlements` | `family-controls`, `application-groups`, `in-app-payments`, `applesignin`, `aps-environment` |
| ShieldConfiguration | `App/Extensions/ShieldConfiguration/ShieldConfiguration.entitlements` | `family-controls`, `application-groups` |
| DeviceActivityMonitor | `App/Extensions/DeviceActivityMonitor/DeviceActivityMonitor.entitlements` | `family-controls`, `application-groups` |
| PhoNoWidget | `App/Extensions/PhoNoWidget/PhoNoWidget.entitlements` | `application-groups` |
| ShieldAction | `App/Extensions/ShieldAction/ShieldAction.entitlements` | `family-controls`, `application-groups` |

### 10g. Build and Verify

1. Select a physical iOS device as the build target (Family Controls doesn't work in Simulator)
2. **Product → Build** (Cmd+B) — all 5 targets should compile
3. Check that the built `.app` bundle contains:
   ```
   PlugIns/
   ├── ShieldConfiguration.appex
   ├── DeviceActivityMonitor.appex
   ├── PhoNoWidget.appex
   └── ShieldAction.appex
   ```
4. Run on device and verify:
   - Focus timer can request Family Controls authorization
   - Shield appears when trying to open a blocked app
   - Widget appears in the widget gallery
   - Sign in with Apple flow works
   - In-app purchases appear (use sandbox account)

---

## Appendix A: Merchant ID Setup

If you plan to use Apple Pay (separate from IAP):

1. **Certificates, Identifiers & Profiles** → **Identifiers** → filter by **Merchant IDs**
2. Click **+** → **Merchant IDs** → **Continue**
3. **Description**: `PhoNo Payments`
4. **Identifier**: `merchant.co.phonoinc.app`
5. Click **Continue** → **Register**

The main app's entitlements already reference this merchant ID:
```xml
<key>com.apple.developer.in-app-payments</key>
<array>
    <string>merchant.co.phonoinc.app</string>
</array>
```

> **Note**: For StoreKit 2 in-app purchases, you do NOT need a Merchant ID. The `in-app-payments` entitlement with merchant ID is only needed if you also integrate Apple Pay for payments outside the App Store. If you're only using IAP, this entitlement is harmless but unnecessary.

---

## Appendix B: Checklist

Use this checklist to track completion:

### Apple Developer Portal
- [ ] Register bundle ID: `co.phonoinc.app`
- [ ] Register bundle ID: `co.phonoinc.app.widget`
- [ ] Register bundle ID: `co.phonoinc.app.DeviceActivityMonitor`
- [ ] Register bundle ID: `co.phonoinc.app.ShieldConfiguration`
- [ ] Register bundle ID: `co.phonoinc.app.ShieldAction`
- [ ] Register App Group: `group.co.phonoinc.app`
- [ ] Assign App Group to all 5 bundle IDs
- [ ] Enable Family Controls on main app + 3 Screen Time extensions
- [ ] Enable In-App Purchase on main app
- [ ] Enable Push Notifications on main app
- [ ] Enable Sign in with Apple on main app
- [ ] Submit Family Controls entitlement request (4 bundle IDs)
- [ ] Create 5 development provisioning profiles
- [ ] Create 5 distribution provisioning profiles
- [ ] Register Merchant ID `merchant.co.phonoinc.app` (if needed)

### App Store Connect
- [ ] Create app record (PhoNo, `co.phonoinc.app`)
- [ ] Create subscription group "PhoNo Premium"
- [ ] Create subscription: `co.phonoinc.app.premium.weekly`
- [ ] Create subscription: `co.phonoinc.app.premium.monthly`
- [ ] Create subscription: `co.phonoinc.app.premium.yearly`
- [ ] Set subscription ranking (yearly > monthly > weekly)
- [ ] Create consumable: `co.phonoinc.app.coins.handful`
- [ ] Create consumable: `co.phonoinc.app.coins.pouch`
- [ ] Create consumable: `co.phonoinc.app.coins.chest`
- [ ] Create consumable: `co.phonoinc.app.coins.trove`
- [ ] Create consumable: `co.phonoinc.app.coins.hoard`
- [ ] Create non-consumable: `co.phonoinc.app.bundle.welcome`
- [ ] Create non-consumable: `co.phonoinc.app.bundle.egghunter`
- [ ] Create non-consumable: `co.phonoinc.app.bundle.islandmaster`
- [ ] Create sandbox tester account
- [ ] Fill in app privacy nutrition labels

### Sign in with Apple
- [ ] Create Services ID: `co.phonoinc.app.auth`
- [ ] Configure domains + redirect URLs for Supabase
- [ ] Create Sign in with Apple key (`.p8`)
- [ ] Configure Apple provider in Supabase dashboard

### Push Notifications
- [ ] Create APNs key (`.p8`)
- [ ] Configure push service with key + Team ID

### Xcode
- [ ] All 5 targets have correct Team ID (`V4SX56P296`)
- [ ] All 5 targets have correct bundle identifiers
- [ ] All 5 targets point to correct entitlements files
- [ ] ShieldAction target created and configured
- [ ] All 4 `.appex` files embedded in main app
- [ ] Build succeeds on physical device
- [ ] Family Controls authorization works
- [ ] Widgets appear in widget gallery
- [ ] IAP products load in sandbox
