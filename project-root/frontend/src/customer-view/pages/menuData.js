export const menuCategories = [
  {
    id: 1,
    name: "Healthy Breakfasts & Millets",
    icon: "fa-leaf",
    items: [
      { 
        id: 1, 
        name: "OATS VEGETABLE UPMA", 
        price: 180, 
        discount: 15, 
        image: "https://recipes.timesofindia.com/thumb/59367960.cms?imgsize=3230319&width=800&height=800", 
        description: "Wholesome and fiber-rich breakfast made with rolled oats, fresh veggies, and minimal oil.",
        recipeDetails: {
          benefits: ["Great for digestion", "Weight loss friendly", "Diabetic care"],
          prepTime: "10 minutes",
          cookTime: "15 minutes",
          servings: "2-3 servings",
          ingredients: [
            "Rolled oats – 1 cup",
            "Water – 2 cups",
            "Mixed vegetables (carrot, beans, peas, capsicum) – 1 cup (finely chopped)",
            "Onion – 1 small (finely chopped)",
            "Green chili – 1 (chopped)",
            "Ginger – ½ inch piece (grated)",
            "Mustard seeds – ½ tsp",
            "Cumin seeds – ½ tsp",
            "Urad dal – 1 tsp",
            "Curry leaves – 6-8",
            "Turmeric powder – ¼ tsp",
            "Salt – as per taste",
            "Cold-pressed coconut oil or groundnut oil or olive oil – 1 tbsp",
            "Coriander leaves – for garnish",
            "Lemon juice – 1 tsp (optional)"
          ],
          preparationSteps: [
            "Dry Roast the Oats: Heat a pan on medium flame. Add 1 cup oats and dry roast for 3-4 minutes until slightly golden and aromatic. Keep aside.",
            "Prepare the Tempering: In the same pan, heat 1 tbsp oil. Add mustard seeds. Once they splutter, add cumin seeds, urad dal, curry leaves, green chili, and grated ginger. Sauté for 30 seconds.",
            "Sauté the Vegetables: Add chopped onions and sauté until translucent. Add chopped vegetables and turmeric powder. Sprinkle some salt and cook on low flame for 5-6 minutes, stirring occasionally. Add a little water if needed.",
            "Add Water: Pour 2 cups of water into the pan. Let it come to a boil.",
            "Add Roasted Oats: Slowly add the roasted oats while stirring continuously to avoid lumps. Mix well, cover, and let it cook on low flame for 3-4 minutes until oats absorb all the water.",
            "Final Touch: Turn off the heat. Garnish with chopped coriander leaves. Add a squeeze of lemon juice if desired."
          ],
          optionalAdditions: [
            "For extra flavor: Add a pinch of black pepper or a dash of sambar powder",
            "For protein boost: Add soaked and cooked moong dal or boiled sprouts"
          ],
          nutritionalInfo: {
            calories: "180-220 kcal",
            iron: "1.5-2 mg",
            carbohydrates: "30-35g",
            potassium: "150-180mg",
            protein: "5-6g",
            calcium: "25-30mg",
            fat: "5-7g",
            fiber: "5-6g"
          }
        }
      },
      { 
        id: 2, 
        name: "RAGI DOSA with COCONUT CHUTNEY", 
        price: 220, 
        discount: 20, 
        image: "https://images.slurrp.com/webstories/wp-content/uploads/2023/11/cropped-Ragi-Dosa-Recipe-1.jpg", 
        description: "Crispy, wholesome dosa made with iron-rich ragi flour, served with fresh coconut chutney. A nourishing, gluten-free breakfast for energy and endurance.",
        recipeDetails: {
          benefits: ["Iron-rich", "Gluten-free", "Energy and endurance"],
          prepTime: "15 minutes",
          cookTime: "20 minutes",
          servings: "3-4 dosas",
          part1Title: "PART 1: RAGI DOSA",
          part1Subtitle: "Ingredients:",
          ingredients: [
            "Ragi flour (finger millet flour) – 1 cup",
            "Rice flour – 2 tbsp (optional, for crispiness)",
            "Curd – 2 tbsp (optional, skip for vegan)",
            "Water – ~1.5 to 2 cups",
            "Salt – to taste",
            "Cumin seeds – ½ tsp",
            "Onion – 1 small, finely chopped (optional)",
            "Green chili – 1 (chopped)",
            "Curry leaves – 5-6 (chopped)",
            "Coriander leaves – 1 tbsp (chopped)",
            "Cold-pressed groundnut or coconut oil – for cooking"
          ],
          part1StepsTitle: "Preparation Steps:",
          preparationSteps: [
            "Make the Batter: In a mixing bowl, combine ragi flour, rice flour (optional), salt, curd (if using), cumin seeds, green chili, onion, curry leaves, and coriander. Add water gradually and whisk into a thin, runny batter (similar to rava dosa consistency). Rest for 10 minutes.",
            "Cook the Dosa: Heat a cast iron or non-stick tawa well. Drizzle a little oil. Sprinkle water to test heat—if it sizzles, it's ready. Pour the batter starting from the edges and filling toward the center (do not spread with ladle). Drizzle a few drops of oil around the edges. Cook on medium flame. Once edges lift, flip and cook briefly on the other side. Remove and repeat for more dosas."
          ],
          part2Title: "PART 2: COCONUT CHUTNEY",
          part2Subtitle: "Ingredients:",
          chutneyIngredients: [
            "Fresh grated coconut – ½ cup",
            "Roasted chana dal (putnalu) – 2 tbsp",
            "Green chili – 1 or 2",
            "Ginger – ½ inch piece",
            "Salt – to taste",
            "Water – as needed"
          ],
          temperingTitle: "For Tempering:",
          temperingIngredients: [
            "Coconut oil – 1 tsp",
            "Mustard seeds – ½ tsp",
            "Urad dal – ½ tsp",
            "Curry leaves – 5",
            "Hing – a pinch"
          ],
          part2StepsTitle: "Preparation Steps:",
          chutneySteps: [
            "Grind the Chutney: Blend grated coconut, roasted chana dal, green chili, ginger, salt, and a little water to a smooth paste. Adjust consistency as needed.",
            "Prepare Tempering: Heat oil in a small pan. Add mustard seeds, urad dal, curry leaves, and hing. Let them splutter. Pour the tempering over the chutney."
          ],
          nutritionalInfo: {
            calories: "~220-260 kcal",
            iron: "3-4 mg (high)",
            protein: "5-6 g",
            fiber: "4-5 g",
            carbs: "30-35 g",
            fat: "8-10 g",
            calcium: "100+ mg"
          }
        }
      },
      { 
        id: 3, 
        name: "VEGETABLE POHA (Flattened Rice with Vegetables)", 
        price: 150, 
        discount: 15, 
        image: "https://freeindianrecipes.com/wp-content/uploads/Poha-Upma-Recipe.jpg", 
        description: "A light and nutritious meal made with flattened rice and colorful vegetables. Rich in iron and fiber, perfect for a healthy start to your day.",
        recipeDetails: {
          benefits: ["Light & Easy to Digest", "Ideal for Breakfast or Light Dinner", "Rich in Iron, Fiber & Complex Carbs"],
          prepTime: "10 minutes",
          cookTime: "15 minutes",
          servings: "2 servings",
          ingredients: [
            "Thick Poha (flattened rice) – 1 cup",
            "Water – to rinse and soak",
            "Mixed vegetables – 1 cup (carrot, beans, peas, capsicum – finely chopped)",
            "Onion – 1 medium, chopped",
            "Green chili – 1, chopped",
            "Ginger – ½ inch, grated",
            "Mustard seeds – ½ tsp",
            "Cumin seeds – ½ tsp",
            "Urad dal or peanuts – 1 tbsp (optional for crunch)",
            "Curry leaves – 6-8",
            "Turmeric powder – ¼ tsp",
            "Salt – to taste",
            "Cold-pressed oil (groundnut or coconut) – 1 tbsp",
            "Lemon juice – 1 tsp",
            "Coriander leaves – for garnish",
            "Grated fresh coconut – 1 tbsp (optional, for topping)"
          ],
          preparationSteps: [
            "Rinse Poha: Place poha in a sieve and rinse under running water for 15-20 seconds. Let it soak for 5-7 minutes (do not over-soak). It should become soft but not mushy.",
            "Cook Vegetables: Heat oil in a pan. Add mustard seeds. Once they splutter, add cumin seeds, urad dal or peanuts, and curry leaves. Add chopped green chili and grated ginger. Add onions and sauté till translucent. Add mixed vegetables, turmeric, and salt. Cook for 4-5 minutes until veggies soften.",
            "Add Poha: Fluff the soaked poha and add it to the pan. Mix gently to avoid breaking the grains. Cook on low flame for 2-3 minutes.",
            "Garnish & Serve: Turn off the heat. Add lemon juice and chopped coriander. Top with grated coconut if using. Serve hot."
          ],
          nutritionalInfo: {
            calories: "200-240 kcal",
            fiber: "3-4g",
            carbs: "35-40g",
            iron: "2-2.5mg",
            protein: "4-5g",
            fat: "6-8g",
            potassium: "180-200mg"
          }
        }
      },
      { 
        id: 4, 
        name: "OATMEAL THICK SHAKE", 
        price: 200, 
        discount: 20, 
        image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", 
        description: "A creamy, fiber-rich thick shake made with oats, banana, and dates. Packed with energy, protein, and good fats—perfect for breakfast or pre-workout fuel.",
        recipeDetails: {
          benefits: ["High in Fiber & Healthy Fats", "Keeps you full for 3-4 hours", "Perfect for weight gain, workouts, or energy boost"],
          prepTime: "5 minutes",
          cookTime: "5 minutes",
          servings: "1 glass",
          ingredients: [
            "Rolled oats – 3 tbsp",
            "Almond milk / coconut milk / regular milk – 1 cup (unsweetened preferred)",
            "Banana – 1 medium (ripe)",
            "Dates – 2 to 3 (soaked & pitted)",
            "Peanut butter or soaked almonds – 1 tbsp (optional, for protein)",
            "Cinnamon powder – a pinch (optional)",
            "Chia seeds / Flax seeds – 1 tsp (optional, for added fiber & omega-3)",
            "Ice cubes – 2 to 3 (optional)"
          ],
          preparationSteps: [
            "Cook oats (optional for creaminess): Lightly roast oats for 2 minutes on a dry pan (or skip this step). Add ½ cup water and cook for 3-4 minutes till slightly soft and creamy. Let it cool.",
            "Blend everything: In a blender, add cooked oats, banana, dates, almond milk (or any milk), cinnamon, and optional ingredients (peanut butter, chia seeds, etc.). Blend till smooth and creamy.",
            "Serve: Pour into a glass jar or bottle. Serve immediately or chill before serving."
          ],
          variations: [
            "Use apple + cinnamon instead of banana for a lighter version",
            "Add cacao powder for a chocolate oat shake",
            "Use steamed carrots + banana for a 'carrot oatmeal shake'"
          ],
          nutritionalInfo: {
            calories: "280-320 kcal",
            protein: "6-8g",
            carbs: "35-40g",
            fat: "8-10g",
            fiber: "6-7g",
            iron: "1.5-2mg",
            calcium: "100-150mg",
            potassium: "300-350mg"
          }
        }
      },
      { 
        id: 5, 
        name: "MINTY MILLET IDLY", 
        price: 180, 
        discount: 15, 
        image: "https://www.bing.com/th/id/OIP.acHMl7OKBxP2eZEgFZ7bJgHaFj?w=237&h=211&c=8.rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
        description: "Fluffy steamed idlies made from fiber-rich millets, blended with a refreshing mint and herb mix.",
        recipeDetails: {
          benefits: ["Diabetic-Friendly", "Fermented = Gut-Boosting Probiotics", "Cooling, detoxifying herbs"],
          prepTime: "20 minutes (plus 6-8 hrs fermentation)",
          cookTime: "15 minutes",
          servings: "4-6 idlies",
          batterTitle: "For Batter: Fermentation Time: 6-8 hrs",
          batterIngredients: [
            "Little millet / Foxtail millet / Kodo millet – 1 cup",
            "Whole urad dal (black gram without skin) – ¼ cup",
            "Fenugreek seeds (methi) – ½ tsp",
            "Salt – to taste",
            "Water – as needed"
          ],
          mintTwistTitle: "For Minty Twist:",
          mintTwistIngredients: [
            "Fresh mint leaves – 1 cup",
            "Green chilies – 1-2",
            "Ginger – 1-inch piece",
            "Curry leaves – a few",
            "Cumin seeds – ½ tsp",
            "Optional: coriander leaves – ½ cup"
          ],
          preparationSteps: [
            "Soak & Grind the Batter: Wash and soak millets, urad dal, and fenugreek seeds separately for 4-5 hours. Grind urad dal first into a smooth, fluffy batter. Grind millets into a slightly coarse batter. Combine both. Add salt and mix well. Cover and ferment for 6-8 hours or overnight (batter should rise and be airy).",
            "Prepare Mint Paste: Blend mint leaves, green chili, ginger, curry leaves, cumin, and coriander into a smooth paste using 2-3 tbsp of water.",
            "Combine & Make Idlies: Mix mint paste into fermented batter. Stir gently (don't overmix). Add mint paste only before steaming. Grease idly molds and pour batter into them. Steam for 10-12 minutes on medium flame. Check doneness with a toothpick. Cool slightly and demold."
          ],
          nutritionalInfo: {
            calories: "140-160 kcal",
            protein: "4-5g",
            carbs: "28-30g",
            fiber: "2-3g",
            iron: "1.5-2mg",
            calcium: "20-30mg"
          }
        }
      },
      { 
        id: 6, 
        name: "MILLET PONGAL", 
        price: 200, 
        discount: 20, 
        image: "https://vismaifood.com/storage/app/uploads/public/0ad/d04/0dc/thumb__1200_0_0_0_auto.jpg",
        description: "A comforting one-pot dish made with fiber-rich millets and protein-packed moong dal, tempered with fresh herbs and spices. A soothing and nourishing satvic meal.",
        recipeDetails: {
          benefits: ["Diabetic-friendly", "High in plant protein", "Easy to digest"],
          prepTime: "10 minutes",
          cookTime: "25 minutes",
          servings: "3-4 servings",
          ingredients: [
            "Little millet / Foxtail millet / Kodo millet – ½ cup",
            "Yellow moong dal – ¼ cup",
            "Water – 2½ to 3 cups",
            "Rock salt – to taste"
          ],
          temperingTitle: "For Tempering:",
          temperingIngredients: [
            "Cold-pressed groundnut oil / coconut oil – 1½ tbsp",
            "Cumin seeds – 1 tsp",
            "Crushed black pepper – ½ tsp (adjust to taste)",
            "Ginger – 1-inch (finely chopped or grated)",
            "Curry leaves – 8-10",
            "Cashew nuts – 6-8 (optional)",
            "Hing (asafoetida) – a pinch",
            "Optional: chopped green chilies – 1 (if you like a little heat)"
          ],
          preparationSteps: [
            "Roast and Cook Millets + Dal: Dry roast moong dal until aromatic (light golden, do not brown). Rinse millet and roasted dal together. Pressure cook with 2½ to 3 cups water and salt for 3-4 whistles or until soft and mushy. (You can also cook in an open pot, but add water as needed.)",
            "Prepare Tempering: Heat oil in a small pan. Add cumin seeds, black pepper, ginger, curry leaves, hing, and cashews. Sauté until cashews are golden and spices release aroma.",
            "Mix and Serve: Add the tempering to the cooked millet-dal mixture. Mix well and mash lightly for soft texture. Add a splash of hot water if it's too thick and adjust salt if needed."
          ],
          servingSuggestion: "Coconut chutney, Tomato-onion chutney, Mint chutney",
          nutritionalInfo: {
            calories: "200-250 kcal",
            protein: "6-8g",
            carbs: "35-40g",
            fiber: "3-4g",
            iron: "1.5-2mg",
            magnesium: "40-60mg"
          }
        }
      },
      { 
        id: 7, 
        name: "CHICKPEA SALAD TOAST", 
        price: 180, 
        discount: 15, 
        image: "https://bellyfull.net/wp-content/uploads/2024/08/Chickpea-Salad-Cottage-Cheese-Toast-blog-3.jpg", 
        description: "Toasted bread topped with a refreshing mix of mashed chickpeas and raw veggies—rich in plant protein, fiber, and taste. Ideal for a power-packed breakfast or light evening snack.",
        recipeDetails: {
          benefits: ["Plant protein-rich", "Cholesterol-free"],
          prepTime: "15 minutes",
          cookTime: "5 minutes",
          servings: "2-4 toasts",
          saladTitle: "For Chickpea Salad:",
          saladIngredients: [
            "Boiled chickpeas (white chana) – 1 cup",
            "Finely chopped cucumber – ½ cup",
            "Finely chopped tomato – ½ cup (deseeded)",
            "Grated carrot – ½ cup",
            "Finely chopped onion – ¼ cup (optional for satvic)",
            "Finely chopped mint or coriander leaves – 2 tbsp",
            "Grated raw beetroot – 2 tbsp (optional but nutritious)",
            "Lemon juice – 1 tbsp",
            "Rock salt – to taste",
            "Black pepper – ¼ tsp",
            "Roasted cumin powder – ¼ tsp",
            "Chat masala – ¼ tsp (optional)"
          ],
          toastTitle: "For Toast:",
          toastIngredients: [
            "Whole wheat or millet bread slices – 4",
            "Cold-pressed coconut oil or ghee – for toasting"
          ],
          preparationSteps: [
            "Prep Chickpea Salad: In a large mixing bowl, add boiled chickpeas (slightly mash ⅓ of them for texture). Add cucumber, tomato, carrot, beetroot, mint, and optional onion. Season with salt, pepper, cumin powder, and lemon juice. Mix well and set aside.",
            "Toast the Bread: Heat a pan or tawa. Add a few drops of coconut oil or ghee and lightly toast bread slices on both sides until golden and crisp.",
            "Assemble Toasts: Spoon generous portions of the chickpea salad onto warm toasts. Garnish with extra mint or a dash of lemon juice."
          ],
          optional: "Sprinkle crushed roasted peanuts or sunflower seeds for added crunch",
          servingSuggestion: "Serve immediately to enjoy the contrast of warm toast and cool salad. Pair with a glass of mint cucumber juice or ABC juice.",
          nutritionalInfo: {
            calories: "120-150 kcal per toast",
            protein: "5-6g",
            carbs: "15-18g",
            fiber: "4-5g",
            iron: "1.5mg",
            vitaminC: "8-10mg"
          },
          storageTips: "Chickpea salad can be made in advance and stored in the fridge for up to 1 day. Assemble the toasts just before serving to prevent sogginess."
        }
      },
      { 
        id: 8, 
        name: "STUFFED VEGETABLE PARATHA", 
        price: 200, 
        discount: 20, 
        image: "https://5.imimg.com/data5/SELLER/Default/2024/3/396352425/QD/FY/LC/23347542/frozen-mix-veg-paratha-500x500.jpg",
        description: "Soft flatbread stuffed with seasonal vegetables and gentle spices. A wholesome, filling, and satvic meal option, ideal for breakfast or lunch.",
        recipeDetails: {
          benefits: ["Whole grain / millet base", "Loaded with veggies", "No onion, no garlic"],
          prepTime: "30 minutes",
          cookTime: "20 minutes",
          servings: "4-5 parathas",
          doughTitle: "For Dough:",
          doughIngredients: [
            "Whole wheat flour / Multi-millet flour – 1½ cups",
            "Warm water – as needed",
            "Rock salt – ½ tsp",
            "Cold-pressed oil – 1 tsp (optional)"
          ],
          stuffingTitle: "For Stuffing:",
          stuffingIngredients: [
            "Grated carrot – ½ cup",
            "Grated bottle gourd (lauki) or beetroot – ½ cup",
            "Boiled and mashed sweet potato or potato – ½ cup",
            "Finely chopped coriander – 2 tbsp",
            "Green chilies – 1 (optional, finely chopped)",
            "Grated ginger – 1 tsp",
            "Rock salt – to taste",
            "Cumin powder – ½ tsp",
            "Garam masala / Satvic masala – ½ tsp (optional)",
            "Amchur (dry mango powder) or lemon juice – ½ tsp",
            "Ajwain (carom seeds) – ½ tsp (optional, aids digestion)"
          ],
          preparationSteps: [
            "Prepare Dough: Mix flour and salt. Gradually add warm water and knead into a soft, pliable dough. Cover and rest for 15-20 minutes.",
            "Make the Stuffing: In a bowl, mix grated carrot, lauki/beetroot, mashed potato/sweet potato, and all spices. Squeeze excess water from watery vegetables like bottle gourd before mixing. Mix well and divide into equal-sized balls.",
            "Roll and Stuff Parathas: Take a small portion of dough and roll into a small disc. Place a ball of stuffing in the center. Seal edges and flatten gently. Roll again into a paratha (not too thin) using minimal dry flour.",
            "Cook Parathas: Heat a tawa and place the rolled paratha on it. Cook both sides until golden brown using minimal cold-pressed oil or ghee."
          ],
          servingSuggestion: "Pair with: Mint coconut chutney, Homemade curd / vegan curd, Tomato-date chutney",
          nutritionalInfo: {
            calories: "150-180 kcal per paratha",
            protein: "4-5g",
            carbs: "25-30g",
            fiber: "3-4g",
            iron: "1.5-2mg"
          }
        }
      },
      { 
        id: 9, 
        name: "AVOCADO CHICKPEA GLOW BOWL", 
        price: 280, 
        discount: 25, 
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 
        description: "A nourishing mix of chickpeas, fresh vegetables, and creamy avocado — tossed in a lemon-cumin dressing. A cooling, energizing, and beautifying satvic bowl.",
        recipeDetails: {
          benefits: ["No cooking", "Cooling and hydrating", "Anti-inflammatory & glow-boosting", "Great for skin, gut, and energy"],
          prepTime: "15 minutes",
          cookTime: "0 minutes",
          servings: "1 bowl",
          baseTitle: "Base:",
          baseIngredients: [
            "Boiled chickpeas – 1 cup",
            "Ripe avocado – 1 (cubed or mashed)",
            "Finely chopped cucumber – ½ cup",
            "Finely chopped tomatoes – ½ cup (deseeded)",
            "Grated carrot – ½ cup",
            "Pomegranate seeds – ¼ cup (optional, for sweetness & glow)",
            "Fresh mint or coriander – 2 tbsp"
          ],
          dressingTitle: "Dressing:",
          dressingIngredients: [
            "Lemon juice – 1 tbsp",
            "Cold-pressed olive oil – 1 tsp (optional)",
            "Rock salt – to taste",
            "Crushed black pepper – ¼ tsp",
            "Roasted cumin powder – ½ tsp",
            "Grated ginger – ½ tsp"
          ],
          optionalAddons: [
            "Sprouted moong – ¼ cup",
            "Pumpkin or sunflower seeds – 1 tbsp",
            "Microgreens – for garnish"
          ],
          preparationSteps: [
            "Prepare the Base: In a wide bowl, combine boiled chickpeas, avocado, cucumber, tomato, carrot, and pomegranate seeds. Gently toss with fresh herbs (mint or coriander).",
            "Mix the Dressing: In a small bowl, whisk together lemon juice, grated ginger, salt, pepper, and cumin powder. Add olive oil if using.",
            "Combine and Garnish: Pour the dressing over the salad bowl and mix gently. Top with seeds, sprouts, or microgreens for added crunch and nutrition."
          ],
          servingSuggestion: "Serve immediately while fresh. Can be paired with coconut water, ABC juice, or a wheatgrass shot.",
          nutritionalInfo: {
            calories: "300-350 kcal",
            protein: "10-12g",
            healthyFats: "10-15g",
            fiber: "9-12g",
            vitaminC: "High",
            iron: "Moderate"
          }
        }
      },
      { 
        id: 10, 
        name: "CABBAGE APPLE SLIM SALAD", 
        price: 150, 
        discount: 15, 
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", 
        description: "A crunchy, hydrating blend of cabbage and apples with lemon-ginger dressing. Designed to detox and slim.",
        recipeDetails: {
          benefits: ["No oil, no dairy, no tamarind", "Satvic and digestion-friendly", "Raw, alkaline, anti-bloating", "Ideal for dinner or light lunch"],
          prepTime: "15 minutes",
          cookTime: "0 minutes",
          servings: "2 servings",
          saladBaseTitle: "Salad Base:",
          saladBaseIngredients: [
            "Shredded cabbage – 1½ cups (green or purple or mixed)",
            "Apple – 1 medium (thinly sliced or julienned, with peel)",
            "Grated carrot – ½ cup",
            "Fresh mint or coriander – 2 tbsp",
            "Optional: 1 tbsp pomegranate seeds or soaked raisins"
          ],
          dressingTitle: "Dressing:",
          dressingIngredients: [
            "Lemon juice – 1 tbsp",
            "Grated ginger – ½ tsp",
            "Rock salt – to taste",
            "Crushed black pepper – ¼ tsp",
            "Roasted cumin powder – ½ tsp",
            "Optional: Honey or soaked date paste – ½ tsp (for sweetness)"
          ],
          preparationSteps: [
            "Shred & Slice: Finely shred the cabbage and place in a mixing bowl. Thinly slice the apple and grate the carrot. Add to the bowl along with chopped mint/coriander.",
            "Make the Dressing: Mix lemon juice, grated ginger, salt, pepper, and cumin powder in a small bowl. Add a little honey/date paste if you want a sweet touch.",
            "Toss & Serve: Pour the dressing over the salad. Toss well until all ingredients are coated. Let it sit for 5 minutes to absorb flavors before serving."
          ],
          optionalAddons: [
            "1 tbsp soaked sunflower or pumpkin seeds",
            "1 tsp chia seeds (soaked in water for 5 min)",
            "Handful of microgreens or sprouts"
          ],
          nutritionalInfo: {
            calories: "120-150 kcal",
            fiber: "5-7g",
            naturalSugars: "Moderate",
            vitaminC: "High",
            antioxidants: "High"
          }
        }
      },
      { 
        id: 11, 
        name: "MILLET TABOULI SALAD", 
        price: 200, 
        discount: 20, 
        image: "https://images.unsplash.com/photo-1511690656952-34342d5c2895?w=400&h=300&fit=crop", 
        description: "A refreshing fusion of cooling herbs, vegetables, and millet tossed in lemon-cumin dressing.",
        recipeDetails: {
          benefits: ["High fiber", "Hydrating", "Rich in antioxidants", "Cooling and detoxifying"],
          prepTime: "20 minutes",
          cookTime: "15 minutes",
          servings: "2-3 servings",
          milletBaseTitle: "Millet Base:",
          milletBaseIngredients: [
            "Little millet / Foxtail millet – ½ cup (uncooked)",
            "Water – 1¼ cups (for cooking millet)",
            "Pinch of rock salt (optional)"
          ],
          saladMixTitle: "Salad Mix:",
          saladMixIngredients: [
            "Finely chopped cucumber – ½ cup",
            "Finely chopped tomatoes (deseeded) – ½ cup",
            "Finely chopped fresh parsley or coriander – ½ cup",
            "Fresh mint leaves – 2 tbsp (finely chopped)",
            "Spring onion or red onion – 2 tbsp (optional)"
          ],
          dressingTitle: "Dressing:",
          dressingIngredients: [
            "Lemon juice – 2 tbsp",
            "Grated ginger – ½ tsp",
            "Roasted cumin powder – ½ tsp",
            "Rock salt – to taste",
            "Crushed black pepper – ¼ tsp"
          ],
          cookingSteps: [
            "Rinse millet 2-3 times and drain.",
            "In a pan, add millet and 1¼ cups of water. Bring to a boil.",
            "Simmer, cover, and cook for 8-10 minutes or until soft and water is absorbed.",
            "Fluff with fork and let it cool completely."
          ],
          assemblySteps: [
            "In a mixing bowl, combine cooled cooked millet with cucumber, tomatoes, mint, and parsley/coriander.",
            "In a small bowl, mix all the dressing ingredients.",
            "Pour dressing over the millet salad and toss well.",
            "Let sit for 10 minutes for flavors to meld."
          ],
          optionalAddons: [
            "1 tbsp soaked raisins or chopped dates (for mild sweetness)",
            "1 tbsp roasted sesame seeds or sunflower seeds",
            "A few pomegranate arils"
          ],
          nutritionalInfo: {
            calories: "180-220 kcal",
            fiber: "5-6g",
            plantProtein: "5-6g",
            iron: "Moderate",
            hydration: "High (from cucumber, mint, tomato)"
          }
        }
      },
      { 
        id: 12, 
        name: "RAGI IDLY", 
        price: 180, 
        discount: 15, 
        image: "https://www.secondrecipe.com/wp-content/uploads/2024/02/ragi-idli-720x830.jpg",
        description: "Soft and fluffy idlies made from iron-rich ragi flour. A healthy and nutritious breakfast option.",
        recipeDetails: {
          benefits: ["Iron-rich", "Gluten-free", "Easy to digest", "Diabetic-friendly"],
          prepTime: "15 minutes (plus 6-8 hrs fermentation)",
          cookTime: "15 minutes",
          servings: "4-6 idlies",
          batterTitle: "For Batter: Fermentation Time: 6-8 hrs",
          batterIngredients: [
            "Ragi flour (finger millet) – 1 cup",
            "Whole urad dal – ¼ cup",
            "Fenugreek seeds – ½ tsp",
            "Salt – to taste",
            "Water – as needed"
          ],
          preparationSteps: [
            "Soak & Grind: Wash and soak urad dal and fenugreek seeds for 4-5 hours. Grind urad dal into a smooth, fluffy batter. In a separate bowl, mix ragi flour with water to make a thick batter. Combine both batters and add salt. Ferment for 6-8 hours or overnight.",
            "Steam the Idlies: Grease idly molds. Pour the fermented batter into the molds. Steam for 10-12 minutes on medium flame. Check doneness with a toothpick. Cool slightly and demold.",
            "Serve: Serve hot with coconut chutney, sambar, or tomato podi."
          ],
          nutritionalInfo: {
            calories: "120-140 kcal",
            protein: "3-4g",
            carbs: "25-28g",
            fiber: "2-3g",
            iron: "3-4mg (high)",
            calcium: "80-100mg"
          }
        }
      },
      { 
        id: 13, 
        name: "AVOCADO IDLY", 
        price: 200, 
        discount: 20, 
        image: "https://static.vecteezy.com/system/resources/previews/016/585/699/non_2x/mini-idli-is-the-smaller-version-of-soft-and-spongy-round-shaped-steamed-regular-rice-idli-also-known-as-button-and-cocktail-idly-free-photo.jpg",
        description: "Creamy and healthy idlies blended with nutritious avocado. A modern twist on traditional breakfast.",
        recipeDetails: {
          benefits: ["Heart-healthy fats", "Good for skin", "High in fiber", "Sustained energy"],
          prepTime: "20 minutes (plus 6-8 hrs fermentation)",
          cookTime: "15 minutes",
          servings: "4-6 idlies",
          batterTitle: "For Batter: Fermentation Time: 6-8 hrs",
          batterIngredients: [
            "Idli rice – 1 cup",
            "Whole urad dal – ¼ cup",
            "Fenugreek seeds – ½ tsp",
            "Ripe avocado – 1 (medium)",
            "Salt – to taste",
            "Water – as needed"
          ],
          preparationSteps: [
            "Soak & Grind: Wash and soak rice and urad dal separately for 4-5 hours. Grind urad dal into a smooth batter. Grind rice separately. Combine both batters and add salt. Ferment for 6-8 hours.",
            "Add Avocado: Before steaming, take a portion of the batter and blend it with ripe avocado to make it creamy. Mix back into the main batter.",
            "Steam the Idlies: Grease idly molds. Pour the avocado batter into the molds. Steam for 10-12 minutes on medium flame.",
            "Serve: Serve hot with mint chutney or tomato salsa."
          ],
          nutritionalInfo: {
            calories: "150-170 kcal",
            protein: "3-4g",
            carbs: "22-25g",
            fiber: "4-5g",
            healthyFats: "6-8g",
            potassium: "250-300mg"
          }
        }
      },
      { 
        id: 14, 
        name: "SPROUTS IDLY", 
        price: 190, 
        discount: 15, 
        image: "https://diyglow.in/wp-content/uploads/2024/01/Palak-Rava-Idli-Recipe.jpg",
        description: "Protein-packed idlies loaded with nutritious sprouts. A power breakfast for energy and health.",
        recipeDetails: {
          benefits: ["High protein", "Rich in vitamins", "Good for digestion", "Immunity boosting"],
          prepTime: "25 minutes (plus 6-8 hrs fermentation)",
          cookTime: "15 minutes",
          servings: "4-6 idlies",
          batterTitle: "For Batter: Fermentation Time: 6-8 hrs",
          batterIngredients: [
            "Idli rice – 1 cup",
            "Whole urad dal – ¼ cup",
            "Fenugreek seeds – ½ tsp",
            "Moong sprouts – ½ cup (ground)",
            "Salt – to taste",
            "Water – as needed"
          ],
          preparationSteps: [
            "Soak & Grind: Wash and soak rice and urad dal separately for 4-5 hours. Grind urad dal into a smooth batter. Grind rice separately. Combine both batters and add salt. Ferment for 6-8 hours.",
            "Prepare Sprouts: Lightly ground the moong sprouts in a mixer to a coarse paste. Mix this into the fermented batter.",
            "Steam the Idlies: Grease idly molds. Pour the sprouts batter into the molds. Steam for 12-15 minutes on medium flame.",
            "Serve: Serve hot with coconut chutney or sambar."
          ],
          nutritionalInfo: {
            calories: "140-160 kcal",
            protein: "6-8g (high)",
            carbs: "24-28g",
            fiber: "3-4g",
            iron: "2-3mg",
            vitaminC: "Good amount"
          }
        }
      },
      { 
        id: 15, 
        name: "SAMBHAR IDLY", 
        price: 220, 
        discount: 20, 
        image: "https://bluenilekitchen.com/wp-content/uploads/2024/06/IdliSambarWebsite-1024x576.jpg",
        description: "Fluffy idlies served with flavorful and aromatic sambar. A classic South Indian breakfast combination.",
        recipeDetails: {
          benefits: ["Protein-rich", "Good for gut health", "Balanced nutrition", "Comfort food"],
          prepTime: "30 minutes (plus fermentation)",
          cookTime: "30 minutes",
          servings: "4-6 idlies + 4-5 cups sambar",
          idlyTitle: "For Idly:",
          idlyIngredients: [
            "Idli rice – 1 cup",
            "Whole urad dal – ¼ cup",
            "Fenugreek seeds – ½ tsp",
            "Salt – to taste"
          ],
          sambarTitle: "For Sambar:",
          sambarIngredients: [
            "Toor dal – ½ cup",
            "Tamarind – small lemon-sized ball",
            "Tomatoes – 2 medium (chopped)",
            "Carrot – 1 (cubed)",
            "Beans – ½ cup (chopped)",
            "Drumstick – 1 (cut into pieces)",
            "Onion – 1 small (chopped)",
            "Green chili – 2",
            "Curry leaves – few",
            "Sambar powder – 2 tbsp",
            "Turmeric powder – ¼ tsp",
            "Mustard seeds – 1 tsp",
            "Cumin seeds – ½ tsp",
            "Hing – a pinch",
            "Cold-pressed oil – 1 tbsp",
            "Salt – to taste"
          ],
          preparationSteps: [
            "Prepare Idly Batter: Wash and soak rice and urad dal for 4-5 hours. Grind to a smooth batter. Add salt and ferment for 6-8 hours.",
            "Cook Toor Dal: Pressure cook toor dal with turmeric until soft. Mash and keep aside.",
            "Prepare Sambar Base: Soak tamarind in warm water and extract juice. In a pot, add tamarind extract, chopped vegetables, tomatoes, green chili, curry leaves, sambar powder, and salt. Cook until vegetables are tender.",
            "Add Dal: Add the mashed toor dal to the vegetable mixture. Simmer for 10 minutes.",
            "Prepare Tempering: Heat oil in a small pan. Add mustard seeds, cumin seeds, hing, and curry leaves. Pour this tempering over the sambar.",
            "Steam Idlies: Grease idly molds. Pour batter and steam for 10-12 minutes.",
            "Serve: Serve hot idlies with steaming hot sambar. Garnish with fresh coriander."
          ],
          servingSuggestion: "Serve with coconut chutney and podi (spice powder)",
          nutritionalInfo: {
            calories: "200-250 kcal (per serving with sambar)",
            protein: "8-10g",
            carbs: "35-40g",
            fiber: "4-5g",
            iron: "2-3mg",
            vitaminC: "High"
          }
        }
      },
      { 
        id: 16, 
        name: "MULTI GRAIN DOSA", 
        price: 240, 
        discount: 20, 
        image: "https://www.vegrecipesofindia.com/wp-content/uploads/2020/09/multigrain-dosa-recipe-500x375.jpg",
        description: "A healthy and nutritious dosa made with a blend of multiple grains. Rich in fiber and minerals.",
        recipeDetails: {
          benefits: ["High in fiber", "Rich in minerals", "Good for digestion", "Gluten-free"],
          prepTime: "15 minutes (plus 8-10 hrs fermentation)",
          cookTime: "20 minutes",
          servings: "4-5 dosas",
          batterTitle: "For Batter: Fermentation Time: 8-10 hrs",
          batterIngredients: [
            "Ragi (finger millet) – ½ cup",
            "Raw rice – ½ cup",
            "Parboiled rice – ½ cup",
            "Whole urad dal – ¼ cup",
            "Moong dal – 2 tbsp",
            "Fenugreek seeds – ½ tsp",
            "Salt – to taste",
            "Water – as needed"
          ],
          preparationSteps: [
            "Soak: Wash and soak all grains and dals together for 4-5 hours.",
            "Grind: Grind the soaked ingredients into a smooth batter. Add salt and mix well.",
            "Ferment: Cover and ferment for 8-10 hours or overnight in a warm place.",
            "Make Dosa: Heat a tawa well. Pour a ladleful of batter and spread in circular motions. Drizzle oil around the edges. Cook until golden brown. Fold and serve.",
            "Serve: Serve hot with coconut chutney, sambar, or tomato podi."
          ],
          nutritionalInfo: {
            calories: "180-220 kcal",
            protein: "4-5g",
            carbs: "30-35g",
            fiber: "3-4g",
            iron: "2-3mg",
            calcium: "80-100mg"
          }
        }
      },
      { 
        id: 17, 
        name: "EGG DOSA", 
        price: 200, 
        discount: 15, 
        image: "https://www.ruchiskitchen.com/wp-content/uploads/2020/04/egg-dosa-recipe.jpg",
        description: "Crispy dosa topped with scrambled eggs and spices. A protein-packed breakfast option.",
        recipeDetails: {
          benefits: ["High protein", "Energy boosting", "Satisfying", "Quick breakfast"],
          prepTime: "10 minutes",
          cookTime: "15 minutes",
          servings: "2-3 dosas",
          dosaTitle: "For Dosa:",
          dosaIngredients: [
            "Dosa batter – 1 cup",
            "Oil – for cooking"
          ],
          eggTitle: "For Egg Topping:",
          eggIngredients: [
            "Eggs – 2-3",
            "Onion – 1 small (finely chopped)",
            "Green chili – 1 (chopped)",
            "Salt – to taste",
            "Black pepper – ¼ tsp",
            "Oil – 1 tsp"
          ],
          preparationSteps: [
            "Prepare Egg Topping: Heat oil in a pan. Add chopped onions and green chili. Sauté until onions are translucent. Break eggs into the pan, add salt and pepper. Scramble and cook until eggs are fully cooked. Keep aside.",
            "Make Dosa: Heat a tawa well. Pour a ladleful of dosa batter and spread in circular motions. Drizzle oil around the edges.",
            "Add Egg: Before the dosa is fully cooked, spread the scrambled egg mixture over the dosa. Press gently.",
            "Cook: Cook until the dosa is golden brown and crispy. Fold and serve.",
            "Serve: Serve hot with coconut chutney or ketchup."
          ],
          nutritionalInfo: {
            calories: "250-300 kcal",
            protein: "12-15g",
            carbs: "25-30g",
            fat: "10-12g",
            iron: "2-3mg"
          }
        }
      },
      { 
        id: 18, 
        name: "ONION DOSA", 
        price: 180, 
        discount: 15, 
        image: "https://www.vegrecipesofindia.com/wp-content/uploads/2019/04/onion-dosa-recipe.jpg",
        description: "Crispy dosa loaded with caramelized onions. A flavorful and aromatic South Indian classic.",
        recipeDetails: {
          benefits: ["Good carbohydrates", "Onion nutrients", "Energy source", "Delicious taste"],
          prepTime: "10 minutes",
          cookTime: "15 minutes",
          servings: "4-5 dosas",
          batterTitle: "For Batter:",
          batterIngredients: [
            "Idli rice – 1 cup",
            "Whole urad dal – ¼ cup",
            "Fenugreek seeds – ½ tsp",
            "Salt – to taste"
          ],
          onionTitle: "For Onion Filling:",
          onionIngredients: [
            "Onions – 2 large (thinly sliced)",
            "Green chilies – 2 (chopped)",
            "Curry leaves – few",
            "Salt – to taste",
            "Oil – 2 tbsp"
          ],
          preparationSteps: [
            "Prepare Batter: Wash and soak rice and urad dal for 4-5 hours. Grind to a smooth batter. Ferment for 8-10 hours.",
            "Caramelize Onions: Heat oil in a pan. Add sliced onions and sauté until golden brown. Add green chilies and curry leaves. Add salt and mix. Keep aside.",
            "Make Dosa: Heat a tawa well. Pour a ladleful of batter and spread in circular motions.",
            "Add Onion: Before the dosa is fully cooked, spread the caramelized onions over the dosa. Drizzle a little oil around the edges.",
            "Cook: Cook until the dosa is golden brown and crispy. Fold and serve.",
            "Serve: Serve hot with coconut chutney and sambar."
          ],
          nutritionalInfo: {
            calories: "180-220 kcal",
            protein: "3-4g",
            carbs: "28-32g",
            fiber: "2-3g",
            vitaminC: "Good amount"
          }
        }
      }
    ]
  },
  {
    id: 2,
    name: "Pizza",
    icon: "fa-pizza-slice",
    items: [
      { id: 101, name: "Margherita", price: 249, discount: 20, image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop", description: "Classic tomato sauce with mozzarella cheese" },
      { id: 102, name: "Farmhouse Veg", price: 349, discount: 15, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", description: "Capsicum, onion, tomato, mushroom" },
      { id: 103, name: "Paneer Tikka Pizza", price: 399, discount: 25, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", description: "Marinated paneer with onion and capsicum" },
      { id: 104, name: "Corn & Cheese Pizza", price: 329, discount: 10, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", description: "Sweet corn and melted cheese" },
      { id: 105, name: "Mushroom Delight", price: 369, discount: 20, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", description: "Fresh mushrooms with cheese" }
    ]
  },
  {
    id: 3,
    name: "Burgers",
    icon: "fa-hamburger",
    items: [
      { id: 201, name: "Classic Veg Burger", price: 149, discount: 10, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", description: "Fresh vegetables with special sauce" },
      { id: 202, name: "Aloo Tikki Burger", price: 129, discount: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", description: "Crispy potato patty with chutney" },
      { id: 203, name: "Paneer Burger", price: 199, discount: 20, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", description: "Grilled paneer with lettuce and tomato" }
    ]
  },
  {
    id: 4,
    name: "Biryani",
    icon: "fa-utensils",
    items: [
      { id: 301, name: "Veg Biryani", price: 249, discount: 20, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop", description: "Aromatic basmati rice with vegetables" },
      { id: 302, name: "Chicken Biryani", price: 349, discount: 25, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop", description: "Spiced chicken with basmati rice" }
    ]
  },
  {
    id: 5,
    name: "Beverages",
    icon: "fa-glass-cheers",
    items: [
      { id: 401, name: "Cold Coffee", price: 149, discount: 15, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop", description: "Iced coffee with ice cream" },
      { id: 402, name: "Oreo Shake", price: 179, discount: 20, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop", description: "Oreo biscuits blended with ice cream" }
    ]
  }
];

// Quick link data for Main.jsx
export const quickLinkData = {
  birthdayParty: [
    { id: 1001, name: "Chocolate Truffle Cake", price: 599, discount: 20, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", description: "Rich chocolate cake with truffle frosting" },
    { id: 1002, name: "Black Forest Cake", price: 549, discount: 15, image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop", description: "Classic cherry chocolate cream cake" },
    { id: 1003, name: "Red Velvet Cake", price: 649, discount: 25, image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=300&fit=crop", description: "Velvety red cake with cream cheese frosting" },
    { id: 1004, name: "Butterscotch Cake", price: 499, discount: 15, image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=300&fit=crop", description: "Caramel flavored cake with butterscotch chips" },
    { id: 1005, name: "Pineapple Cake", price: 449, discount: 10, image: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400&h=300&fit=crop", description: "Fresh pineapple topping with creamy frosting" },
    { id: 1006, name: "Strawberry Cake", price: 529, discount: 20, image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop", description: "Fresh strawberry layers with strawberry cream" },
    { id: 1007, name: "Vanilla Bean Cake", price: 399, discount: 10, image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=300&fit=crop", description: "Classic vanilla cake with buttercream frosting" },
    { id: 1008, name: "Mango Cake", price: 579, discount: 20, image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=300&fit=crop", description: "King of fruits - fresh mango layers" },
    { id: 1009, name: "Coffee Walnut Cake", price: 529, discount: 15, image: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=400&h=300&fit=crop", description: "Coffee flavored cake with crunchy walnuts" },
    { id: 1010, name: "Rainbow Cake", price: 699, discount: 25, image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop", description: "Colorful layers with vanilla cream frosting" }
  ],
  veg: [
    { id: 2001, name: "Vegetable Biryani", price: 249, discount: 20, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Aromatic basmati rice with mixed vegetables" },
    { id: 2002, name: "Palak Paneer", price: 229, discount: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Cottage cheese in creamy spinach gravy" },
    { id: 2003, name: "Vegetable Fried Rice", price: 199, discount: 10, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop", description: "Wok-tossed rice with fresh vegetables" },
    { id: 2004, name: "Dal Makhani", price: 219, discount: 15, image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", description: "Creamy black lentils slow-cooked for hours" },
    { id: 2005, name: "Vegetable Manchurian", price: 239, discount: 20, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Crispy vegetable balls in savory sauce" },
    { id: 2006, name: "Aloo Gobi", price: 179, discount: 10, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", description: "Potato and cauliflower dry curry" },
    { id: 2007, name: "Mix Veg Pizza", price: 349, discount: 25, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", description: "Loaded with fresh vegetables and cheese" },
    { id: 2008, name: "Vegetable Hakka Noodles", price: 189, discount: 15, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Stir-fried noodles with mixed vegetables" },
    { id: 2009, name: "Methi Malai Mutter", price: 249, discount: 20, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Fenugreek leaves with peas in creamy gravy" },
    { id: 2010, name: "Vegetable Pulao", price: 199, discount: 10, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Fragrant rice cooked with vegetables" }
  ],
  nonVeg: [
    { id: 3001, name: "Chicken Biryani", price: 349, discount: 25, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Aromatic basmati rice with tender chicken" },
    { id: 3002, name: "Butter Chicken", price: 329, discount: 20, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop", description: "Creamy tomato-based chicken curry" },
    { id: 3003, name: "Chicken 65", price: 279, discount: 15, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", description: "Spicy deep-fried chicken appetizer" },
    { id: 3004, name: "Chicken Fried Rice", price: 249, discount: 20, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop", description: "Wok-tossed rice with chicken and eggs" },
    { id: 3005, name: "Chicken Tikka Masala", price: 359, discount: 25, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", description: "Grilled chicken in creamy spiced gravy" },
    { id: 3006, name: "Mutton Biryani", price: 449, discount: 30, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Fragrant rice with succulent mutton pieces" },
    { id: 3007, name: "Fish Fry", price: 299, discount: 15, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Crispy fried fish fillet with spices" },
    { id: 3008, name: "Chicken Keema", price: 269, discount: 20, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop", description: "Minced chicken cooked with spices" },
    { id: 3009, name: "Prawns Masala", price: 399, discount: 25, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Succulent prawns in flavorful gravy" },
    { id: 3010, name: "Chicken Lolipop", price: 289, discount: 15, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", description: "Crispy chicken wings with Indo-Chinese flavors" }
  ],
  offers: [
    { id: 4001, name: "Combo Meal - Biryani + Drink", price: 399, discount: 50, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Aromatic biryani with refreshing beverage" },
    { id: 4002, name: "Family Pack - 4 Curries + Rice", price: 699, discount: 45, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", description: "Perfect for family of 4" },
    { id: 4003, name: "Pizza Feast - 2 Large Pizzas", price: 599, discount: 40, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", description: "2 Large pizzas with toppings" },
    { id: 4004, name: "Burger Bonanza - 4 Burgers", price: 449, discount: 35, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", description: "4 Delicious burgers combo" },
    { id: 4005, name: "South Indian Thali", price: 249, discount: 30, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop", description: "Complete traditional thali" },
    { id: 4006, name: "Chinese Platter", price: 349, discount: 40, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Variety of Chinese dishes" },
    { id: 4007, name: "Starter Combo - 6 Items", price: 299, discount: 45, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Assorted tasty starters" },
    { id: 4008, name: "Healthy Bowl Combo", price: 399, discount: 35, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", description: "Nutritious and delicious bowls" },
    { id: 4009, name: "Dessert Sampler", price: 349, discount: 50, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop", description: "Assorted desserts collection" },
    { id: 4010, name: "Beverage Pack - 6 Drinks", price: 299, discount: 40, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "6 Refreshing beverages" },
    { id: 4011, name: "Wraps Combo - 4 Wraps", price: 349, discount: 35, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", description: "Flavorful wrap combinations" },
    { id: 4012, name: "Ice Cream Family Pack", price: 249, discount: 45, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop", description: "Assorted ice cream flavors" }
  ],
  food: [
    { id: 5001, name: "Chicken Biryani", price: 349, discount: 25, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Aromatic basmati rice with tender chicken" },
    { id: 5002, name: "Vegetable Biryani", price: 249, discount: 20, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Aromatic basmati rice with mixed vegetables" },
    { id: 5003, name: "Butter Chicken", price: 329, discount: 20, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop", description: "Creamy tomato-based chicken curry" },
    { id: 5004, name: "Palak Paneer", price: 229, discount: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Cottage cheese in creamy spinach gravy" },
    { id: 5005, name: "Chicken Tikka Masala", price: 359, discount: 25, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", description: "Grilled chicken in creamy spiced gravy" },
    { id: 5006, name: "Dal Makhani", price: 219, discount: 15, image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", description: "Creamy black lentils slow-cooked for hours" },
    { id: 5007, name: "Vegetable Manchurian", price: 239, discount: 20, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Crispy vegetable balls in savory sauce" },
    { id: 5008, name: "Mutton Biryani", price: 449, discount: 30, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", description: "Fragrant rice with succulent mutton pieces" },
    { id: 5009, name: "Chicken 65", price: 279, discount: 15, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", description: "Spicy deep-fried chicken appetizer" },
    { id: 5010, name: "Aloo Gobi", price: 179, discount: 10, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", description: "Potato and cauliflower dry curry" },
    { id: 5011, name: "Paneer Tikka", price: 299, discount: 20, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", description: "Grilled paneer with spices" },
    { id: 5012, name: "Fish Fry", price: 299, discount: 15, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", description: "Crispy fried fish fillet with spices" }
  ],
  drinks: [
    { id: 6001, name: "Fresh Orange Juice", price: 99, discount: 15, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", description: "Freshly squeezed orange juice" },
    { id: 6002, name: "Mango Lassi", price: 129, discount: 20, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop", description: "Sweet yogurt mango drink" },
    { id: 6003, name: "Cold Coffee", price: 149, discount: 15, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", description: "Iced coffee with ice cream" },
    { id: 6004, name: "Chocolate Milkshake", price: 159, discount: 20, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop", description: "Rich chocolate milkshake" },
    { id: 6005, name: "Strawberry Smoothie", price: 139, discount: 15, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Fresh strawberry smoothie" },
    { id: 6006, name: "Buttermilk (Chaas)", price: 49, discount: 10, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Traditional Indian buttermilk" },
    { id: 6007, name: "Fresh Lime Soda", price: 69, discount: 15, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop", description: "Refreshing lime soda" },
    { id: 6008, name: "Watermelon Juice", price: 89, discount: 20, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop", description: "Fresh watermelon juice" },
    { id: 6009, name: "Banana Shake", price: 119, discount: 15, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Creamy banana shake" },
    { id: 6010, name: "Oreo Shake", price: 179, discount: 20, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop", description: "Oreo biscuits blended with ice cream" },
    { id: 6011, name: "Pineapple Juice", price: 99, discount: 15, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop", description: "Fresh pineapple juice" },
    { id: 6012, name: "Apple Juice", price: 109, discount: 15, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop", description: "Fresh apple juice" }
  ],
  smoothies: [
    { id: 7001, name: "Mango Smoothie", price: 149, discount: 20, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "King of fruits smoothie" },
    { id: 7002, name: "Berry Blast Smoothie", price: 169, discount: 25, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Mixed berries smoothie" },
    { id: 7003, name: "Green Detox Smoothie", price: 179, discount: 20, image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop", description: "Healthy green detox blend" },
    { id: 7004, name: "Banana Almond Smoothie", price: 159, discount: 15, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Banana with almonds power drink" },
    { id: 7005, name: "Chocolate Peanut Butter Smoothie", price: 189, discount: 20, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop", description: "Rich chocolate peanut butter blend" },
    { id: 7006, name: "Strawberry Banana Smoothie", price: 149, discount: 15, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Classic strawberry banana combo" },
    { id: 7007, name: "Oatmeal Smoothie", price: 169, discount: 20, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Fiber-rich oatmeal smoothie" },
    { id: 7008, name: "Avocado Smoothie", price: 179, discount: 25, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Creamy avocado goodness" },
    { id: 7009, name: "Pina Colada Smoothie", price: 189, discount: 20, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Tropical coconut pineapple blend" },
    { id: 7010, name: "Protein Power Smoothie", price: 199, discount: 25, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "High protein muscle builder" },
    { id: 7011, name: "Acai Berry Smoothie", price: 199, discount: 20, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Antioxidant-rich acai blend" },
    { id: 7012, name: "Vanilla Chai Smoothie", price: 169, discount: 15, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop", description: "Spiced chai with vanilla" }
  ],
  desserts: [
    { id: 8001, name: "Chocolate Lava Cake", price: 199, discount: 25, image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop", description: "Molten chocolate center cake" },
    { id: 8002, name: "Gulab Jamun", price: 99, discount: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Classic Indian sweet" },
    { id: 8003, name: "Rasgulla", price: 89, discount: 20, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Soft spongy cottage cheese sweet" },
    { id: 8004, name: "Ice Cream Sundae", price: 149, discount: 25, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop", description: "Scoops with toppings" },
    { id: 8005, name: "Brownie with Ice Cream", price: 179, discount: 20, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", description: "Warm brownie with cold ice cream" },
    { id: 8006, name: "Cheesecake", price: 199, discount: 25, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop", description: "Creamy New York cheesecake" },
    { id: 8007, name: "Tiramisu", price: 229, discount: 20, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", description: "Italian coffee-flavored dessert" },
    { id: 8008, name: "Mousse", price: 149, discount: 15, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?h=300&w=400&fit=crop", description: "Light and fluffy chocolate mousse" },
    { id: 8009, name: "Gajar Ka Halwa", price: 129, discount: 20, image: "https://images.unsplash.com/photo0597-df0568f70950?w=400&h=300&fit=c-160105069rop", description: "Carrot pudding dessert" },
    { id: 8010, name: "Badusha", price: 119, discount: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Sweet diamond-shaped pastry" },
    { id: 8011, name: "Jalebi", price: 79, discount: 20, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Crispy syrup-soaked dessert" },
    { id: 8012, name: "Kheer", price: 109, discount: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", description: "Rice pudding with nuts" }
  ]
};

export const additionalItems = {
  biryani: [
    { id: 101, name: "Hyderabadi Chicken Biryani", price: 399, discount: 25, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop", description: "Authentic Hyderabad style with dum" },
    { id: 102, name: "Kolkata Chicken Biryani", price: 379, discount: 20, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=200&fit=crop", description: "Mild spices with potato" },
    { id: 103, name: "Mughlai Chicken Biryani", price: 429, discount: 30, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop", description: "Rich gravy with nuts" }
  ],
  pizza: [
    { id: 201, name: "Tandoori Paneer Pizza", price: 379, discount: 20, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", description: "Indian tandoori flavors" },
    { id: 202, name: "Chicken Golden", price: 489, discount: 30, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop", description: "Chicken with golden corn" }
  ],
  burger: [
    { id: 301, name: "Veggie Burger", price: 159, discount: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", description: "Fresh vegetables" },
    { id: 302, name: "Spicy Paneer Burger", price: 219, discount: 20, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop", description: "Spicy grilled paneer" }
  ]
};
