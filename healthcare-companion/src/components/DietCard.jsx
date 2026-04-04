export default function DietCard({ diet }) {
  return (
    <div className="diet-card">
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

        {diet.description && (
          <p style={{
            fontSize: "0.82rem",
            color: "var(--text2)",
            lineHeight: "1.5",
            marginBottom: "12px"
          }}>
            {diet.description}
          </p>
        )}

        <div className="diet-tags">
          {diet.tags?.map((tag, i) => (
            <span key={i} className="diet-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}