# Project Overview
We are building the frontend for a React Native Farming Advisory App using Expo. 

# Global Rules & Architecture
* Framework: React Native with Expo.
* Navigation: Expo Router (file-based routing).
* Styling: React Native StyleSheet or inline styling.
* Icons: @expo/vector-icons.
* Color Palette: Nature-themed (Greens, earthy browns, clean white backgrounds).
* **CRITICAL RULE:** Do NOT write any API calls, fetch requests, or backend logic. 
* Use hardcoded, dummy state data for all selections.

# Current Mission: PHASE 1 - Onboarding Flow
Build a 3-step onboarding flow. Include a visual "Step X of 3" progress indicator at the top of these screens.

## Screen 1: Language Selection (app/index.js)
* Title: "Choose your language"
* UI: 3 large, touchable buttons or cards for: Bengali, Hindi, English.
* Action: Selecting an option navigates to Screen 2.

## Screen 2: User Persona & Location (app/onboarding/persona.js)
* Title: "Tell us about your farm"
* UI Part 1: A mock dropdown or button to select "State/District" (Use Dummy data like: Punjab, West Bengal, Maharashtra).
* UI Part 2: 3 large selectable cards with icons:
  1. Apartment / Balcony (Tub planting)
  2. Home Gardener (Small land/backyard)
  3. Professional Farmer (Large acreage)
* Action: Pass the selected persona as a route parameter to Screen 3.

## Screen 3: Plant Selection (app/onboarding/plants.js)
* Title: "What are you growing?"
* Logic: Read the persona parameter passed from Screen 2.
* UI: Display a 2-column grid of plant cards (with placeholder images/icons). 
  * If Apartment: Show a hardcoded array of indoor plants (Aloe, Mint, Petunia, Basil).
  * If Gardener: Show a hardcoded array of veggies/flowers (Tomato, Marigold, Chili, Rose).
  * If Professional: Show a hardcoded array of cash crops (Wheat, Rice, Cotton, Sugarcane).
* Rule: The user must be able to select up to 4 items (highlight them when tapped).
* Action: A large "Finish" button at the bottom that triggers `console.log("Onboarding Complete", selectedData)` and navigates to a placeholder Home screen (app/(tabs)/index.js).