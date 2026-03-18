export const fertilizers = {
    urea: { N: 46, P: 0, K: 0, bagSizeKg: 45 },
    dap: { N: 18, P: 46, K: 0, bagSizeKg: 50 },
    mop: { N: 0, P: 0, K: 60, bagSizeKg: 50 }
};

export default fertilizers;

export const crops = [
    // =========================
    // CEREALS
    // =========================
    {
        id: "rice",
        name: "Rice",
        category: "cereal",
        unit: "kg/ha",
        recommended: { N: 120, P: 60, K: 40 },
        icon: 'rice',
        color: '#e8f5e9'
    },
    {
        id: "wheat",
        name: "Wheat",
        category: "cereal",
        unit: "kg/ha",
        recommended: { N: 100, P: 50, K: 40 },
        icon: 'barley',
        color: '#fff3e0'
    },
    {
        id: "maize",
        name: "Maize",
        category: "cereal",
        unit: "kg/ha",
        recommended: { N: 150, P: 75, K: 40 },
        icon: 'corn',
        color: '#fff9c4'
    },
    {
        id: "barley",
        name: "Barley",
        category: "cereal",
        unit: "kg/ha",
        recommended: { N: 60, P: 30, K: 20 },
        icon: 'barley',
        color: '#fff3e0'
    },
    {
        id: "sorghum",
        name: "Sorghum (Jowar)",
        category: "cereal",
        unit: "kg/ha",
        recommended: { N: 100, P: 50, K: 40 },
        icon: 'corn',
        color: '#fff9c4'
    },
    {
        id: "pearl_millet",
        name: "Pearl Millet (Bajra)",
        category: "cereal",
        unit: "kg/ha",
        recommended: { N: 80, P: 40, K: 40 },
        icon: 'corn',
        color: '#fff9c4'
    },

    // =========================
    // PULSES
    // =========================
    {
        id: "chickpea",
        name: "Chickpea (Gram)",
        category: "pulse",
        unit: "kg/ha",
        recommended: { N: 20, P: 40, K: 20 },
        icon: 'seed',
        color: '#efebe9'
    },
    {
        id: "pigeon_pea",
        name: "Pigeon Pea (Arhar)",
        category: "pulse",
        unit: "kg/ha",
        recommended: { N: 25, P: 50, K: 20 },
        icon: 'seed',
        color: '#efebe9'
    },
    {
        id: "green_gram",
        name: "Green Gram (Moong)",
        category: "pulse",
        unit: "kg/ha",
        recommended: { N: 20, P: 40, K: 20 },
        icon: 'seed',
        color: '#e8f5e9'
    },
    {
        id: "black_gram",
        name: "Black Gram (Urad)",
        category: "pulse",
        unit: "kg/ha",
        recommended: { N: 20, P: 40, K: 20 },
        icon: 'seed',
        color: '#eceff1'
    },

    // =========================
    // OILSEEDS
    // =========================
    {
        id: "mustard",
        name: "Mustard",
        category: "oilseed",
        unit: "kg/ha",
        recommended: { N: 80, P: 40, K: 40 },
        icon: 'flower',
        color: '#fff9c4'
    },
    {
        id: "groundnut",
        name: "Groundnut",
        category: "oilseed",
        unit: "kg/ha",
        recommended: { N: 20, P: 40, K: 40 },
        icon: 'peanut',
        color: '#efebe9'
    },
    {
        id: "soybean",
        name: "Soybean",
        category: "oilseed",
        unit: "kg/ha",
        recommended: { N: 30, P: 60, K: 40 },
        icon: 'seed',
        color: '#fff3e0'
    },
    {
        id: "sunflower",
        name: "Sunflower",
        category: "oilseed",
        unit: "kg/ha",
        recommended: { N: 60, P: 60, K: 40 },
        icon: 'flower',
        color: '#fff9c4'
    },
    {
        id: "sesame",
        name: "Sesame (Til)",
        category: "oilseed",
        unit: "kg/ha",
        recommended: { N: 40, P: 20, K: 20 },
        icon: 'seed',
        color: '#efebe9'
    },

    // =========================
    // VEGETABLES
    // =========================
    {
        id: "tomato",
        name: "Tomato",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 120, P: 60, K: 60 },
        icon: 'fruit-cherries',
        color: '#ffebee'
    },
    {
        id: "potato",
        name: "Potato",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 150, P: 80, K: 100 },
        icon: 'potato',
        color: '#efebe9'
    },
    {
        id: "onion",
        name: "Onion",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 100, P: 50, K: 50 },
        icon: 'onion',
        color: '#f3e5f5'
    },
    {
        id: "brinjal",
        name: "Brinjal (Eggplant)",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 100, P: 50, K: 50 },
        icon: 'eggplant',
        color: '#f3e5f5'
    },
    {
        id: "chilli",
        name: "Chilli",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 100, P: 50, K: 50 },
        icon: 'pepper-hot',
        color: '#ffebee'
    },
    {
        id: "cabbage",
        name: "Cabbage",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 120, P: 60, K: 60 },
        icon: 'cabbage',
        color: '#e8f5e9'
    },
    {
        id: "cauliflower",
        name: "Cauliflower",
        category: "vegetable",
        unit: "kg/ha",
        recommended: { N: 120, P: 60, K: 60 },
        icon: 'flower-outline',
        color: '#f5f5f5'
    },

    // =========================
    // FRUITS
    // =========================
    {
        id: "banana",
        name: "Banana",
        category: "fruit",
        unit: "kg/ha",
        recommended: { N: 200, P: 60, K: 200 },
        icon: 'fruit-watermelon',
        color: '#fff9c4'
    },
    {
        id: "mango",
        name: "Mango (Bearing Orchard)",
        category: "fruit",
        unit: "kg/ha",
        recommended: { N: 100, P: 50, K: 100 },
        icon: 'fruit-citrus',
        color: '#fff3e0'
    },
    {
        id: "guava",
        name: "Guava",
        category: "fruit",
        unit: "kg/ha",
        recommended: { N: 100, P: 40, K: 60 },
        icon: 'fruit-citrus',
        color: '#e8f5e9'
    },
    {
        id: "papaya",
        name: "Papaya",
        category: "fruit",
        unit: "kg/ha",
        recommended: { N: 200, P: 100, K: 200 },
        icon: 'fruit-pineapple',
        color: '#fff3e0'
    },

    // =========================
    // COMMERCIAL / CASH CROPS
    // =========================
    {
        id: "cotton",
        name: "Cotton",
        category: "cash_crop",
        unit: "kg/ha",
        recommended: { N: 150, P: 75, K: 75 },
        icon: 'cloud-outline',
        color: '#f3e5f5'
    },
    {
        id: "sugarcane",
        name: "Sugarcane",
        category: "cash_crop",
        unit: "kg/ha",
        recommended: { N: 250, P: 115, K: 115 },
        icon: 'bamboo',
        color: '#e0f7fa'
    },
    {
        id: "tea",
        name: "Tea",
        category: "plantation",
        unit: "kg/ha",
        recommended: { N: 120, P: 60, K: 120 },
        icon: 'leaf',
        color: '#e8f5e9'
    },
    {
        id: "coffee",
        name: "Coffee",
        category: "plantation",
        unit: "kg/ha",
        recommended: { N: 100, P: 40, K: 100 },
        icon: 'coffee',
        color: '#efebe9'
    }
];
