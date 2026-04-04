import { useState, useEffect } from "react";
import {
  submitDailyWaterIntake,
  getTodayWaterIntake,
  updateUserProfile,
} from "../services/api";

const STORAGE_KEY = "healthai_dashboard";

const FOOD_DB = {
  // Rice & Grains
  rice: { cal: 206, unit: "1 cup" },
  "brown rice": { cal: 216, unit: "1 cup" },
  "fried rice": { cal: 320, unit: "1 cup" },
  biryani: { cal: 490, unit: "1 plate" },
  pulao: { cal: 350, unit: "1 plate" },
  khichdi: { cal: 270, unit: "1 bowl" },
  // Roti & Bread
  chapati: { cal: 104, unit: "1 piece" },
  roti: { cal: 104, unit: "1 piece" },
  paratha: { cal: 257, unit: "1 piece" },
  "aloo paratha": { cal: 310, unit: "1 piece" },
  puri: { cal: 130, unit: "1 piece" },
  naan: { cal: 317, unit: "1 piece" },
  bread: { cal: 79, unit: "1 slice" },
  "white bread": { cal: 79, unit: "1 slice" },
  "brown bread": { cal: 69, unit: "1 slice" },
  toast: { cal: 79, unit: "1 slice" },
  // South Indian
  idli: { cal: 58, unit: "1 piece" },
  dosa: { cal: 168, unit: "1 piece" },
  "masala dosa": { cal: 280, unit: "1 piece" },
  uttapam: { cal: 230, unit: "1 piece" },
  poha: { cal: 250, unit: "1 bowl" },
  upma: { cal: 190, unit: "1 bowl" },
  sambar: { cal: 97, unit: "1 bowl" },
  rasam: { cal: 45, unit: "1 bowl" },
  "coconut chutney": { cal: 80, unit: "2 tbsp" },
  "medu vada": { cal: 100, unit: "1 piece" },
  // Dal & Lentils
  dal: { cal: 198, unit: "1 bowl" },
  "toor dal": { cal: 190, unit: "1 bowl" },
  "moong dal": { cal: 180, unit: "1 bowl" },
  "masoor dal": { cal: 185, unit: "1 bowl" },
  "chana dal": { cal: 210, unit: "1 bowl" },
  rajma: { cal: 225, unit: "1 bowl" },
  chole: { cal: 210, unit: "1 bowl" },
  sprouts: { cal: 90, unit: "1 bowl" },
  // Curries & Sabzi
  "palak paneer": { cal: 280, unit: "1 bowl" },
  "paneer butter masala": { cal: 350, unit: "1 bowl" },
  paneer: { cal: 265, unit: "100g" },
  "aloo sabzi": { cal: 150, unit: "1 bowl" },
  "mixed veg": { cal: 130, unit: "1 bowl" },
  sabzi: { cal: 120, unit: "1 bowl" },
  "baingan bharta": { cal: 140, unit: "1 bowl" },
  "bhindi fry": { cal: 110, unit: "1 bowl" },
  "matar paneer": { cal: 260, unit: "1 bowl" },
  korma: { cal: 320, unit: "1 bowl" },
  // Non-Veg
  "chicken curry": { cal: 370, unit: "1 bowl" },
  chicken: { cal: 335, unit: "1 serving" },
  "grilled chicken": { cal: 240, unit: "1 serving" },
  "chicken biryani": { cal: 540, unit: "1 plate" },
  "chicken fry": { cal: 290, unit: "1 serving" },
  egg: { cal: 78, unit: "1 piece" },
  "boiled egg": { cal: 78, unit: "1 piece" },
  "fried egg": { cal: 110, unit: "1 piece" },
  omelette: { cal: 154, unit: "1 piece" },
  "egg curry": { cal: 220, unit: "1 bowl" },
  "fish curry": { cal: 280, unit: "1 bowl" },
  fish: { cal: 280, unit: "1 serving" },
  "fish fry": { cal: 220, unit: "1 serving" },
  "mutton curry": { cal: 420, unit: "1 bowl" },
  mutton: { cal: 380, unit: "1 serving" },
  "prawn curry": { cal: 260, unit: "1 bowl" },
  prawns: { cal: 200, unit: "1 serving" },
  // Snacks & Street Food
  samosa: { cal: 262, unit: "1 piece" },
  vada: { cal: 97, unit: "1 piece" },
  pakora: { cal: 120, unit: "4 pieces" },
  "bhel puri": { cal: 180, unit: "1 plate" },
  "pani puri": { cal: 150, unit: "6 pieces" },
  "dahi puri": { cal: 200, unit: "6 pieces" },
  "pav bhaji": { cal: 380, unit: "1 plate" },
  "vada pav": { cal: 290, unit: "1 piece" },
  sandwich: { cal: 250, unit: "1 piece" },
  burger: { cal: 354, unit: "1 piece" },
  pizza: { cal: 285, unit: "1 slice" },
  maggi: { cal: 310, unit: "1 pack" },
  noodles: { cal: 290, unit: "1 bowl" },
  pasta: { cal: 320, unit: "1 bowl" },
  "french fries": { cal: 365, unit: "1 medium" },
  chips: { cal: 150, unit: "1 small pack" },
  biscuit: { cal: 50, unit: "1 piece" },
  cake: { cal: 350, unit: "1 slice" },
  chocolate: { cal: 150, unit: "2 squares" },
  "ice cream": { cal: 207, unit: "1 scoop" },
  halwa: { cal: 350, unit: "1 bowl" },
  "gulab jamun": { cal: 150, unit: "1 piece" },
  jalebi: { cal: 150, unit: "2 pieces" },
  laddu: { cal: 180, unit: "1 piece" },
  barfi: { cal: 160, unit: "1 piece" },
  // Fruits
  banana: { cal: 89, unit: "1 piece" },
  apple: { cal: 72, unit: "1 piece" },
  orange: { cal: 62, unit: "1 piece" },
  mango: { cal: 99, unit: "1 piece" },
  grapes: { cal: 62, unit: "1 cup" },
  watermelon: { cal: 45, unit: "1 cup" },
  papaya: { cal: 55, unit: "1 cup" },
  guava: { cal: 68, unit: "1 piece" },
  pomegranate: { cal: 83, unit: "1 cup" },
  strawberry: { cal: 49, unit: "1 cup" },
  pineapple: { cal: 82, unit: "1 cup" },
  chickoo: { cal: 83, unit: "1 piece" },
  // Drinks
  water: { cal: 0, unit: "1 glass" },
  milk: { cal: 149, unit: "1 glass" },
  buttermilk: { cal: 40, unit: "1 glass" },
  lassi: { cal: 150, unit: "1 glass" },
  "sweet lassi": { cal: 250, unit: "1 glass" },
  curd: { cal: 98, unit: "1 cup" },
  tea: { cal: 30, unit: "1 cup" },
  "milk tea": { cal: 60, unit: "1 cup" },
  coffee: { cal: 37, unit: "1 cup" },
  "cold coffee": { cal: 180, unit: "1 glass" },
  juice: { cal: 110, unit: "1 glass" },
  "orange juice": { cal: 112, unit: "1 glass" },
  "coconut water": { cal: 46, unit: "1 glass" },
  "cold drink": { cal: 150, unit: "1 can" },
  "soft drink": { cal: 150, unit: "1 can" },
  "energy drink": { cal: 110, unit: "1 can" },
  "protein shake": { cal: 160, unit: "1 glass" },
  milkshake: { cal: 350, unit: "1 glass" },
  // Breakfast items
  oats: { cal: 307, unit: "1 bowl" },
  cornflakes: { cal: 357, unit: "1 bowl" },
  muesli: { cal: 350, unit: "1 bowl" },
  daliya: { cal: 220, unit: "1 bowl" },
  "peanut butter": { cal: 94, unit: "1 tbsp" },
  honey: { cal: 64, unit: "1 tbsp" },
  jam: { cal: 56, unit: "1 tbsp" },
  butter: { cal: 102, unit: "1 tbsp" },
  ghee: { cal: 135, unit: "1 tbsp" },
  "paneer sandwich": { cal: 320, unit: "1 piece" },
  // Healthy
  salad: { cal: 50, unit: "1 bowl" },
  "fruit salad": { cal: 120, unit: "1 bowl" },
  soup: { cal: 80, unit: "1 bowl" },
  "tomato soup": { cal: 90, unit: "1 bowl" },
  "corn soup": { cal: 120, unit: "1 bowl" },
  "boiled vegetables": { cal: 80, unit: "1 bowl" },
  cucumber: { cal: 16, unit: "1 cup" },
  carrot: { cal: 52, unit: "1 cup" },
  nuts: { cal: 180, unit: "1 handful" },
  almonds: { cal: 164, unit: "1 handful" },
  cashews: { cal: 157, unit: "1 handful" },
  walnuts: { cal: 185, unit: "1 handful" },
};

