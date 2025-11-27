import { useState } from 'react'
import './App.css'

function App() {
  const [address, setAddress] = useState('')
  const [reps, setReps] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_KEY = 'AIzaSyDFSkoJry8nyIgJqe-2xm9cFvOc5xfLiW8'

  const fetchReps = async () => {
    if (!address.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?key=${API_KEY}&address=${encodeURIComponent(address)}`
      )

      if (!response.ok) {
        throw new Error('Could not find representatives for that address. Double-check it and try again.')
      }

      const data = await response.json()
      setReps(data)
    } catch (err) {
      setError(err.message)
      setReps(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchReps()
  }

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

  const groupByLevel = (offices, officials) => {
    const levels = {
      federal: { name: 'Federal', icon: '🏛️', offices: [] },
      state: { name: 'State', icon: '🏢', offices: [] },
      county: { name: 'County', icon: '🏘️', offices: [] },
      local: { name: 'Local', icon: '🏙️', offices: [] },
      other: { name: 'Other', icon: '📍', offices: [] }
    }

    offices.forEach((office) => {
      const officeName = office.name.toLowerCase()
      let level = 'other'

      if (officeName.includes('president') || officeName.includes('united states') ||
          officeName.includes('u.s.') || officeName.includes('congress')) {
        level = 'federal'
      } else if (officeName.includes('governor') || officeName.includes('state') ||
                 officeName.includes('lieutenant') || officeName.includes('attorney general') ||
                 officeName.includes('secretary of state') || officeName.includes('treasurer')) {
        level = 'state'
      } else if (officeName.includes('county') || officeName.includes('sheriff') ||
                 officeName.includes('commissioner') || officeName.includes('assessor') ||
                 officeName.includes('clerk') || officeName.includes('coroner')) {
        level = 'county'
      } else if (officeName.includes('city') || officeName.includes('mayor') ||
                 officeName.includes('council') || officeName.includes('municipal') ||
                 officeName.includes('school') || officeName.includes('board')) {
        level = 'local'
      }

      const officeOfficials = office.officialIndices.map(i => officials[i])
      levels[level].offices.push({ ...office, officials: officeOfficials })
    })

    return Object.values(levels).filter(l => l.offices.length > 0)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎤 Check Yo Rep</h1>
        <p className="tagline">Know your squad. From City Hall to Capitol Hill.</p>
      </header>

      <main className="main">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address..."
              className="address-input"
            />
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? '🔍' : '🎯'} {loading ? 'Looking...' : 'Check It'}
            </button>
          </div>
          <p className="hint">Full address works best (123 Main St, Denver, CO 80202)</p>
        </form>

        {error && (
          <div className="error">
            <span>😬</span> {error}
          </div>
        )}

        {reps && (
          <div className="results">
            <div className="location-badge">
              📍 {reps.normalizedInput?.line1}, {reps.normalizedInput?.city}, {reps.normalizedInput?.state} {reps.normalizedInput?.zip}
            </div>

            {groupByLevel(reps.offices, reps.officials).map((level, levelIdx) => (
              <section key={levelIdx} className="level-section">
                <h2 className="level-header">
                  <span>{level.icon}</span> {level.name}
                </h2>

                <div className="reps-grid">
                  {level.offices.map((office, officeIdx) => (
                    office.officials.map((official, officialIdx) => (
                      <div key={`${officeIdx}-${officialIdx}`} className={`rep-card ${getPartyClass(official.party)}`}>
                        <div className="rep-photo-wrapper">
                          {official.photoUrl ? (
                            <img src={official.photoUrl} alt={official.name} className="rep-photo" />
                          ) : (
                            <div className="rep-photo-placeholder">
                              {official.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          <span className="party-badge">{getPartyEmoji(official.party)}</span>
                        </div>

                        <div className="rep-info">
                          <h3 className="rep-name">{official.name}</h3>
                          <p className="rep-office">{office.name}</p>
                          <p className="rep-party">{official.party || 'Party not listed'}</p>

                          <div className="rep-links">
                            {official.urls?.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="rep-link">
                                🌐 Website
                              </a>
                            ))}
                            {official.phones?.map((phone, i) => (
                              <a key={i} href={`tel:${phone}`} className="rep-link">
                                📞 {phone}
                              </a>
                            ))}
                            {official.emails?.map((email, i) => (
                              <a key={i} href={`mailto:${email}`} className="rep-link">
                                ✉️ Email
                              </a>
                            ))}
                            {official.channels?.map((channel, i) => {
                              const icons = {
                                Facebook: '📘',
                                Twitter: '🐦',
                                YouTube: '📺',
                                Instagram: '📷'
                              }
                              const urls = {
                                Facebook: `https://facebook.com/${channel.id}`,
                                Twitter: `https://twitter.com/${channel.id}`,
                                YouTube: `https://youtube.com/${channel.id}`,
                                Instagram: `https://instagram.com/${channel.id}`
                              }
                              return (
                                <a key={i} href={urls[channel.type]} target="_blank" rel="noopener noreferrer" className="rep-link">
                                  {icons[channel.type] || '🔗'} {channel.type}
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!reps && !error && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🗳️</div>
            <p>Enter your address to see who represents you</p>
            <p className="empty-sub">From City Hall to Capitol Hill</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Check Yo Rep - Democracy stays on beat 🎤</p>
        <p className="footer-sub">Data from Google Civic Information API</p>
      </footer>
    </div>
  )
}

export default App
