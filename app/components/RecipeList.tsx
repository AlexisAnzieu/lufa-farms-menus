import data from "./data_michelin.json";

const RecipeCard = ({ recipe }) => (
  <div className="max-w-sm rounded overflow-hidden shadow-lg m-4">
    <div className="px-6 py-4">
      <div className="font-bold text-xl mb-2">{recipe.title}</div>
      <p className="text-base">{recipe.description}</p>
    </div>
    <div className="px-6 pt-4 pb-2">
      <h3 className="font-bold text-lg">Ingredients:</h3>
      <ul className="list-disc list-inside">
        {recipe.ingredients.map((ingredient, index) => (
          <a
            href={
              ingredient.id
                ? `https://montreal.lufa.com/fr/marche/produit/aaa-${ingredient.id}`
                : `https://montreal.lufa.com/fr/marche/recherche/${ingredient.name}`
            }
            key={index}
          >
            <li>
              {ingredient.quantity} {ingredient.unit} {ingredient.name}
            </li>
          </a>
        ))}
      </ul>
    </div>
    <div className="px-6 pt-4 pb-2">
      <h3 className="font-bold text-lg">Instructions:</h3>
      <ol className="list-decimal list-inside">
        {recipe.instructions.map((instruction, index) => (
          <li key={index}>
            {instruction.description} ({instruction.cooking_time})
          </li>
        ))}
      </ol>
    </div>
    <div className="px-6 pt-4 pb-2">
      <p>
        <strong>Cooking Time:</strong> {recipe.cooking_time}
      </p>
      <p>
        <strong>Preparation Time:</strong> {recipe.preparation_time}
      </p>
      <p>
        <strong>Serving Size:</strong> {recipe.serving_size}
      </p>
      <p>
        <strong>Difficulty:</strong> {recipe.difficulty}
      </p>
      <p>
        <strong>Cuisine:</strong> {recipe.cuisine}
      </p>
      <p>
        <strong>Tags:</strong> {recipe.tags.join(", ")}
      </p>
      <p>
        <strong>Notes:</strong> {recipe.notes}
      </p>
    </div>
  </div>
);

const RecipeList = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {data.map((recipe, index) => (
      <RecipeCard key={index} recipe={recipe} />
    ))}
  </div>
);

export default RecipeList;
