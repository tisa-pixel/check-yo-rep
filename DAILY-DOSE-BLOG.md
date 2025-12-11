# Daily Dose - Build Post: Check Yo Rep
**For conversionisourgame.com**
**Created:** December 11, 2025

---

## 1. BUILD TITLE
How I Built a Civic Engagement Tool to Find All Your Elected Officials (Free, No Subscription Required)

---

## 2. THE PROBLEM
Most people don't know who represents them in government beyond the President and maybe their senators. Finding local city council members, county commissioners, or state legislators requires clicking through multiple government websites, each with terrible UX. Even when you find the info, there's no easy way to see it all in one place - from City Hall to Capitol Hill.

The tools that DO exist are buried in nonprofit websites, cost money, or only show federal officials. Regular folks who want to contact their reps about local issues? Out of luck.

---

## 3. THE SOLUTION
Built a clean, mobile-first web app that lets you enter any US address and instantly see ALL your elected representatives across every level of government - local, county, state, and federal.

The app uses Google Places for smart address autocomplete (so you don't have to type the full thing), then hits the Cicero API to fetch comprehensive official data. Each rep shows up with their photo, party affiliation, contact info (phone, email, website), and social media links.

Deployed on Vercel with a serverless function to keep API keys secure. The whole thing costs about $0.03 per lookup, and I built it in a weekend.

---

## 4. WATCH ME BUILD IT
[YouTube embed code - TBD]

Watch the full walkthrough on YouTube where I break down the React components, API integration, and deployment setup.

---

## 5. WHAT YOU'LL LEARN
- How to integrate Google Places API for address autocomplete in React
- How to use Cicero API to fetch elected official data
- How to build serverless functions on Vercel to proxy API calls securely
- Organizing officials by government level (local → federal)
- Handling party affiliation with color coding and emojis
- Creating a mobile-first, responsive UI with clean CSS
- Setting up environment variables for API keys
- Deploying React + Vite apps to Vercel

---

## 6. BUILD DETAILS

### 6.1 Time Investment
| Who | Time Required |
|-----|---------------|
| **If You Hire a Dev** | 6-8 hours ($600-$1,200) |
| **If You Build It (with this guide)** | 3-4 hours |

### 6.2 Cost Breakdown
| Approach | Cost |
|----------|------|
| **Developer Rate** | $100-150/hour |
| **Estimated Dev Cost** | $600-$1,200 |
| **DIY Cost (Your Time)** | 3-4 hours + API usage fees |
| **Cicero API** | Free 1,000 credits, then ~$0.03-0.04/lookup (~$298/year for 10K lookups on nonprofit rate) |
| **Google Places API** | Free tier: $200/month credit (covers ~28K autocomplete requests) |
| **Hosting (Vercel)** | Free |

**Total Monthly Cost (light usage):** $0 (within free tiers)

---

## 7. TECH STACK
🔧 **Tools Used:**
- **React 19** (Frontend framework)
- **Vite 7** (Build tool - fast dev server & optimized production builds)
- **Google Places API** (Address autocomplete)
- **Cicero API by Melissa** (Elected officials data - all levels of government)
- **Vercel** (Hosting + serverless functions)
- **CSS3** (Custom styling, no frameworks)

---

## 8. STEP-BY-STEP BREAKDOWN

### 1. **Set Up React Project with Vite**

Start by creating a new React project using Vite as your build tool. Run the create command with the React template, then install dependencies. The whole setup takes under a minute and gives you a blazing-fast development environment right out of the box.

**Why Vite?** Lightning-fast dev server with HMR (Hot Module Replacement) and optimized builds. No webpack config headaches. Changes appear in your browser instantly as you code.

---

### 2. **Get Your API Keys**

**Google Places API:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable "Places API"
- Create credentials → API key
- Restrict to "Places API" for security

**Cicero API:**
- Sign up at [Cicero Data](https://www.cicerodata.com/)
- Get 1,000 free credits to start
- Grab your API key from dashboard

Create a `.env.local` file in your project root to store both API keys. Vite automatically loads environment variables prefixed with `VITE_` and makes them available in your frontend code. The Cicero key will only be used server-side, keeping it secure.

---

### 3. **Build the Address Autocomplete**

Integrate Google Places to give users a smooth address entry experience. When they start typing, Google suggests matching addresses - they click one, and you've got a properly formatted address ready to query.

Load the Google Maps script dynamically when your component mounts. Configure the autocomplete to restrict results to US addresses only, which keeps suggestions relevant and reduces API costs. Set up a listener that captures the selected address and stores it in your component state.

**Why this approach works:**
- Restricts to US addresses only (Cicero only covers US officials)
- Auto-fills the input field so users don't have to type full addresses
- Loads script dynamically instead of cluttering your HTML

---

### 4. **Fetch Elected Officials from Cicero API**

When the user submits their address, make a request to fetch all their elected representatives. Cicero returns a comprehensive list including everyone from city council members to US senators - all in one API call.

Your fetch function should handle loading states, errors, and successful responses. Parse the response to extract the officials array and store it in state. The Cicero API also returns a normalized version of the address, which is useful to display back to the user so they know exactly what location was queried.

**Important:** Your frontend calls your own serverless function at `/api/cicero`, not Cicero's API directly. This keeps your API key hidden from the browser.

---

### 5. **Create Vercel Serverless Function for API Proxy**

Create a serverless function that sits between your frontend and the Cicero API. This function receives requests from your app, adds your secret API key, forwards the request to Cicero, and returns the response. Your API key never leaves the server.

The function is simple: extract the address from the query parameters, construct the Cicero API URL with your key, make the request, and return the JSON response. Add basic error handling so your frontend gets meaningful error messages if something goes wrong.

Configure Vercel to route `/api/*` requests to your serverless functions. This happens automatically when you put your function in the `/api` folder, but you can add explicit rewrites in `vercel.json` if needed.

---

### 6. **Group Officials by Government Level**

Users care about government levels, not district types. They want to see "who's my mayor?" separately from "who's my senator?" Transform the flat list from Cicero into organized groups: Local, County, State, and Federal.

Write a function that examines each official's district type and title to determine their government level. Local officials include city council, mayors, and school board members. County includes commissioners and sheriffs. State includes governors, state legislators, and attorneys general. Federal includes US senators and representatives.

Return the groups in order from local to federal - this puts the officials closest to constituents at the top, which is often who people need to contact most.

---

### 7. **Add Party Affiliation with Color Coding**

Make party affiliation instantly visible with color coding. Democrats get a blue accent, Republicans get red, Libertarians get yellow, Greens get green. This visual cue helps users quickly scan the results without reading every label.

Create helper functions that take a party string and return the appropriate CSS class or emoji. Handle edge cases like null values, variations in party names, and independent candidates. Apply the party class to each official card to add a colored left border.

The styling is subtle but effective - a 4px colored border on the left side of each card. It doesn't overwhelm the design but provides clear visual differentiation at a glance.

---

### 8. **Display Official Cards with Contact Info**

Design a card component that displays everything users need to take action: photo, name, title, party, and contact information. If an official doesn't have a photo in the database, show their initials as a placeholder so the layout stays consistent.

Each card should include clickable links for the official's website, phone number, and email. Use `tel:` links for phone numbers so mobile users can tap to call. Use `mailto:` links for email addresses. Include social media links when available - many officials are more responsive on Twitter than through official channels.

Keep the layout clean and scannable. Users often need to contact multiple officials about the same issue, so make it easy to quickly gather contact info without hunting through cluttered cards.

---

### 9. **Deploy to Vercel**

Deploy your app using the Vercel CLI. Install it globally, then run the deploy command from your project directory. Vercel auto-detects that it's a Vite project and configures the build settings for you.

Follow the prompts to link your project. On first deploy, you'll set up environment variables through the CLI or later in the Vercel dashboard. Add both your Cicero API key (for the serverless function) and Google Places key (for the frontend).

After setting environment variables, redeploy to production. Your app goes live in seconds with automatic SSL, global CDN distribution, and your serverless function ready to proxy API requests securely.

---

### 10. **Mobile Optimization**

Design mobile-first since most civic engagement happens on phones - people look up their reps when they're at town halls, rallies, or watching the news. Use CSS Grid with `auto-fill` and `minmax` to create a responsive layout that adapts to any screen size.

On mobile, cards stack vertically in a single column for easy scrolling. On tablets and desktops, cards flow into a multi-column grid that makes efficient use of screen space. Set reasonable minimum card widths so content never gets too cramped.

Test on actual devices, not just browser dev tools. Touch targets for phone numbers and links should be large enough for thumbs. Font sizes should be readable without zooming.

---

## 9. GITHUB REPO
📂 **Get the Code:**
[View on GitHub: github.com/tisa-pixel/check-yo-rep](https://github.com/tisa-pixel/check-yo-rep)

**What's included in the repo:**
- Full React source code
- Vercel serverless function for API proxy
- README with setup instructions
- Example environment variables
- Vercel deployment configuration

---

## 10. DOWNLOAD THE TEMPLATE
⬇️ **Download Resources:**
- [Clone the repo](https://github.com/tisa-pixel/check-yo-rep) - Full source code ready to deploy
- [Vercel Config](https://github.com/tisa-pixel/check-yo-rep/blob/main/vercel.json) - Serverless function setup
- [.env.example](https://github.com/tisa-pixel/check-yo-rep/blob/main/.env.example) - Environment variable template

**Setup Checklist:**
1. Clone repo: `git clone https://github.com/tisa-pixel/check-yo-rep.git`
2. Install dependencies: `npm install`
3. Get API keys (Google Places + Cicero)
4. Create `.env.local` with keys
5. Run locally: `npm run dev`
6. Deploy to Vercel: `vercel --prod`
7. Set environment variables in Vercel dashboard
8. Test it live!

---

## 11. QUESTIONS? DROP THEM BELOW
💬 **Have questions or want to share your results?**
- Comment on the [YouTube video](#) (TBD)
- DM me on Instagram: [@donottakeifallergictorevenue](https://www.instagram.com/donottakeifallergictorevenue/)
- Open an issue on [GitHub](https://github.com/tisa-pixel/check-yo-rep/issues)

---

## 12. RELATED BUILDS
| Build 1 | Build 2 | Build 3 |
|---------|---------|---------|
| **How I Built a Retell AI Dialer for $0** | **How I Automated Lead Routing in Salesforce** | **How I Track API Usage Without Paying for Monitoring Tools** |
| Built an outbound calling system using Retell AI and Claude | Smart lead distribution based on rep capacity and time zones | Free API monitoring using Google Sheets + Zapier |
| [View Build] | [View Build] | [View Build] |

---

## Additional Metadata (for SEO / Backend)

**Published:** December 11, 2025
**Author:** Tisa Daniels
**Category:** Civic Tech / API Integration / React
**Tags:** #CivicEngagement #React #API #Vercel #GooglePlaces #ElectedOfficials #OpenData
**Estimated Read Time:** 12 minutes
**Video Duration:** TBD

---

## Design Notes for Wix Implementation

### Layout Style:
- **Dark background** (charcoal #1B1C1D)
- **High contrast text** (white headings, light gray body)
- **Accent colors:** Blue (#2563eb), Purple (#7c3aed), Orange (#f59e0b)
- **Clean, modern, mobile-first**

### Call-to-Action Buttons:
- **Primary CTA** (Clone on GitHub): Purple (#7c3aed)
- **Secondary CTA** (Watch on YouTube): Blue (#2563eb)

---

**Template Version:** 1.0
**Created:** December 11, 2025
