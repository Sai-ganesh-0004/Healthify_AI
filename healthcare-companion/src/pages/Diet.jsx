import { useState, useEffect } from "react";

const MEAL_PLANS = {
  veg: {
    weightloss: [
      { meal_type: "Breakfast", name: "Oats & Berry Bowl", calories: 280, protein: "10g", carbs: "42g", fat: "6g", tags: ["Low Cal", "High Fiber", "Antioxidant"] },
      { meal_type: "Mid Morning", name: "Green Apple + Almonds", calories: 150, protein: "4g", carbs: "18g", fat: "7g", tags: ["Low Sugar", "Healthy Fats"] },
      { meal_type: "Lunch", name: "Paneer Salad & Brown Rice", calories: 380, protein: "22g", carbs: "48g", fat: "10g", tags: ["High Protein", "Low Cal"] },
      { meal_type: "Evening Snack", name: "Cucumber & Hummus", calories: 120, protein: "5g", carbs: "14g", fat: "5g", tags: ["Low Cal", "Filling"] },
      { meal_type: "Dinner", name: "Moong Dal & Steamed Veggies", calories: 320, protein: "18g", carbs: "42g", fat: "6g", tags: ["Low Cal", "High Fiber"] },
      { meal_type: "Before Bed", name: "Warm Lemon Water", calories: 10, protein: "0g", carbs: "2g", fat: "0g", tags: ["Detox", "Hydrating"] },
    ],
    musclegain: [
      { meal_type: "Breakfast", name: "Paneer Bhurji & Wheat Toast", calories: 520, protein: "32g", carbs: "48g", fat: "18g", tags: ["High Protein", "Energy"] },
      { meal_type: "Mid Morning", name: "Banana & Peanut Butter", calories: 320, protein: "10g", carbs: "42g", fat: "14g", tags: ["Pre-Workout", "Energy Boost"] },
      { meal_type: "Lunch", name: "Rajma Rice Bowl", calories: 680, protein: "32g", carbs: "88g", fat: "12g", tags: ["High Protein", "Muscle Building"] },
      { meal_type: "Evening Snack", name: "Soya Protein Smoothie", calories: 280, protein: "28g", carbs: "32g", fat: "4g", tags: ["Post-Workout", "Recovery"] },
      { meal_type: "Dinner", name: "Paneer Curry & Brown Rice", calories: 620, protein: "34g", carbs: "68g", fat: "16g", tags: ["Balanced", "High Protein"] },
      { meal_type: "Before Bed", name: "Warm Turmeric Milk", calories: 180, protein: "8g", carbs: "14g", fat: "8g", tags: ["Recovery", "Anti-inflammatory"] },
    ],
    diabetes: [
      { meal_type: "Breakfast", name: "Ragi Porridge", calories: 220, protein: "8g", carbs: "38g", fat: "4g", tags: ["Low GI", "Fiber Rich"] },
      { meal_type: "Mid Morning", name: "Guava + Walnuts", calories: 140, protein: "3g", carbs: "16g", fat: "8g", tags: ["Low Sugar", "Healthy Fats"] },
      { meal_type: "Lunch", name: "Brown Rice & Chana Dal", calories: 420, protein: "18g", carbs: "62g", fat: "8g", tags: ["Low GI", "High Fiber"] },
      { meal_type: "Evening Snack", name: "Sprouts Salad", calories: 120, protein: "8g", carbs: "16g", fat: "2g", tags: ["Low Sugar", "Protein Rich"] },
      { meal_type: "Dinner", name: "Vegetable Soup & Chapati", calories: 380, protein: "14g", carbs: "52g", fat: "8g", tags: ["Low GI", "Balanced"] },
      { meal_type: "Before Bed", name: "Fenugreek Water", calories: 5, protein: "0g", carbs: "1g", fat: "0g", tags: ["Blood Sugar Control"] },
    ],
    hearthealth: [
      { meal_type: "Breakfast", name: "Oats with Flaxseeds", calories: 300, protein: "10g", carbs: "48g", fat: "8g", tags: ["Omega-3", "Heart Healthy"] },
      { meal_type: "Mid Morning", name: "Orange + Almonds", calories: 160, protein: "5g", carbs: "20g", fat: "8g", tags: ["Vitamin C", "Healthy Fats"] },
      { meal_type: "Lunch", name: "Quinoa & Tofu Bowl", calories: 480, protein: "28g", carbs: "52g", fat: "14g", tags: ["Omega-3", "Low Sodium"] },
      { meal_type: "Evening Snack", name: "Green Tea + Berries", calories: 80, protein: "1g", carbs: "18g", fat: "0g", tags: ["Antioxidant", "Heart Healthy"] },
      { meal_type: "Dinner", name: "Grilled Veggies & Lentils", calories: 380, protein: "20g", carbs: "48g", fat: "8g", tags: ["Low Fat", "High Fiber"] },
      { meal_type: "Before Bed", name: "Warm Honey Water", calories: 60, protein: "0g", carbs: "16g", fat: "0g", tags: ["Calming", "Sleep Aid"] },
    ],
    balanced: [
      { meal_type: "Breakfast", name: "Idli & Sambar", calories: 320, protein: "12g", carbs: "52g", fat: "6g", tags: ["Balanced", "Probiotic"] },
      { meal_type: "Mid Morning", name: "Mixed Fruit Bowl", calories: 180, protein: "3g", carbs: "42g", fat: "1g", tags: ["Vitamins", "Energy"] },
      { meal_type: "Lunch", name: "Dal Rice & Sabzi", calories: 520, protein: "22g", carbs: "78g", fat: "10g", tags: ["Balanced", "Fiber Rich"] },
      { meal_type: "Evening Snack", name: "Masala Buttermilk", calories: 80, protein: "4g", carbs: "8g", fat: "2g", tags: ["Probiotic", "Cooling"] },
      { meal_type: "Dinner", name: "Chapati & Paneer Curry", calories: 480, protein: "24g", carbs: "56g", fat: "14g", tags: ["Balanced", "Calcium Rich"] },
      { meal_type: "Before Bed", name: "Warm Turmeric Milk", calories: 110, protein: "5g", carbs: "12g", fat: "4g", tags: ["Anti-inflammatory", "Sleep Aid"] },
    ],
  },
  nonveg: {
    weightloss: [
      { meal_type: "Breakfast", name: "Boiled Eggs & Oats", calories: 300, protein: "18g", carbs: "38g", fat: "8g", tags: ["High Protein", "Low Cal"] },
      { meal_type: "Mid Morning", name: "Greek Yogurt + Berries", calories: 160, protein: "12g", carbs: "18g", fat: "4g", tags: ["Probiotic", "Low Cal"] },
      { meal_type: "Lunch", name: "Grilled Chicken Salad", calories: 380, protein: "38g", carbs: "15g", fat: "12g", tags: ["High Protein", "Low Carb"] },
      { meal_type: "Evening Snack", name: "Tuna & Crackers", calories: 140, protein: "16g", carbs: "12g", fat: "4g", tags: ["Low Cal", "High Protein"] },
      { meal_type: "Dinner", name: "Steamed Fish & Veggies", calories: 350, protein: "32g", carbs: "20g", fat: "8g", tags: ["Lean Protein", "Low Carb"] },
      { meal_type: "Before Bed", name: "Warm Lemon Water", calories: 10, protein: "0g", carbs: "2g", fat: "0g", tags: ["Detox", "Hydrating"] },
    ],
    musclegain: [
      { meal_type: "Breakfast", name: "Eggs & Whole Wheat Toast", calories: 520, protein: "32g", carbs: "48g", fat: "18g", tags: ["High Protein", "Energy"] },
      { meal_type: "Mid Morning", name: "Chicken Sandwich", calories: 380, protein: "28g", carbs: "38g", fat: "10g", tags: ["Pre-Workout", "High Protein"] },
      { meal_type: "Lunch", name: "Chicken Rice Bowl", calories: 680, protein: "48g", carbs: "72g", fat: "14g", tags: ["High Protein", "Muscle Building"] },
      { meal_type: "Evening Snack", name: "Whey Protein Smoothie", calories: 280, protein: "32g", carbs: "28g", fat: "4g", tags: ["Post-Workout", "Recovery"] },
      { meal_type: "Dinner", name: "Grilled Fish & Brown Rice", calories: 580, protein: "42g", carbs: "58g", fat: "12g", tags: ["High Protein", "Omega-3"] },
      { meal_type: "Before Bed", name: "Warm Turmeric Milk", calories: 180, protein: "8g", carbs: "14g", fat: "8g", tags: ["Recovery", "Anti-inflammatory"] },
    ],
    diabetes: [
      { meal_type: "Breakfast", name: "Egg White Omelette", calories: 200, protein: "16g", carbs: "8g", fat: "6g", tags: ["Low GI", "High Protein"] },
      { meal_type: "Mid Morning", name: "Guava + Walnuts", calories: 140, protein: "3g", carbs: "16g", fat: "8g", tags: ["Low Sugar", "Healthy Fats"] },
      { meal_type: "Lunch", name: "Grilled Chicken & Brown Rice", calories: 420, protein: "32g", carbs: "48g", fat: "8g", tags: ["Low GI", "High Protein"] },
      { meal_type: "Evening Snack", name: "Boiled Egg & Cucumber", calories: 120, protein: "8g", carbs: "6g", fat: "6g", tags: ["Low Sugar", "Protein Rich"] },
      { meal_type: "Dinner", name: "Fish Curry & Chapati", calories: 420, protein: "28g", carbs: "48g", fat: "10g", tags: ["Low GI", "Omega-3"] },
      { meal_type: "Before Bed", name: "Fenugreek Water", calories: 5, protein: "0g", carbs: "1g", fat: "0g", tags: ["Blood Sugar Control"] },
    ],
    hearthealth: [
      { meal_type: "Breakfast", name: "Oats & Egg White Bowl", calories: 320, protein: "18g", carbs: "42g", fat: "6g", tags: ["Heart Healthy", "High Protein"] },
      { meal_type: "Mid Morning", name: "Orange + Walnuts", calories: 160, protein: "4g", carbs: "20g", fat: "9g", tags: ["Vitamin C", "Omega-3"] },
      { meal_type: "Lunch", name: "Salmon & Quinoa Bowl", calories: 480, protein: "38g", carbs: "38g", fat: "14g", tags: ["Omega-3", "Heart Healthy"] },
      { meal_type: "Evening Snack", name: "Green Tea + Berries", calories: 80, protein: "1g", carbs: "18g", fat: "0g", tags: ["Antioxidant", "Heart Healthy"] },
      { meal_type: "Dinner", name: "Grilled Fish & Veggies", calories: 380, protein: "32g", carbs: "22g", fat: "10g", tags: ["Low Fat", "Omega-3"] },
      { meal_type: "Before Bed", name: "Warm Honey Water", calories: 60, protein: "0g", carbs: "16g", fat: "0g", tags: ["Calming", "Sleep Aid"] },
    ],
    balanced: [
      { meal_type: "Breakfast", name: "Eggs & Idli Sambar", calories: 420, protein: "22g", carbs: "52g", fat: "12g", tags: ["Balanced", "High Protein"] },
      { meal_type: "Mid Morning", name: "Mixed Fruit Bowl", calories: 180, protein: "3g", carbs: "42g", fat: "1g", tags: ["Vitamins", "Energy"] },
      { meal_type: "Lunch", name: "Chicken Dal Rice", calories: 580, protein: "38g", carbs: "68g", fat: "12g", tags: ["Balanced", "High Protein"] },
      { meal_type: "Evening Snack", name: "Boiled Egg & Tea", calories: 100, protein: "8g", carbs: "6g", fat: "5g", tags: ["Protein Boost", "Energy"] },
      { meal_type: "Dinner", name: "Fish Curry & Chapati", calories: 500, protein: "34g", carbs: "52g", fat: "14g", tags: ["Balanced", "Omega-3"] },
      { meal_type: "Before Bed", name: "Warm Turmeric Milk", calories: 110, protein: "5g", carbs: "12g", fat: "4g", tags: ["Anti-inflammatory", "Sleep Aid"] },
    ],
  },
};

