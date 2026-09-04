import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  CloudSun,
  History,
  MapPin,
  Menu,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  X,
  Bookmark,
  LogIn,
  ShieldCheck,
  GraduationCap,
  PartyPopper,
  CarFront
} from "lucide-react";

import "./styles.css";

// ==================================================
// FASTAPI
// ==================================================

const API_URL = "http://127.0.0.1:8000";

async function getPrediction(data) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Prediction request failed");
  }

  return await response.json();
}

// ==================================================
// TOURIST PLACES
// ==================================================

const places = [
  // ================================
  // ANDHRA PRADESH
  // ================================

  {
    name: "Araku Valley",
    state: "Andhra Pradesh",
    district: "Alluri Sitharama Raju",
    type: "Hill Station",
    category: "Hill Station",
    icon: "⛰️"
  },
  {
    name: "Borra Caves",
    state: "Andhra Pradesh",
    district: "Alluri Sitharama Raju",
    type: "Cave",
    category: "Cave",
    icon: "🪨"
  },
  {
    name: "Rushikonda Beach",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    type: "Beach",
    category: "Beach",
    icon: "🏖️"
  },
  {
    name: "Kailasagiri",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    type: "Hill",
    category: "Hill",
    icon: "🌄"
  },
  {
    name: "Submarine Museum",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    type: "Museum",
    category: "Museum",
    icon: "⚓"
  },
  {
    name: "Simhachalam Temple",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Lepakshi Temple",
    state: "Andhra Pradesh",
    district: "Sri Sathya Sai",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Horsley Hills",
    state: "Andhra Pradesh",
    district: "Annamayya",
    type: "Hill Station",
    category: "Hill Station",
    icon: "🏔️"
  },
  {
    name: "Tirumala Tirupati",
    state: "Andhra Pradesh",
    district: "Tirupati",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Sri Venkateswara National Park",
    state: "Andhra Pradesh",
    district: "Tirupati",
    type: "Wildlife",
    category: "National Park",
    icon: "🌳"
  },
  {
    name: "Chandragiri Fort",
    state: "Andhra Pradesh",
    district: "Tirupati",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Undavalli Caves",
    state: "Andhra Pradesh",
    district: "Guntur",
    type: "Heritage",
    category: "Heritage",
    icon: "🏛️"
  },
  {
    name: "Amaravati Stupa",
    state: "Andhra Pradesh",
    district: "Palnadu",
    type: "Heritage",
    category: "Buddhist Site",
    icon: "☸️"
  },
  {
    name: "Kondaveedu Fort",
    state: "Andhra Pradesh",
    district: "Palnadu",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Prakasam Barrage",
    state: "Andhra Pradesh",
    district: "NTR",
    type: "Landmark",
    category: "Barrage",
    icon: "🌉"
  },
  {
    name: "Bhavani Island",
    state: "Andhra Pradesh",
    district: "NTR",
    type: "Island",
    category: "Island",
    icon: "🏝️"
  },
  {
    name: "Kondapalli Fort",
    state: "Andhra Pradesh",
    district: "NTR",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Papikondalu",
    state: "Andhra Pradesh",
    district: "Alluri Sitharama Raju",
    type: "Nature",
    category: "Hills",
    icon: "🌿"
  },
  {
    name: "Konaseema",
    state: "Andhra Pradesh",
    district: "Konaseema",
    type: "Nature",
    category: "Backwaters",
    icon: "🌴"
  },
  {
    name: "Srisailam",
    state: "Andhra Pradesh",
    district: "Nandyal",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Belum Caves",
    state: "Andhra Pradesh",
    district: "Nandyal",
    type: "Cave",
    category: "Cave",
    icon: "🪨"
  },
  {
    name: "Mangalagiri",
    state: "Andhra Pradesh",
    district: "Guntur",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },

  // ================================
  // TELANGANA
  // ================================

  {
    name: "Charminar",
    state: "Telangana",
    district: "Hyderabad",
    type: "Heritage",
    category: "Monument",
    icon: "🕌"
  },
  {
    name: "Golconda Fort",
    state: "Telangana",
    district: "Hyderabad",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Chowmahalla Palace",
    state: "Telangana",
    district: "Hyderabad",
    type: "Heritage",
    category: "Palace",
    icon: "🏛️"
  },
  {
    name: "Salar Jung Museum",
    state: "Telangana",
    district: "Hyderabad",
    type: "Museum",
    category: "Museum",
    icon: "🏺"
  },
  {
    name: "Hussain Sagar Lake",
    state: "Telangana",
    district: "Hyderabad",
    type: "Lake",
    category: "Lake",
    icon: "🌊"
  },
  {
    name: "Shilparamam",
    state: "Telangana",
    district: "Hyderabad",
    type: "Cultural",
    category: "Cultural Village",
    icon: "🎨"
  },
  {
    name: "Ramoji Film City",
    state: "Telangana",
    district: "Rangareddy",
    type: "Entertainment",
    category: "Theme Park",
    icon: "🎬"
  },
  {
    name: "Keesaragutta Temple",
    state: "Telangana",
    district: "Medchal-Malkajgiri",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Ananthagiri Hills",
    state: "Telangana",
    district: "Vikarabad",
    type: "Hill Station",
    category: "Hills",
    icon: "🌄"
  },
  {
    name: "Bhongir Fort",
    state: "Telangana",
    district: "Yadadri Bhuvanagiri",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Yadadri Temple",
    state: "Telangana",
    district: "Yadadri Bhuvanagiri",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Ramappa Temple",
    state: "Telangana",
    district: "Mulugu",
    type: "Heritage",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Warangal Fort",
    state: "Telangana",
    district: "Warangal",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Thousand Pillar Temple",
    state: "Telangana",
    district: "Hanamkonda",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Laknavaram Lake",
    state: "Telangana",
    district: "Mulugu",
    type: "Lake",
    category: "Lake",
    icon: "🌊"
  },
  {
    name: "Eturnagaram Wildlife Sanctuary",
    state: "Telangana",
    district: "Mulugu",
    type: "Wildlife",
    category: "Wildlife Sanctuary",
    icon: "🐘"
  },
  {
    name: "Kaleshwaram Temple",
    state: "Telangana",
    district: "Jayashankar Bhupalpally",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Vemulawada Temple",
    state: "Telangana",
    district: "Rajanna Sircilla",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Medak Fort",
    state: "Telangana",
    district: "Medak",
    type: "Heritage",
    category: "Fort",
    icon: "🏰"
  },
  {
    name: "Medak Cathedral",
    state: "Telangana",
    district: "Medak",
    type: "Heritage",
    category: "Church",
    icon: "⛪"
  },
  {
    name: "Manjira Wildlife Sanctuary",
    state: "Telangana",
    district: "Sangareddy",
    type: "Wildlife",
    category: "Wildlife Sanctuary",
    icon: "🦚"
  },
  {
    name: "Kuntala Waterfall",
    state: "Telangana",
    district: "Nirmal",
    type: "Nature",
    category: "Waterfall",
    icon: "💧"
  },
  {
    name: "Pochera Waterfall",
    state: "Telangana",
    district: "Nirmal",
    type: "Nature",
    category: "Waterfall",
    icon: "💧"
  },
  {
    name: "Kawal Tiger Reserve",
    state: "Telangana",
    district: "Mancherial",
    type: "Wildlife",
    category: "Tiger Reserve",
    icon: "🐅"
  },
  {
    name: "Basara Temple",
    state: "Telangana",
    district: "Nirmal",
    type: "Temple",
    category: "Temple",
    icon: "🛕"
  },
  {
    name: "Nagarjuna Sagar",
    state: "Telangana",
    district: "Nalgonda",
    type: "Nature",
    category: "Dam",
    icon: "🌊"
  },
  {
    name: "Somasila",
    state: "Telangana",
    district: "Nagarkurnool",
    type: "Nature",
    category: "Backwaters",
    icon: "🌿"
  },
  {
    name: "Pillalamarri",
    state: "Telangana",
    district: "Mahabubnagar",
    type: "Nature",
    category: "Heritage Tree",
    icon: "🌳"
  }
];