const GOALS_LIST = [
  { id: "exercise", label: "Exercise / Workout", icon: "🏋️" },
  { id: "meditation", label: "Meditation (10 mins)", icon: "🧘" },
  { id: "fruits", label: "Eat fruits today", icon: "🍎" },
  { id: "noJunk", label: "Avoid junk food", icon: "🚫" },
  { id: "sleep8", label: "Sleep 8 hours", icon: "😴" },
  { id: "steps", label: "10,000 steps completed", icon: "🚶" },
  { id: "reading", label: "Read / Learn something new", icon: "📚" },
  { id: "noSugar", label: "No sugar today", icon: "🍬" },
];

const WATER_GLASSES = 8;

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const d = JSON.parse(stored);
      // Reset if it's a new day
      const today = new Date().toDateString();
      if (d.date !== today) {
        return getDefault(today);
      }
      return d;
    }
  } catch {}
  return getDefault(new Date().toDateString());
};

const getDefault = (date) => ({
  date,
  foodLog: [],
  water: 0,
  goals: {},
  calorieGoal: 2000,
  weightGoal: "",
  goalType: "balanced", // weightloss, musclegain, balanced
});

const GOAL_CALORIE_MAP = {
  weightloss: 1500,
  musclegain: 2800,
  balanced: 2000,
};

