import OpenAI from "openai";

export const maxDuration = 60;

interface Product {
  p_id: string;
  gift: string;
  alcohol: string;
  portion_in_biso: string;
  is_organic: string;
  is_organic_USDA: string;
  is_scs_certified: string;
  b_con: string;
  vis: string;
  price: string;
  units: string;
  unit: string;
  super_featured: string;
  is_trial_product: string;
  is_free_tote: string;
  nutrional_status_published: null | string;
  p_name: string;
  sub_na: string;
  cat_na: string;
  s_name: string;
  s_id: string;
  image_url: string;
  attr: null | string;
  current_price: string;
  weight: string;
  c_wei: string;
  rinse: string;
  group_type: string;
  category_id: string;
  subcategory_id: string;
  avg_r: string;
  c_cou: string;
  avg_p_p: string;
  avg_p_p_r: string;
  avg_p_q: string;
  avg_p_u: string;
  nbr_in_basket: string;
  inBasket: string;
  sub_products: null | string;
  default_quantity: null | string;
  bool_is_in_recipe: string;
  image_urls: {
    resized_240x160: string;
    resized_690x430: string;
  };
  show_ind: number;
  is_regular: boolean;
  ruptured: number;
}

const UNDESIRED_CATEGORIES = [
  "Prêt-à-manger",
  "Non comestible",
  "Nourriture pour animaux",
  "Cadeau",
];

export async function GET(request: Request) {
  const response = await fetch(
    "https://montreal.lufa.com/fr/superMarket/getAllProducts",
    { cache: "no-store" }
  );
  const { products } = (await response.json()) as {
    products: Product[];
  };

  const filteredProducts = Object.values(products)
    .filter((p) => !p.ruptured && !UNDESIRED_CATEGORIES.includes(p.cat_na))
    .map((product) => ({
      id: product.p_id,
      name: product.p_name,
      price: product.current_price,
      imageUrl: product.image_url,
      weight: product.weight,
      unit: product.unit,
    }));

  console.log("Nombre de produits dispo:", filteredProducts.length);

  const productNames = filteredProducts
    .map((product) => product.name)
    // .slice(0, 10)
    .join("/");

  const responseSchema = {
    name: "recipes",
    additionalProperties: false,
    required: ["recipes"],
    type: "object",
    properties: {
      recipes: {
        type: "array",
        items: {
          additionalProperties: false,
          required: [
            "title",
            "description",
            "ingredients",
            "instructions",
            "serving_size",
            "cuisine",
            "tags",
            "notes",
          ],
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            ingredients: {
              type: "array",
              items: {
                required: ["name", "quantity", "unit"],
                additionalProperties: false,
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  quantity: {
                    type: "number",
                  },
                  unit: {
                    type: "string",
                  },
                },
              },
            },
            instructions: {
              type: "array",
              items: {
                required: ["step", "description", "cooking_time"],
                additionalProperties: false,
                type: "object",
                properties: {
                  step: {
                    type: "number",
                  },
                  description: {
                    type: "string",
                  },
                  cooking_time: {
                    type: "string",
                  },
                },
              },
            },
            serving_size: {
              type: "number",
            },
            cuisine: {
              type: "string",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
            },
            notes: {
              type: "string",
            },
          },
        },
      },
    },
  };
  const client = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
  });

  const result = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Vous êtes un chef personnel, et votre tâche est de créer de délicieuses recettes de plats en utilisant uniquement les ingrédients listés par l'utilisateur. Fournissez des instructions claires, étape par étape, incluant les temps de préparation et de cuisson. Les plats doivent etre rafinés avec budget illimité",
      },
      {
        role: "user",
        content: `Suggère exactement 5 délicieuses recettes de plat pour vegetarien et exactement 3 recettes de plat à base de poisson. Ces recettes doivent exclusivement être composée à partir de ces ingrédients là: ${productNames}. Donne leur un nom de plat élaboré digne des grands restaurants.`,
      },
    ],
    model: "gpt-4o-mini",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recipes",
        strict: true,
        schema: responseSchema,
      },
    },
  });
  const recipesPrompt = JSON.parse(result.choices[0].message.content || "");

  const enrichedRecipes = recipesPrompt?.recipes.map((recipe: any) => ({
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient: any) => ({
      ...ingredient,
      id: filteredProducts.find((p) => p.name === ingredient.name)?.id,
    })),
  }));

  return new Response(JSON.stringify(enrichedRecipes), {
    headers: { "Content-Type": "application/json" },
  });
}
