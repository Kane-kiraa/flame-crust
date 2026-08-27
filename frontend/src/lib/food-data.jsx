const categoryMeta = {
  all: {
    label: "All Foods",
    description: "Explore our full delicious menu of wood-fired sourdough pizzas, bagels, burgers & sides.",
    icon: "🍽️",
    badge: "All"
  },
  pizza: {
    label: "Pizza",
    description: "Wood-fired sourdough crusts topped with fresh gourmet ingredients.",
    icon: "🍕",
    badge: "Crusts"
  },
  "pizza-bagels": {
    label: "Pizza Bagels",
    description: "Hand-rolled bagels meet pizzeria magic. Perfect snack-size.",
    icon: "🥯",
    badge: "Bagels"
  },
  burgers: {
    label: "Burgers",
    description: "Smashed Angus patties, gourmet toppings, toasted brioche buns.",
    icon: "🍔",
    badge: "Burgers"
  },
  sides: {
    label: "Sides",
    description: "The crispy, savory supporting cast that steals the show.",
    icon: "🍟",
    badge: "Sides"
  },
  drink: {
    label: "Drinks",
    description: "Refreshing cold drinks & craft beverages to pair with your meal.",
    icon: "🥤",
    badge: "Drinks"
  },
  chicken: {
    label: "Chicken",
    description: "Crispy fried wings, tenders & chef-seasoned chicken specials.",
    icon: "🍗",
    badge: "Chicken"
  },
  beef: {
    label: "Beef",
    description: "Premium cuts and flame-grilled gourmet beef dishes.",
    icon: "🥩",
    badge: "Beef"
  },
  cheese: {
    label: "Cheese",
    description: "Melted mozzarella, artisan cheeses, and cheesy perfection.",
    icon: "🧀",
    badge: "Cheese"
  },
  mushroom: {
    label: "Mushroom",
    description: "Earthy portobello & button mushroom specialties.",
    icon: "🍄",
    badge: "Veg"
  }
};

const categoryOrder = [
  "all",
  "pizza",
  "pizza-bagels",
  "burgers",
  "sides",
  "drink"
];

export {
  categoryMeta,
  categoryOrder
};