export default function Dashboard({ user, navigate, onUserUpdate }) {
  const buildProfileForm = (profileUser = {}) => ({
    name: profileUser.name || "",
    email: profileUser.email || "",
    age: profileUser.age ?? "",
    gender: profileUser.gender || "",
    height: profileUser.height ?? "",
    weight: profileUser.weight ?? "",
    sleep: profileUser.sleep ?? "",
    exercise: profileUser.exercise ?? "",
    smoker: profileUser.smoker ?? 0,
    alcohol: profileUser.alcohol ?? "",
    diabetic: profileUser.diabetic ?? 0,
    heart_disease: profileUser.heart_disease ?? 0,
    goal: profileUser.goal || "",
    diet: profileUser.diet || "",
  });

  const [data, setData] = useState(loadData);
  const [foodInput, setFoodInput] = useState("");
  const [qty, setQty] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showFoodLog, setShowFoodLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(user));

  // Water Intake Submission
  const [todaySubmitted, setTodaySubmitted] = useState(null);
  const [submittingDaily, setSubmittingDaily] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setProfileForm(buildProfileForm(user));
  }, [user]);

  // Load today's submitted water intake
  useEffect(() => {
    const loadTodayData = async () => {
      try {
        const result = await getTodayWaterIntake();
        setTodaySubmitted(result.record);
      } catch (err) {
        console.log("Could not load today's data:", err);
        setTodaySubmitted(null);
      }
    };
    loadTodayData();
  }, []);

  // Food suggestions
  useEffect(() => {
    if (foodInput.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = foodInput.toLowerCase();
    const matches = Object.keys(FOOD_DB)
      .filter((f) => f.includes(q))
      .sort((a, b) => (a.startsWith(q) ? -1 : b.startsWith(q) ? 1 : 0))
      .slice(0, 8);
    setSuggestions(matches);
  }, [foodInput]);

  const totalCalories = data.foodLog.reduce((sum, f) => sum + f.calories, 0);
  const calorieGoal = GOAL_CALORIE_MAP[data.goalType] || 2000;
  const caloriePercent = Math.min(
    100,
    Math.round((totalCalories / calorieGoal) * 100),
  );
  const goalsCompleted = Object.values(data.goals).filter(Boolean).length;

  const addFood = (name) => {
    const food = FOOD_DB[name.toLowerCase()];
    if (!food) return;
    const item = {
      id: Date.now(),
      name: name,
      calories: Math.round(food.cal * qty),
      qty,
      unit: food.unit,
    };
    setData((prev) => ({ ...prev, foodLog: [...prev.foodLog, item] }));
    setFoodInput("");
    setQty(1);
    setSuggestions([]);
  };

  const removeFood = (id) => {
    setData((prev) => ({
      ...prev,
      foodLog: prev.foodLog.filter((f) => f.id !== id),
    }));
  };

  const toggleWater = (idx) => {
    setData((prev) => ({
      ...prev,
      water: prev.water === idx + 1 ? idx : idx + 1,
    }));
  };

  const toggleGoal = (id) => {
    setData((prev) => ({
      ...prev,
      goals: { ...prev.goals, [id]: !prev.goals[id] },
    }));
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      const result = await updateUserProfile(profileForm);
      if (onUserUpdate) {
        onUserUpdate(result.user);
      }
      alert("✅ Profile updated successfully!");
      setShowEditProfile(false);
    } catch (err) {
      console.log("Error updating profile:", err);
      alert("❌ Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit daily water + calories data
  const handleSubmitDaily = async () => {
    if (data.water === 0 && totalCalories === 0) {
      alert("Please log at least some food or water intake for the day");
      return;
    }

    try {
      setSubmittingDaily(true);
      await submitDailyWaterIntake({
        calories: totalCalories,
        glasses: data.water,
      });

      // Refresh today's data
      const todayResult = await getTodayWaterIntake();
      setTodaySubmitted(todayResult.record);

      // Reset for next day
      setData(getDefault(new Date().toDateString()));
      alert("✅ Daily data submitted successfully!");
    } catch (err) {
      console.log("Error submitting daily data:", err);
      alert("❌ Failed to submit daily data");
    } finally {
      setSubmittingDaily(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 className="page-title">
              {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowEditProfile(!showEditProfile)}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 16px",
                color: "var(--text2)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 16px",
                color: "var(--text2)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Panel */}
      {showEditProfile && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <span className="card-title">✏️ Edit Profile</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                value={profileForm.age}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                value={profileForm.gender}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Height</label>
              <input
                className="form-input"
                type="number"
                value={profileForm.height}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    height: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Weight</label>
              <input
                className="form-input"
                type="number"
                value={profileForm.weight}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    weight: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sleep (hours)</label>
              <input
                className="form-input"
                type="number"
                value={profileForm.sleep}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, sleep: e.target.value }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Exercise (minutes)</label>
              <input
                className="form-input"
                type="number"
                value={profileForm.exercise}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    exercise: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Smoker</label>
              <select
                className="form-input"
                value={profileForm.smoker}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    smoker: Number(e.target.value),
                  }))
                }
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alcohol</label>
              <input
                className="form-input"
                type="number"
                value={profileForm.alcohol}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    alcohol: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Diabetic</label>
              <select
                className="form-input"
                value={profileForm.diabetic}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    diabetic: Number(e.target.value),
                  }))
                }
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Heart Disease</label>
              <select
                className="form-input"
                value={profileForm.heart_disease}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    heart_disease: Number(e.target.value),
                  }))
                }
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Goal</label>
              <input
                className="form-input"
                value={profileForm.goal}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, goal: e.target.value }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Diet</label>
              <input
                className="form-input"
                value={profileForm.diet}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, diet: e.target.value }))
                }
              />
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleProfileSave}
            disabled={savingProfile}
            style={{ width: "auto", padding: "8px 20px", marginTop: "16px" }}
          >
            {savingProfile ? "Saving..." : "Save Profile →"}
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <span className="card-title">⚙️ Your Goals</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Goal Type</label>
              <select
                className="form-input"
                value={data.goalType}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, goalType: e.target.value }))
                }
              >
                <option value="weightloss">
                  ⚖️ Weight Loss (1500 kcal/day)
                </option>
                <option value="musclegain">
                  💪 Muscle Gain (2800 kcal/day)
                </option>
                <option value="balanced">🥗 Balanced (2000 kcal/day)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Weight (kg)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 65"
                value={data.weightGoal}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, weightGoal: e.target.value }))
                }
              />
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowSettings(false)}
            style={{ width: "auto", padding: "8px 20px", marginTop: "16px" }}
          >
            Save →
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            icon: "🔥",
            label: "Calories",
            value: `${totalCalories}`,
            sub: `/ ${calorieGoal} kcal`,
            color: totalCalories > calorieGoal ? "#ff6b6b" : "var(--accent)",
          },
          {
            icon: "💧",
            label: "Water",
            value: `${data.water}`,
            sub: `/ ${WATER_GLASSES} glasses`,
            color: "#48dbfb",
          },
          {
            icon: "🎯",
            label: "Goals Done",
            value: `${goalsCompleted}`,
            sub: `/ ${GOALS_LIST.length}`,
            color: "#ffd93d",
          },
          {
            icon: "🍽️",
            label: "Meals Logged",
            value: `${data.foodLog.length}`,
            sub: "items today",
            color: "#ff9ff3",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="card"
            style={{ padding: "18px", textAlign: "center" }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
              {s.icon}
            </div>
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: "1.6rem",
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>
              {s.sub}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text2)",
                marginTop: "2px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Calorie Tracker */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🍽️ Calorie Tracker</span>
              <button
                onClick={() => setShowFoodLog(!showFoodLog)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "3px 10px",
                  color: "var(--text2)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                }}
              >
                {showFoodLog ? "Hide Log" : `View Log (${data.foodLog.length})`}
              </button>
            </div>

            {/* Calorie Progress Bar */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "0.82rem", color: "var(--text2)" }}>
                  {totalCalories} / {calorieGoal} kcal
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: caloriePercent >= 100 ? "#ff6b6b" : "var(--accent)",
                  }}
                >
                  {caloriePercent}%
                </span>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${caloriePercent}%`,
                    background:
                      caloriePercent >= 100
                        ? "#ff6b6b"
                        : caloriePercent >= 75
                          ? "#ffd93d"
                          : "var(--accent)",
                    borderRadius: "10px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text3)",
                  marginTop: "4px",
                }}
              >
                {calorieGoal - totalCalories > 0
                  ? `${calorieGoal - totalCalories} kcal remaining`
                  : `${totalCalories - calorieGoal} kcal over goal`}
              </div>
            </div>

            {/* Food Input */}
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    className="form-input"
                    placeholder="Type food e.g. rice, chapati, egg..."
                    value={foodInput}
                    onChange={(e) => setFoodInput(e.target.value)}
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                      }}
                    >
                      {suggestions.map((s) => (
                        <div
                          key={s}
                          onClick={() => {
                            setFoodInput(s);
                            setSuggestions([]);
                          }}
                          style={{
                            padding: "8px 14px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            color: "var(--text2)",
                            borderBottom: "1px solid var(--border)",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background = "var(--bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "transparent")
                          }
                        >
                          {s} —{" "}
                          <span style={{ color: "var(--accent)" }}>
                            {FOOD_DB[s].cal} cal / {FOOD_DB[s].unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  className="form-input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={qty}
                  onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                  style={{
                    width: "60px",
                    marginBottom: 0,
                    textAlign: "center",
                  }}
                  title="Quantity"
                />
                <button
                  className="btn-primary"
                  onClick={() => addFood(foodInput)}
                  disabled={!FOOD_DB[foodInput?.toLowerCase()]}
                  style={{
                    width: "auto",
                    padding: "0 16px",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add
                </button>
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text3)",
                  marginTop: "4px",
                }}
              >
                {FOOD_DB[foodInput?.toLowerCase()]
                  ? `✓ ${Math.round(FOOD_DB[foodInput.toLowerCase()].cal * qty)} cal for ${qty}x ${FOOD_DB[foodInput.toLowerCase()].unit}`
                  : "Start typing to see suggestions"}
              </div>
            </div>

            {/* Food Log */}
            {showFoodLog && (
              <div
                style={{
                  marginTop: "12px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {data.foodLog.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text3)",
                      fontSize: "0.82rem",
                      padding: "12px",
                    }}
                  >
                    No food logged yet
                  </div>
                ) : (
                  data.foodLog.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "7px 0",
                        borderBottom: "1px solid var(--border)",
                        fontSize: "0.83rem",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text2)",
                          textTransform: "capitalize",
                        }}
                      >
                        {f.qty > 1 ? `${f.qty}x ` : ""}
                        {f.name}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{ color: "var(--accent)", fontWeight: 600 }}
                        >
                          {f.calories} cal
                        </span>
                        <button
                          onClick={() => removeFood(f.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text3)",
                            fontSize: "0.8rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {data.foodLog.length > 0 && (
                  <div
                    style={{
                      paddingTop: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "var(--text)" }}>Total</span>
                    <span style={{ color: "var(--accent)" }}>
                      {totalCalories} kcal
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Water Intake Tracker */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">💧 Water Intake</span>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#48dbfb",
                  fontWeight: 700,
                }}
              >
                {data.water} / {WATER_GLASSES} glasses
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: "8px 0",
              }}
            >
              {Array.from({ length: WATER_GLASSES }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => toggleWater(i)}
                  style={{
                    cursor: "pointer",
                    fontSize: "2rem",
                    transition: "transform 0.15s",
                    filter:
                      i < data.water ? "none" : "grayscale(1) opacity(0.3)",
                    transform: i < data.water ? "scale(1.1)" : "scale(1)",
                  }}
                  title={`Glass ${i + 1}`}
                >
                  💧
                </div>
              ))}
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "0.78rem",
                color: "var(--text3)",
                marginTop: "6px",
              }}
            >
              {data.water === 0 && "Click to log each glass of water"}
              {data.water > 0 &&
                data.water < 8 &&
                `${8 - data.water} more glasses to reach your goal!`}
              {data.water >= 8 && "🎉 Daily water goal achieved!"}
            </div>
          </div>

          {/* Daily Submit */}
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(72,219,251,0.1) 100%)",
            }}
          >
            <div className="card-header">
              <span className="card-title">📤 End of Day Submission</span>
            </div>

            <div style={{ padding: "0 0 12px 0" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text3)",
                      marginBottom: "4px",
                    }}
                  >
                    Today's Calories
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: "var(--accent)",
                    }}
                  >
                    {totalCalories}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>
                    kcal
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text3)",
                      marginBottom: "4px",
                    }}
                  >
                    Water Glasses
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: "#48dbfb",
                    }}
                  >
                    {data.water}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>
                    glasses
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleSubmitDaily}
                disabled={
                  submittingDaily || (data.water === 0 && totalCalories === 0)
                }
                style={{ width: "100%", marginBottom: "8px", fontWeight: 700 }}
              >
                {submittingDaily ? "Submitting..." : "🎯 Submit Daily Data"}
              </button>
            </div>

            {/* Today's Submitted Status */}
            {todaySubmitted && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--accent)",
                  }}
                >
                  ✅ Today's Data (Already Submitted)
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text2)" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <span>Calories:</span>
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {todaySubmitted.data[0]} kcal
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <span>Water:</span>
                    <span style={{ fontWeight: 700, color: "#48dbfb" }}>
                      {todaySubmitted.data[1]} glasses
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Daily Goals */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎯 Today's Goals</span>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                {goalsCompleted}/{GOALS_LIST.length} done
              </span>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  height: "6px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "10px",
                    background: "var(--accent)",
                    width: `${(goalsCompleted / GOALS_LIST.length) * 100}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {GOALS_LIST.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  marginBottom: "6px",
                  background: data.goals[goal.id]
                    ? "rgba(0,212,170,0.08)"
                    : "var(--bg)",
                  border: `1px solid ${data.goals[goal.id] ? "rgba(0,212,170,0.25)" : "var(--border)"}`,
                  transition: "all 0.2s",
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    border: `2px solid ${data.goals[goal.id] ? "var(--accent)" : "var(--border)"}`,
                    background: data.goals[goal.id]
                      ? "var(--accent)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {data.goals[goal.id] ? "✓" : ""}
                </div>
                <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>
                  {goal.icon}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    flex: 1,
                    color: data.goals[goal.id] ? "var(--text)" : "var(--text2)",
                    textDecoration: data.goals[goal.id] ? "none" : "none",
                    fontWeight: data.goals[goal.id] ? 600 : 400,
                  }}
                >
                  {goal.label}
                </span>
              </div>
            ))}

            {goalsCompleted === GOALS_LIST.length && (
              <div
                style={{
                  textAlign: "center",
                  padding: "12px",
                  marginTop: "8px",
                  background: "rgba(0,212,170,0.08)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--accent)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                🎉 All goals completed! Amazing day!
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚡ Quick Actions</span>
            </div>
            <div className="quick-action-grid">
              {[
                { icon: "🩺", label: "Check Symptoms", page: "symptoms" },
                { icon: "🤖", label: "Ask AI", page: "chatbot" },
                { icon: "🥗", label: "Diet Plan", page: "diet" },
                { icon: "👨‍⚕️", label: "Find Doctor", page: "doctors" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="quick-action"
                  onClick={() => navigate(a.page)}
                >
                  <div className="qa-icon">{a.icon}</div>
                  <div className="qa-label">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
