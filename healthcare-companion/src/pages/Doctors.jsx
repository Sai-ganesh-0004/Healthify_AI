import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CITY_COORDS = {
  "Hyderabad":      { lat: 17.3850, lon: 78.4867 },
  "Vijayawada":     { lat: 16.5062, lon: 80.6480 },
  "Visakhapatnam":  { lat: 17.6868, lon: 83.2185 },
  "Bangalore":      { lat: 12.9716, lon: 77.5946 },
  "Chennai":        { lat: 13.0827, lon: 80.2707 },
  "Mumbai":         { lat: 19.0760, lon: 72.8777 },
  "Delhi":          { lat: 28.6139, lon: 77.2090 },
  "Pune":           { lat: 18.5204, lon: 73.8567 },
  "Kolkata":        { lat: 22.5726, lon: 88.3639 },
  "Ahmedabad":      { lat: 23.0225, lon: 72.5714 },
};

const SPECIALTY_TAGS = {
  "Hospitals":        'amenity=hospital',
  "Clinics":          'amenity=clinic',
  "Doctors":          'amenity=doctors',
  "Pharmacies":       'amenity=pharmacy',
  "Health Centres":   'amenity=health_post',
};

export default function Doctors() {
  const [city, setCity]           = useState("");
  const [cityInput, setCityInput] = useState("");
  const [specialty, setSpecialty] = useState("Hospitals");
  const [places, setPlaces]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 17.3850, lon: 78.4867 });
  const [selected, setSelected]   = useState(null);
  const [searched, setSearched]   = useState(false);

  const searchDoctors = async (searchCity, searchSpecialty) => {
    const coords = CITY_COORDS[searchCity];
    if (!coords) { setError(`City "${searchCity}" not found. Try: Hyderabad, Bangalore, Chennai, Mumbai, Delhi`); return; }

    setLoading(true);
    setError("");
    setPlaces([]);
    setMapCenter(coords);
    setSearched(true);

    try {
      const tag    = SPECIALTY_TAGS[searchSpecialty];
      const delta  = 0.15;
      const bbox   = `${coords.lat - delta},${coords.lon - delta},${coords.lat + delta},${coords.lon + delta}`;
      const query  = `[out:json][timeout:25];node[${tag}](${bbox});out body;`;
      const url    = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      const res    = await fetch(url);
      const data   = await res.json();

      const results = (data.elements || [])
        .filter(e => e.tags?.name)
        .map(e => ({
          id:       e.id,
          name:     e.tags.name,
          lat:      e.lat,
          lon:      e.lon,
          phone:    e.tags?.phone || e.tags?.["contact:phone"] || "Not available",
          address:  [e.tags?.["addr:street"], e.tags?.["addr:city"]].filter(Boolean).join(", ") || searchCity,
          website:  e.tags?.website || null,
          opening:  e.tags?.opening_hours || "Contact for hours",
          emergency: e.tags?.emergency === "yes" ? true : false,
        }));

      if (results.length === 0) {
        setError(`No ${searchSpecialty.toLowerCase()} found in ${searchCity}. Try a different specialty or city.`);
      } else {
        setPlaces(results.slice(0, 30));
      }
    } catch (err) {
      setError("Failed to fetch data. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    // Try to match known city or use as-is
    const matched = Object.keys(CITY_COORDS).find(c => c.toLowerCase() === trimmed.toLowerCase()) || trimmed;
    setCity(matched);
    searchDoctors(matched, specialty);
  };

  const handleSpecialtyChange = (s) => {
    setSpecialty(s);
    if (city) searchDoctors(city, s);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👨‍⚕️ Find Doctors & Hospitals</h1>
        <p className="page-subtitle">Search real hospitals and clinics near you using OpenStreetMap</p>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <span className="card-title">🔍 Search Location</span>
          <span style={{ fontSize: "0.75rem", color: "var(--accent)" }}>● Live Data</span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input className="form-input" placeholder="Enter city name e.g. Hyderabad, Bangalore, Chennai..."
            value={cityInput} onChange={e => setCityInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{ flex: 1, marginBottom: 0, minWidth: "200px" }} />
          <button className="btn-primary" onClick={handleSearch}
            disabled={!cityInput.trim() || loading}
            style={{ width: "auto", padding: "10px 24px", whiteSpace: "nowrap" }}>
            {loading ? "Searching..." : "Search →"}
          </button>
        </div>

        {/* Quick City Buttons */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Select</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.keys(CITY_COORDS).map(c => (
              <button key={c} onClick={() => { setCityInput(c); setCity(c); searchDoctors(c, specialty); }} style={{
                padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem",
                background: city === c ? "var(--accent)" : "var(--bg)",
                border: `1px solid ${city === c ? "var(--accent)" : "var(--border)"}`,
                color: city === c ? "#000" : "var(--text2)", fontWeight: city === c ? 700 : 400,
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Specialty Filter */}
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Type</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.keys(SPECIALTY_TAGS).map(s => (
              <button key={s} onClick={() => handleSpecialtyChange(s)} style={{
                padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "0.82rem",
                background: specialty === s ? "rgba(0,212,170,0.15)" : "var(--bg)",
                border: `1px solid ${specialty === s ? "var(--accent)" : "var(--border)"}`,
                color: specialty === s ? "var(--accent)" : "var(--text2)", fontWeight: specialty === s ? 700 : 400,
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)",
          borderRadius: "var(--radius-sm)", color: "#ff4d6d", fontSize: "0.85rem", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">Fetching real data from OpenStreetMap...</div>
        </div>
      )}

      {/* Map */}
      {!loading && searched && places.length > 0 && (
        <>
          <div style={{ marginBottom: "16px", fontSize: "0.85rem", color: "var(--text3)" }}>
            Found <strong style={{ color: "var(--accent)" }}>{places.length}</strong> {specialty.toLowerCase()} in <strong style={{ color: "var(--text)" }}>{city}</strong>
          </div>

          {/* Leaflet Map */}
          <div className="card" style={{ marginBottom: "20px", padding: 0, overflow: "hidden", height: "380px" }}>
            <MapContainer center={[mapCenter.lat, mapCenter.lon]} zoom={13}
              style={{ height: "100%", width: "100%", borderRadius: "var(--radius)" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {places.map(p => (
                <Marker key={p.id} position={[p.lat, p.lon]}>
                  <Popup>
                    <div style={{ minWidth: "180px" }}>
                      <strong>{p.name}</strong><br />
                      📍 {p.address}<br />
                      📞 {p.phone}<br />
                      🕐 {p.opening}
                      {p.emergency && <><br /><span style={{ color: "red" }}>🚨 Emergency</span></>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Results List */}
          <div className="doctors-grid">
            {places.map((place) => (
              <div key={place.id} className="doctor-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ fontSize: "1.8rem" }}>
                    {specialty === "Hospitals" ? "🏥" : specialty === "Pharmacies" ? "💊" : specialty === "Clinics" ? "🏨" : "👨‍⚕️"}
                  </div>
                  {place.emergency && (
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "20px",
                      background: "rgba(255,77,109,0.1)", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.3)" }}>
                      🚨 Emergency
                    </span>
                  )}
                </div>

                <div className="doctor-name" style={{ marginBottom: "6px", fontSize: "0.95rem" }}>{place.name}</div>

                <div style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "4px" }}>
                  📍 {place.address}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "4px" }}>
                  📞 {place.phone}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: "12px" }}>
                  🕐 {place.opening}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setSelected(selected?.id === place.id ? null : place)}
                    style={{ flex: 1, padding: "7px", background: "transparent",
                      border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                      color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem" }}>
                    📍 View on Map
                  </button>
                  {place.website && (
                    <a href={place.website} target="_blank" rel="noreferrer"
                      style={{ flex: 1, padding: "7px", background: "transparent",
                        border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                        color: "var(--text2)", cursor: "pointer", fontSize: "0.8rem",
                        textDecoration: "none", textAlign: "center" }}>
                      🌐 Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !searched && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <div className="empty-text">Enter a city name above to find real hospitals and doctors near you.</div>
        </div>
      )}
    </div>
  );
}