const GOAL_INFO = {
  weightloss:  { label: "Weight Loss",   icon: "⚖️", color: "#ff6b6b" },
  musclegain:  { label: "Muscle Gain",   icon: "💪", color: "#00d4aa" },
  diabetes:    { label: "Diabetes Care", icon: "🩸", color: "#ffd93d" },
  hearthealth: { label: "Heart Health",  icon: "❤️", color: "#ff9ff3" },
  balanced:    { label: "Balanced Diet", icon: "🥗", color: "#48dbfb" },
};

export default function Diet() {
  const [goal, setGoal]         = useState("balanced");
  const [dietType, setDietType] = useState("veg");
  const [diets, setDiets]       = useState(MEAL_PLANS.veg.balanced);
  const [loading, setLoading]   = useState(false);
  const [totalCal, setTotalCal] = useState(0);
  const [profile, setProfile]   = useState({ age: "", weight: "", height: "", gender: "Male" });
  const [bmi, setBmi]           = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const total = diets.reduce((sum, d) => sum + (d.calories || 0), 0);
    setTotalCal(total);
  }, [diets]);

  const updatePlan = (newGoal, newDietType) => {
    setLoading(true);
    setTimeout(() => {
      setDiets(MEAL_PLANS[newDietType][newGoal]);
      setLoading(false);
    }, 400);
  };

  const handleGoalChange = (newGoal) => {
    setGoal(newGoal);
    updatePlan(newGoal, dietType);
  };

  const handleDietTypeChange = (newType) => {
    setDietType(newType);
    updatePlan(goal, newType);
  };

  const calculateBMI = () => {
    const { weight, height } = profile;
    if (!weight || !height) return;
    const heightM = parseFloat(height) / 100;
    const bmiVal  = (parseFloat(weight) / (heightM * heightM)).toFixed(1);
    setBmi(bmiVal);
    if (bmiVal < 18.5)      handleGoalChange("musclegain");
    else if (bmiVal > 25)   handleGoalChange("weightloss");
    else                    handleGoalChange("balanced");
  };

  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return { label: "Underweight", color: "#ffd93d" };
    if (bmi < 25)   return { label: "Normal",      color: "#00d4aa" };
    if (bmi < 30)   return { label: "Overweight",  color: "#ff9ff3" };
    return              { label: "Obese",          color: "#ff6b6b" };
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">🥗 Diet & Nutrition</h1>
            <p className="page-subtitle">Personalized meal plan based on your diet type and health goal</p>
          </div>
          <div className="card" style={{ padding: "16px 24px", minWidth: "180px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Daily Calories</div>
            <div style={{ fontFamily: "Syne", fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>{totalCal}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text2)" }}>kcal planned</div>
          </div>
        </div>
      </div>

      {/* Veg / Non-Veg Toggle */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <span className="card-title">🍽️ Diet Preference</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => handleDietTypeChange("veg")} style={{
            flex: 1, padding: "14px", borderRadius: "var(--radius-sm)", cursor: "pointer",
            background: dietType === "veg" ? "rgba(0,212,170,0.1)" : "var(--bg)",
            border: dietType === "veg" ? "2px solid var(--accent)" : "1px solid var(--border)",
            color: dietType === "veg" ? "var(--accent)" : "var(--text2)",
            fontFamily: "Syne", fontWeight: dietType === "veg" ? 700 : 400,
            fontSize: "1rem", transition: "all 0.2s",
          }}>
            🥦 Vegetarian
          </button>
          <button onClick={() => handleDietTypeChange("nonveg")} style={{
            flex: 1, padding: "14px", borderRadius: "var(--radius-sm)", cursor: "pointer",
            background: dietType === "nonveg" ? "rgba(255,107,107,0.1)" : "var(--bg)",
            border: dietType === "nonveg" ? "2px solid #ff6b6b" : "1px solid var(--border)",
            color: dietType === "nonveg" ? "#ff6b6b" : "var(--text2)",
            fontFamily: "Syne", fontWeight: dietType === "nonveg" ? 700 : 400,
            fontSize: "1rem", transition: "all 0.2s",
          }}>
            🍗 Non-Vegetarian
          </button>
        </div>
      </div>

      {/* BMI Calculator */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <span className="card-title">📊 BMI Calculator</span>
          <button onClick={() => setShowProfile(!showProfile)} style={{
            background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
            padding: "4px 12px", color: "var(--text2)", cursor: "pointer", fontSize: "0.8rem",
          }}>
            {showProfile ? "Hide" : "Calculate BMI"}
          </button>
        </div>
        {showProfile && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Age</label>
                <input className="form-input" type="number" placeholder="e.g. 25"
                  value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" placeholder="e.g. 65"
                  value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" placeholder="e.g. 165"
                  value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender</label>
                <select className="form-input" value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={calculateBMI} style={{ width: "auto", padding: "10px 24px" }}>
              Calculate BMI & Get Plan →
            </button>
            {bmi && (
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "16px",
                background: "var(--bg)", padding: "14px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "Syne", fontSize: "2rem", fontWeight: 800, color: getBmiStatus(bmi).color }}>{bmi}</div>
                <div>
                  <div style={{ fontWeight: 600, color: getBmiStatus(bmi).color }}>{getBmiStatus(bmi).label}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>
                    Plan updated: {GOAL_INFO[goal]?.icon} {GOAL_INFO[goal]?.label} • {dietType === "veg" ? "🥦 Vegetarian" : "🍗 Non-Veg"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goal Selector */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <span className="card-title">🎯 Select Your Health Goal</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {Object.entries(GOAL_INFO).map(([key, info]) => (
            <button key={key} onClick={() => handleGoalChange(key)} style={{
              background: goal === key ? `${info.color}22` : "var(--bg)",
              border: `1px solid ${goal === key ? info.color : "var(--border)"}`,
              borderRadius: "var(--radius-sm)", padding: "10px 18px",
              color: goal === key ? info.color : "var(--text2)",
              cursor: "pointer", fontFamily: "Syne", fontWeight: goal === key ? 700 : 400,
              fontSize: "0.85rem", transition: "all 0.2s",
            }}>
              {info.icon} {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nutrition Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Calories", value: `${totalCal} kcal`, icon: "🔥", color: "#ff6b6b" },
          { label: "Protein",  value: `${diets.reduce((s, d) => s + parseInt(d.protein), 0)}g`, icon: "💪", color: "#00d4aa" },
          { label: "Carbs",    value: `${diets.reduce((s, d) => s + parseInt(d.carbs), 0)}g`,   icon: "🌾", color: "#ffd93d" },
          { label: "Fat",      value: `${diets.reduce((s, d) => s + parseInt(d.fat), 0)}g`,     icon: "🥑", color: "#48dbfb" },
          { label: "Meals",    value: `${diets.length} meals`,                                   icon: "🍽️", color: "#ff9ff3" },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{stat.icon}</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1rem", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Meal Cards */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-text">Updating your meal plan...</div>
        </div>
      ) : (
        <div className="diet-grid">
          {diets.map((diet, i) => (
            <div key={i} className="diet-card">
              <div className="diet-card-header">
                <div className="diet-meal-type">{diet.meal_type}</div>
                <div className="diet-meal-name">{diet.name}</div>
              </div>
              <div className="diet-card-body">
                <div className="diet-nutrients">
                  <div className="nutrient">
                    <div className="nutrient-value">{diet.calories}</div>
                    <div className="nutrient-label">Cal</div>
                  </div>
                  <div className="nutrient">
                    <div className="nutrient-value">{diet.protein}</div>
                    <div className="nutrient-label">Protein</div>
                  </div>
                  <div className="nutrient">
                    <div className="nutrient-value">{diet.carbs}</div>
                    <div className="nutrient-label">Carbs</div>
                  </div>
                  <div className="nutrient">
                    <div className="nutrient-value">{diet.fat}</div>
                    <div className="nutrient-label">Fat</div>
                  </div>
                </div>
                <div className="diet-tags">
                  {diet.tags?.map((tag, j) => (
                    <span key={j} className="diet-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}