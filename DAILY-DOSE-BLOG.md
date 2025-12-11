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
```bash
npm create vite@latest check-yo-rep -- --template react
cd check-yo-rep
npm install
```

**Why Vite?** Lightning-fast dev server with HMR (Hot Module Replacement) and optimized builds. No webpack config headaches.

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

**Environment Setup:**
Create `.env.local`:
```
VITE_CICERO_API_KEY=your_cicero_key_here
VITE_GOOGLE_API_KEY=your_google_key_here
```

---

### 3. **Build the Address Autocomplete**

The Google Places autocomplete gives users a smooth experience - they start typing, Google suggests addresses, click one, done.

**Key Code (App.jsx:16-80):**
```javascript
// Load Google Maps script dynamically
useEffect(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`
  script.async = true
  script.onload = () => {
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      }
    )
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setAddress(place.formatted_address)
      }
    })
  }
  document.head.appendChild(script)
}, [])
```

**Why this works:**
- Restricts to US addresses only
- Listens for selection and auto-fills the input
- Loads script dynamically (no need to put it in index.html)

---

### 4. **Fetch Elected Officials from Cicero API**

When user submits the address, hit Cicero's API to get official data.

**Key Code (App.jsx:82-126):**
```javascript
const fetchReps = async () => {
  setLoading(true)
  setError(null)

  try {
    const apiUrl = `/api/cicero?search_loc=${encodeURIComponent(address)}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error('Could not find representatives')
    }

    const data = await response.json()
    const candidates = data.response.results.candidates

    if (!candidates || !candidates[0].officials) {
      throw new Error('No representatives found')
    }

    setNormalizedAddress(candidates[0].match_addr)
    setReps(candidates[0].officials)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

**Important:** We're calling `/api/cicero`, not Cicero's API directly. That's our serverless function (next step).

---

### 5. **Create Vercel Serverless Function for API Proxy**

**Why?** You can't expose API keys in frontend code - anyone can see them in the browser. The serverless function keeps keys secure on the backend.

**Create `/api/cicero.js`:**
```javascript
export default async function handler(req, res) {
  const { search_loc } = req.query

  const CICERO_API_KEY = process.env.CICERO_API_KEY
  const url = `https://cicero.azavea.com/v3.1/official?search_loc=${encodeURIComponent(search_loc)}&key=${CICERO_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

This routes `/api/*` requests to your serverless functions.

---

### 6. **Group Officials by Government Level**

Users don't care about district types - they care about "who's my mayor?" vs "who's my senator?"

**Key Code (App.jsx:153-187):**
```javascript
const groupByLevel = (officials) => {
  const levels = {
    local: { name: 'Local', icon: '🏙️', officials: [] },
    county: { name: 'County', icon: '🏘️', officials: [] },
    state: { name: 'State', icon: '🏢', officials: [] },
    federal: { name: 'Federal', icon: '🏛️', officials: [] }
  }

  officials.forEach((official) => {
    const districtType = official.office?.district?.district_type || ''
    const title = (official.office?.title || '').toLowerCase()

    let level = 'other'

    if (districtType.includes('LOCAL')) {
      level = 'local'
    } else if (districtType.includes('COUNTY') || title.includes('county')) {
      level = 'county'
    } else if (districtType.includes('STATE') || title.includes('governor')) {
      level = 'state'
    } else if (districtType.includes('NATIONAL') || title.includes('senator')) {
      level = 'federal'
    }

    levels[level].officials.push(official)
  })

  return ['local', 'county', 'state', 'federal']
    .map(key => levels[key])
    .filter(l => l.officials.length > 0)
}
```

This organizes reps logically: city council first, Congress last.

---

### 7. **Add Party Affiliation with Color Coding**

Make it visual - Democrats get blue, Republicans get red, etc.

**Key Code (App.jsx:133-151):**
```javascript
const getPartyClass = (party) => {
  if (!party) return 'party-unknown'
  const p = party.toLowerCase()
  if (p.includes('democrat')) return 'party-dem'
  if (p.includes('republican')) return 'party-rep'
  if (p.includes('libertarian')) return 'party-lib'
  if (p.includes('green')) return 'party-green'
  return 'party-other'
}

const getPartyEmoji = (party) => {
  if (!party) return '🤷'
  const p = party.toLowerCase()
  if (p.includes('democrat')) return '🔵'
  if (p.includes('republican')) return '🔴'
  if (p.includes('libertarian')) return '🟡'
  if (p.includes('green')) return '🟢'
  return '⚪'
}
```

**CSS (App.css):**
```css
.party-dem { border-left: 4px solid #1e40af; }
.party-rep { border-left: 4px solid #dc2626; }
.party-lib { border-left: 4px solid #eab308; }
.party-green { border-left: 4px solid #16a34a; }
```

Subtle but effective visual cues.

---

### 8. **Display Official Cards with Contact Info**

Each rep gets a card with:
- Photo (or initials placeholder if no photo)
- Name, title, district
- Party affiliation
- Contact links (website, phone, email, social media)

**Key Code (App.jsx:289-331):**
```javascript
<div className={`rep-card ${getPartyClass(official.party)}`}>
  <div className="rep-photo-wrapper">
    {getPhotoUrl(official) ? (
      <img src={getPhotoUrl(official)} alt={getOfficialName(official)} />
    ) : (
      <div className="rep-photo-placeholder">
        {official.first_name?.[0]}{official.last_name?.[0]}
      </div>
    )}
    <span className="party-badge">{getPartyEmoji(official.party)}</span>
  </div>

  <div className="rep-info">
    <h3>{getOfficialName(official)}</h3>
    <p className="rep-office">{official.office?.title}</p>
    <p className="rep-party">{official.party}</p>

    <div className="rep-links">
      {getWebsiteUrl(official) && (
        <a href={getWebsiteUrl(official)} target="_blank">🌐 Website</a>
      )}
      {getPhone(official) && (
        <a href={`tel:${getPhone(official)}`}>📞 {getPhone(official)}</a>
      )}
      {getEmail(official) && (
        <a href={`mailto:${getEmail(official)}`}>✉️ Email</a>
      )}
    </div>
  </div>
</div>
```

Clean, scannable, mobile-friendly.

---

### 9. **Deploy to Vercel**

**Step 1:** Install Vercel CLI
```bash
npm i -g vercel
```

**Step 2:** Deploy
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set environment variables (Cicero + Google API keys)

**Step 3:** Set Production Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:
- `CICERO_API_KEY` = your_key
- `VITE_GOOGLE_API_KEY` = your_key (for frontend)

**Step 4:** Redeploy
```bash
vercel --prod
```

Live in seconds.

---

### 10. **Mobile Optimization**

The app is mobile-first. Key CSS tricks:

```css
.reps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .reps-grid {
    grid-template-columns: 1fr;
  }
}
```

Cards stack vertically on mobile, grid on desktop.

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