// ==================================================
// COMPARISON DATA
// ==================================================

// ==================================================
// APP
// ==================================================

function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Traveller",
          email: firebaseUser.email || ""
        });

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setSaved(Array.isArray(data.savedPlaces) ? data.savedPlaces : []);
          } else {
            await setDoc(
              userRef,
              {
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Traveller",
                savedPlaces: []
              },
              { merge: true }
            );
            setSaved([]);
          }
        } catch (error) {
          console.error("Could not load saved places:", error);
          setSaved([]);
        }
      } else {
        setUser(null);
        setSaved([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (nextPage) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setPage(nextPage);
  };

  const [page, setPage] = useState("home");

  const [selected, setSelected] = useState(null);

  // FIXED: search starts EMPTY
  const [query, setQuery] = useState("");

  const [visitDate, setVisitDate] = useState("");

  const [user, setUser] = useState(null);

  const [saved, setSaved] = useState([]);

  const [history, setHistory] = useState([]);

  const [feedback, setFeedback] = useState(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Search error
  const [searchError, setSearchError] = useState("");

  // ==================================================
  // AI STATES
  // ==================================================

  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(false);

  // ==================================================
  // SIGNAL VALUES
  // ==================================================

  const [signals, setSignals] = useState({
    crowd: "—",
    crowdDetail: "Click AI Generator",

    weather: "—",
    weatherDetail: "Waiting for prediction",

    institutional: "—",
    institutionalDetail: "Waiting for prediction",

    transport: "—",
    transportDetail: "Waiting for prediction"
  });

  // ==================================================
  // SELECT PLACE
  // ==================================================

  const choosePlace = (place) => {
    if (!place) return;

    setSelected(place);

    setQuery(place.name);

    setSearchError("");

    setPrediction(null);

    setSignals({
      crowd: "—",
      crowdDetail: "Click AI Generator",

      weather: "—",
      weatherDetail: "Waiting for prediction",

      institutional: "—",
      institutionalDetail: "Waiting for prediction",

      transport: "—",
      transportDetail: "Waiting for prediction"
    });

    navigateTo("destination");

    setMobileOpen(false);
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const handleSearch = () => {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
      setSearchError("Please enter a destination.");
      return;
    }

    const found = places.find((place) =>
      place.name.toLowerCase().includes(searchText)
    );

    // IMPORTANT:
    // Do NOT fall back to places[0]
    if (!found) {
      setSearchError(
        "Destination not found. Try Araku Valley, Borra Caves, Kondapalli Fort or Undavalli Caves."
      );
      return;
    }

    choosePlace(found);
  };

  // ==================================================
  // AI GENERATOR
  // ==================================================

  const handlePrediction = async () => {
    if (!selected) {
      alert("Please select a destination first.");
      return;
    }

    if (!visitDate) {
      alert("Please select your visit date first.");
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      // Test all four micro-windows for the selected date.
      const timeWindows = [
        { start: 9, label: "9–11 AM" },
        { start: 12, label: "12–2 PM" },
        { start: 15, label: "3–5 PM" },
        { start: 18, label: "6–8 PM" }
      ];

      const predictions = [];

      for (const window of timeWindows) {
        const result = await getPrediction({
          date: visitDate,
          hour: window.start,
          place: selected.name,
          state: selected.state,
          district: selected.district,
          category: selected.category
        });

        predictions.push({
          ...result,
          time_window: window.label
        });
      }

      // Lowest predicted crowd = best window.
      const best = predictions.reduce((lowest, current) =>
        current.predicted_footfall_index <
        lowest.predicted_footfall_index
          ? current
          : lowest
      );

      setPrediction({
        ...best,
        all_windows: predictions
      });

      setSignals({
        crowd: `${best.predicted_footfall_index}/100`,
        crowdDetail: best.crowd_level,

        weather:
          best.signals?.rainfall_mm > 0
            ? `${best.signals.rainfall_mm} mm`
            : "Good",

        weatherDetail:
          best.signals?.rainfall_mm > 0
            ? "Rainfall detected"
            : "No rainfall detected",

        institutional:
          best.signals?.school_holiday === 1
            ? "Holiday"
            : "Clear",

        institutionalDetail:
          best.signals?.school_holiday === 1
            ? "School holiday signal detected"
            : "No school holiday signal",

        transport: "Public transport available",
        transportDetail: "Public bus services available"
      });

    } catch (error) {
      console.error("Prediction error:", error);

      alert(
        "Unable to get AI prediction. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // PLAN VISIT
  // ==================================================

  const planVisit = () => {
    if (!selected) return;

    setHistory((h) => [
      {
        place: selected.name,

        date:
          prediction
            ? `${prediction.date} · ${prediction.time_window}`
            : `${visitDate} · Not predicted`,

        crowd:
          prediction
            ? prediction.crowd_level
            : "Not predicted"
      },

      ...h.filter(
        (x) =>
          x.place !== selected.name
      )
    ]);

    navigateTo("profile");
  };

  // ==================================================
  // SAVE
  // ==================================================

  const toggleSaved = async () => {
    if (!selected) return;

    if (!user) {
      alert("Please sign in to save places.");
      navigateTo("login");
      return;
    }

    const alreadySaved = saved.includes(selected.name);

    const updatedSaved = alreadySaved
      ? saved.filter((x) => x !== selected.name)
      : [...saved, selected.name];

    // Update the UI immediately.
    setSaved(updatedSaved);

    try {
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          email: user.email || "",
          name: user.name || "Traveller",
          savedPlaces: updatedSaved
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Could not save place:", error);

      // Restore the previous UI state if Firebase fails.
      setSaved(saved);

      alert("Could not update saved places. Please try again.");
    }
  };

  // ==================================================
  // APP UI
  // ==================================================

  return (
    <div className="app">

      {/* NAVIGATION */}

      <header className="nav">

        <div className="nav-inner">

          <button
            className="wordmark"
            onClick={() => {
              navigateTo("home");
              setSearchError("");
            }}
          >
            Time2Travel
          </button>

          <nav
            className={
              mobileOpen
                ? "nav-links open"
                : "nav-links"
            }
          >

            <button
              onClick={() => {
                navigateTo("home");
                setSearchError("");
              }}
            >
              Explore
            </button>

            <button
              onClick={() =>
                navigateTo("profile")
              }
            >
              My trips
            </button>

            {user && (
              <button
                onClick={() =>
                  navigateTo("profile")
                }
              >
                Profile
              </button>
            )}

          </nav>

          <div className="nav-actions">

            <button
              className="login-btn"
              onClick={async () => {
                if (user) {
                  await signOut(auth);
                  navigateTo("home");
                } else {
                  navigateTo("login");
                }
              }}
            >

              {user ? (
                <>
                  <UserRound size={16} />

                  {user.name}
                </>
              ) : (
                <>
                  <LogIn size={16} />

                  Sign in
                </>
              )}

            </button>

            <button
              className="menu-btn"
              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }
            >

              {mobileOpen
                ? <X />
                : <Menu />}

            </button>

          </div>

        </div>

      </header>

      {/* HOME */}

      {page === "home" && (

        <Home
          query={query}
          setQuery={setQuery}
          choosePlace={choosePlace}
          setPage={setPage}
          handleSearch={handleSearch}
          searchError={searchError}
        />

      )}

      {/* DESTINATION */}

      {page === "destination" && selected && (

        <Destination
          place={selected}

          saved={
            saved.includes(
              selected.name
            )
          }

          toggleSaved={
            toggleSaved
          }

          signals={signals}

          visitDate={visitDate}
          setVisitDate={setVisitDate}

          loading={loading}

          prediction={prediction}

          onPredict={
            handlePrediction
          }

          onCompare={() => navigateTo("compare")}

          onBack={() => {
            navigateTo("home");
            setSearchError("");
          }}

          onBest={() =>
            navigateTo("recommendation")
          }

        />

      )}

      {/* RECOMMENDATION */}

      {page === "recommendation" && selected && (

        <Recommendation
          place={selected}

          prediction={prediction}

          onBack={() =>
            navigateTo("destination")
          }

          onCompare={() =>
            navigateTo("compare")
          }

          onPlan={planVisit}

          saved={
            saved.includes(
              selected.name
            )
          }

          toggleSaved={
            toggleSaved
          }

          onPredict={
            handlePrediction
          }

          loading={loading}
        />

      )}

      {/* COMPARE */}

      {page === "compare" && (

        <Compare
          prediction={prediction}

          onBack={() =>
            setPage(
              "recommendation"
            )
          }

          onPlan={planVisit}
        />

      )}

      {/* LOGIN */}

      {page === "login" && (

        <Login
          onDone={(firebaseUser) => {
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Traveller",
              email: firebaseUser.email || ""
            });
            navigateTo("profile");
          }}
          onBack={() => navigateTo("home")}
        />

      )}

      {/* PROFILE */}

      {page === "profile" && (

        <Profile
          user={user}

          saved={saved}

          history={history}

          feedback={feedback}

          setFeedback={
            setFeedback
          }

          setPage={setPage}

          choosePlace={choosePlace}
        />

      )}

      {/* FOOTER */}

      <footer className="footer">

        <span>
          Time2Travel
        </span>

        <span>
          Smarter times. Better trips.
        </span>

      </footer>

    </div>
  );
}

// ==================================================
// LABEL
// ==================================================

function Label({ children }) {

  return (
    <div className="section-label">

      <span></span>

      <b>
        {children}
      </b>

      <span></span>

    </div>
  );
}

// ==================================================
// HOME
// ==================================================

function Home({
  query,
  setQuery,
  choosePlace,
  setPage,
  handleSearch,
  searchError
}) {

  return (

    <main>

      <section className="hero">

        <div className="hero-copy">

          <p className="kicker">
            HYPERLOCAL TRAVEL INTELLIGENCE
          </p>

          <h1>
            Don’t just know where.
            <br />

            <em>
              Know when.
            </em>
          </h1>

          <p className="hero-sub">
            Discover the exact day and
            time to visit a place — using
            local calendars, weather,
            events and historical crowd
            patterns.
          </p>

          {/* SEARCH */}

          <div className="search">

            <MapPin size={19} />

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              aria-label="Search destination"
              placeholder="Search a destination"
            />

            <button
              onClick={handleSearch}
            >
              Find my best time

              <ArrowRight
                size={17}
              />
            </button>

          </div>

          {/* SEARCH ERROR */}

          {searchError && (

            <p
              style={{
                color: "#B8860B",
                marginTop: "10px",
                fontSize: "14px"
              }}
            >
              {searchError}
            </p>

          )}

        </div>

        <div className="hero-note">

          <div className="note-rule"></div>

          <p>
            “The best trips are not only
            about where you go, but when
            you arrive.”
          </p>

        </div>

      </section>

      <section className="content-section">

        <Label>
          Explore nearby
        </Label>

        <div className="place-grid">

          {places.map((p) => (

            <button
              className="place-card"
              key={p.name}
              onClick={() =>
                choosePlace(p)
              }
            >

              <div className="place-art">
                {p.icon}
              </div>

              <div>

                <p className="mono">
                  {p.type}
                </p>

                <h3>
                  {p.name}
                </h3>

                <p className="muted">
                  {p.state}
                </p>

              </div>

              <ArrowRight
                className="card-arrow"
                size={17}
              />

            </button>

          ))}

        </div>

      </section>

      <section className="manifesto">

        <div>

          <p className="kicker">
            A FINER GRAIN OF TRAVEL PLANNING
          </p>

          <h2>
            From “visit in winter” to
            “Tuesday, 3–5 PM.”
          </h2>

        </div>

        <div className="manifesto-text">

          <p>
            Time2Travel looks beyond broad
            seasons. It combines small local
            signals to find a quieter,
            more comfortable and potentially
            less expensive window.
          </p>

          <button
            className="text-link"
            onClick={() => {
              setPage("destination");

              if (!places.length) return;

              choosePlace(
                places[0]
              );
            }}
          >
            See an example

            <ArrowRight size={15} />

          </button>

        </div>

      </section>

    </main>
  );
}

// ==================================================
// DESTINATION PROFILE
// ==================================================

function Destination({
  place,
  onBack,
  onBest,
  saved,
  toggleSaved,
  signals,
  visitDate,
  setVisitDate,
  loading,
  prediction,
  onPredict,
  onCompare
}) {

  return (

    <main className="inner">

      <button
        className="back"
        onClick={onBack}
      >

        <ChevronLeft size={16} />

        Explore

      </button>

      <div className="destination-title">

        <div>

          <p className="kicker">
            DESTINATION PROFILE
          </p>

          <h1>
            {place.name}
          </h1>

          <p className="location">

            <MapPin size={16} />

            {place.state}

            {" · "}

            {place.type}

          </p>

        </div>

        <button
          className="save"
          onClick={toggleSaved}
        >

          {saved
            ? <Check size={16} />
            : <Bookmark size={16} />}

          {saved
            ? "Saved"
            : "Save"}

        </button>

      </div>

      {/* AI GENERATOR */}

      <div
        style={{
          marginTop: "28px",
          marginBottom: "28px"
        }}
      >
        <p className="kicker">
          WHEN DO YOU PLAN TO VISIT?
        </p>

        <input
          type="date"
          value={visitDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setVisitDate(e.target.value)}
          aria-label="Choose visit date"
          style={{
            marginTop: "8px",
            marginBottom: "18px",
            padding: "12px",
            border: "1px solid #E8E4DF",
            background: "#FFFFFF",
            fontSize: "15px"
          }}
        />

        <br />

        <button
          className="gold-btn"
          onClick={onPredict}
          disabled={loading}
        >
          <Sparkles size={18} />

          {loading
            ? "AI is analyzing..."
            : "AI Generator"}

          {!loading && (
            <ArrowRight size={17} />
          )}
        </button>

        {prediction && (
          <p
            className="muted"
            style={{
              marginTop: "12px"
            }}
          >
            AI found the best window for{" "}
            <strong>{prediction.date}</strong>
            {" · "}
            <strong>{prediction.time_window}</strong>
          </p>
        )}
      </div>

      {/* SIGNAL CARDS */}

      <div className="signal-grid">

        <Signal
          icon={<UsersRound />}
          title="Crowd"
          value={
            signals.crowd
          }
          detail={
            signals.crowdDetail
          }
        />

        <Signal
          icon={<CloudSun />}
          title="Weather"
          value={
            signals.weather
          }
          detail={
            signals.weatherDetail
          }
        />

        <Signal
          icon={<GraduationCap />}
          title="Institutional"
          value={
            signals.institutional
          }
          detail={
            signals.institutionalDetail
          }
        />

        <Signal
          icon={<CarFront />}
          title="Transport"
          value={
            signals.transport
          }
          detail={
            signals.transportDetail
          }
        />

      </div>

      {/* AI RESULT */}

      {prediction && (

        <div
          style={{
            marginTop: "28px",
            padding: "24px",
            border:
              "1px solid #E8E4DF",
            background:
              "#FFFFFF"
          }}
        >

          <p className="kicker">
            AI CROWD PREDICTION
          </p>

          <h2
            style={{
              marginBottom: "8px"
            }}
          >

            {prediction.predicted_footfall_index}

            <span
              style={{
                fontSize: "18px",
                marginLeft: "4px"
              }}
            >
              /100
            </span>

          </h2>

          <p className="muted">

            Expected crowd:

            {" "}

            <strong>
              {prediction.crowd_level}
            </strong>

          </p>

          <p className="muted">

            Recommended analysis window:

            {" "}

            <strong>
              {prediction
                ? `${new Date(prediction.date + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "long"
                  })} · ${prediction.time_window}`
                : "Generate a prediction first"}
            </strong>

          </p>

        </div>

      )}

      {prediction && prediction.all_windows && (
        <div
          style={{
            marginTop: "18px",
            marginBottom: "28px"
          }}
        >
          <button
            className="outline-btn"
            onClick={() => onCompare()}
          >
            Compare all windows
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* FEATURE PANEL */}

      <div className="feature-panel">

        <div>

          <p className="kicker">
            OUR MODEL’S PICK
          </p>

          <h2>
            Find the best
            <br />

            <em>
              micro-window.
            </em>
          </h2>

          <p className="muted wide">
            Generate an AI prediction above,
            then explore the detailed
            recommendation.
          </p>

          <button
            className="gold-btn"
            onClick={onBest}
          >

            Show recommendation

            <ArrowRight
              size={17}
            />

          </button>

        </div>

        <div className="abstract-orbit">

          <div className="orbit orbit-1"></div>

          <div className="orbit orbit-2"></div>

          <div className="orbit-dot">
            3–5
            <br />
            PM
          </div>

        </div>

      </div>

    </main>
  );
}

// ==================================================
// SIGNAL CARD
// ==================================================

function Signal({
  icon,
  title,
  value,
  detail
}) {

  return (

    <div className="signal-card">

      <div className="signal-icon">
        {icon}
      </div>

      <p className="mono">
        {title}
      </p>

      <strong>
        {value}
      </strong>

      <small>
        {detail}
      </small>

    </div>
  );
}

// ==================================================
// RECOMMENDATION
// ==================================================

function Recommendation({
  place,
  onBack,
  onCompare,
  onPlan,
  saved,
  toggleSaved,
  prediction,
  onPredict,
  loading
}) {

  return (

    <main className="inner">

      <button
        className="back"
        onClick={onBack}
      >

        <ChevronLeft size={16} />

        Destination

      </button>

      <div className="rec-head">

        <div>

          <p className="kicker">
            PERSONALIZED RECOMMENDATION
          </p>

          <h1>
            When should you go?
          </h1>

          <p className="location">

            <MapPin size={16} />

            {place.name}

          </p>

        </div>

        <button
          className="save"
          onClick={toggleSaved}
        >

          {saved
            ? <Check size={16} />
            : <Bookmark size={16} />}

          {saved
            ? "Saved"
            : "Save"}

        </button>

      </div>

      <div className="recommendation">

        <div className="rec-main">

          <div className="rec-star">
            <Star size={22} />
          </div>

          <div>

            <p className="mono gold-text">
              BEST WINDOW
            </p>

            <h2>
              {prediction
                ? new Date(
                    prediction.date + "T00:00:00"
                  ).toLocaleDateString("en-IN", {
                    weekday: "long"
                  })
                : "—"}
            </h2>

            <div className="big-time">
              {prediction
                ? prediction.time_window
                : "Generate a prediction"}
            </div>

            <p className="muted">

              {prediction
                ? `Predicted crowd: ${prediction.crowd_level}`
                : "Generate an AI prediction from the destination profile."}

            </p>

          </div>

        </div>

        <div className="rec-score">

          <span>

            {prediction
              ? prediction.predicted_footfall_index
              : "—"}

          </span>

          <small>
            /100
          </small>

          <p>
            crowd index
          </p>

        </div>

      </div>

      <div
        style={{
          marginTop: "24px",
          marginBottom: "24px"
        }}
      >

        <button
          className="gold-btn"
          onClick={onPredict}
          disabled={loading}
        >

          <Sparkles size={17} />

          {loading
            ? "Getting prediction..."
            : "Refresh AI Prediction"}

        </button>

      </div>

      <Label>
        Why this window
      </Label>

      <div className="reason-list">

        <Reason
          icon={<UsersRound />}
          title="Historical footfall"
          text="Historical tourism patterns are included in the ML prediction."
        />

        <Reason
          icon={<CloudSun />}
          title="Weather"
          text="Weather and rainfall signals are included in the analysis."
        />

        <Reason
          icon={<GraduationCap />}
          title="Local calendars"
          text="School and institutional holiday signals are considered."
        />

        <Reason
          icon={<PartyPopper />}
          title="Local events"
          text="Festival and local event signals are considered."
        />

        <Reason
          icon={<CarFront />}
          title="Transport"
          text="Public bus service information is available."
        />

      </div>

      <div className="actions-row">

        <button
  className="outline-btn"
  onClick={() => {
    console.log("Opening Compare page");
    onCompare();
  }}
>
  Compare all windows
</button>

        <button
          className="gold-btn"
          onClick={onPlan}
        >

          Plan this visit

          <ArrowRight size={17} />

        </button>

      </div>

    </main>
  );
}

// ==================================================
// REASON
// ==================================================

function Reason({
  icon,
  title,
  text
}) {

  return (

    <div className="reason">

      <div className="reason-icon">
        {icon}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

      <Check
        className="reason-check"
        size={17}
      />

    </div>
  );
}

// ==================================================
// COMPARE
// ==================================================

function Compare({
  prediction,
  onBack,
  onPlan
}) {
  const windows = prediction?.all_windows || [];

  return (
    <main className="inner">

      <button
        className="back"
        onClick={onBack}
      >
        <ChevronLeft size={16} />
        Recommendation
      </button>

      <p className="kicker">
        MICRO-WINDOW COMPARISON
      </p>

      <h1>
        Choose your window.
      </h1>

      <p className="muted">
        Compare the AI predictions for your selected date.
      </p>

      {windows.length > 0 ? (
        <>
          <div className="compare-table">

            <div className="table-row table-head">
              <span>TIME</span>
              <span>CROWD</span>
              <span>LEVEL</span>
            </div>

            {windows.map((slot) => {
              const isBest =
                slot.time_window === prediction.time_window;

              const level = slot.crowd_level || "—";

              return (
                <div
                  className={
                    isBest
                      ? "table-row best-row"
                      : "table-row"
                  }
                  key={slot.time_window}
                >
                  <span>
                    {slot.time_window}
                    {isBest && (
                      <b className="star-mark"> ★</b>
                    )}
                  </span>

                  <span
                    className={
                      level === "Very Low" || level === "Low"
                        ? "low"
                        : level === "High" || level === "Very High"
                        ? "high"
                        : "medium"
                    }
                  >
                    {slot.predicted_footfall_index}/100
                  </span>

                  <span>
                    {level}
                  </span>
                </div>
              );
            })}

          </div>

          <div className="compare-note">
            <Sparkles size={18} />

            <p>
              <b>
                Our pick: {prediction.date} · {prediction.time_window}
              </b>
              {" "}
              This is the time window with the lowest predicted
              crowd pressure among the four analyzed windows.
            </p>
          </div>

          <button
            className="gold-btn"
            onClick={onPlan}
          >
            Plan this window
            <ArrowRight size={17} />
          </button>
        </>
      ) : (
        <div
          className="compare-note"
          style={{ marginTop: "28px" }}
        >
          <Sparkles size={18} />

          <p>
            <b>No comparison data yet.</b>{" "}
            Please generate an AI prediction first.
          </p>
        </div>
      )}

    </main>
  );
}

// ==================================================
// PROFILE
// ==================================================

function Profile({
  user,
  saved,
  history,
  feedback,
  setFeedback,
  setPage,
  choosePlace
}) {

  const [
    showLogin,
    setShowLogin
  ] = useState(false);

  if (!user && showLogin) {
    return (
      <Login
        onDone={() => setShowLogin(false)}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  return (

    <main className="inner">

      <div className="profile-head">

        <div>

          <p className="kicker">
            YOUR TRAVEL MEMORY
          </p>

          <h1>

            {user
              ? `Welcome, ${user.name}.`
              : "Your travel, remembered."}

          </h1>

          <p className="muted">

            Save places, remember visits
            and make future recommendations
            more personal.

          </p>

        </div>

        {!user && (

          <button
            className="gold-btn"
            onClick={() =>
              setShowLogin(true)
            }
          >

            <LogIn size={16} />

            Sign in

          </button>

        )}

      </div>

      <div className="profile-grid">

        <div className="profile-card">

          <div className="card-title">

            <History size={18} />

            <h2>
              Recent visits
            </h2>

          </div>

          {history.length ? (

            history.map(
              (x, i) => (

                <div
                  className="history-item"
                  key={i}
                >

                  <span>
                    📍
                  </span>

                  <div>

                    <b>
                      {x.place}
                    </b>

                    <small>
                      {x.date}
                    </small>

                  </div>

                  <span className="pill">
                    {x.crowd}
                  </span>

                </div>
              )
            )

          ) : (

            <div className="empty">
              Your planned visits
              will appear here.
            </div>

          )}

        </div>

        <div className="profile-card">

          <div className="card-title">

            <Bookmark size={18} />

            <h2>
              Saved places
            </h2>

          </div>

          {saved.length ? (

            saved.map(
              (x) => (

                <button
                  className="saved-item"
                  key={x}
                  onClick={() => {

                    const place =
                      places.find(
                        (p) =>
                          p.name === x
                      );

                    if (place) {
                      choosePlace(place);
                    }

                  }}
                >

                  <span>
                    ✦
                  </span>

                  {x}

                  <ArrowRight
                    size={15}
                  />

                </button>

              )
            )

          ) : (

            <div className="empty">

              Save a destination
              to build your list.

            </div>

          )}

        </div>

      </div>

      {history.length > 0 && (

        <div className="feedback-card">

          <div>

            <p className="kicker">
              HELP IMPROVE THE MODEL
            </p>

            <h2>
              How crowded was your visit?
            </h2>

            <p className="muted">
              Your real experience can become
              another hyperlocal signal.
            </p>

          </div>

          <div className="feedback-buttons">

            {[
              "Low",
              "Medium",
              "High"
            ].map(
              (v) => (

                <button
                  className={
                    feedback === v
                      ? "feedback selected"
                      : "feedback"
                  }
                  onClick={() =>
                    setFeedback(v)
                  }
                  key={v}
                >
                  {v}
                </button>

              )
            )}

          </div>

        </div>

      )}

    </main>
  );
}

// ==================================================
// LOGIN
// ==================================================

function Login({
  onDone,
  onBack
}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      let credential;

      if (mode === "login") {
        credential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
      } else {
        credential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
      }

      onDone(credential.user);
    } catch (err) {
      console.error("Firebase authentication error:", err);

      const messages = {
        "auth/invalid-credential":
          "Incorrect email or password.",
        "auth/user-not-found":
          "No account found with this email.",
        "auth/wrong-password":
          "Incorrect password.",
        "auth/email-already-in-use":
          "An account already exists with this email.",
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/weak-password":
          "Password must be at least 6 characters.",
        "auth/network-request-failed":
          "Network error. Please check your internet connection."
      };

      setError(
        messages[err.code] ||
        "Authentication failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">

        {onBack && (
          <button
            className="back"
            onClick={onBack}
            type="button"
            style={{ marginBottom: "22px" }}
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}

        <p className="kicker">
          TIME2TRAVEL ACCOUNT
        </p>

        <h1>
          {mode === "login"
            ? "Welcome back."
            : "Create your account."}
        </h1>

        <p className="muted">
          {mode === "login"
            ? "Sign in to save places, remember visits and personalize your travel planning."
            : "Create an account to save places, remember visits and build your travel memory."}
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              required
              minLength={6}
            />
          </label>

          {error && (
            <p
              style={{
                color: "#B8860B",
                marginTop: "10px",
                fontSize: "14px"
              }}
            >
              {error}
            </p>
          )}

          <button
            className="gold-btn"
            type="submit"
            disabled={busy}
          >
            <LogIn size={17} />

            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}

            {!busy && (
              <ArrowRight size={17} />
            )}
          </button>

        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center"
          }}
        >
          <p className="muted">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>

          <button
            type="button"
            className="text-link"
            onClick={() => {
              setMode(
                mode === "login"
                  ? "signup"
                  : "login"
              );
              setError("");
            }}
          >
            {mode === "login"
              ? "Create an account"
              : "Sign in instead"}
          </button>
        </div>

        <div className="secure">
          <ShieldCheck size={15} />
          Authentication is securely handled by Firebase.
        </div>

      </div>
    </main>
  );
}

// ==================================================
// START
// ==================================================

createRoot(
  document.getElementById("root")
).render(
  <App />
);