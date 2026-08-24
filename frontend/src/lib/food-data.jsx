const categoryMeta = {
  all: {
    label: "All Foods",
    description: "Explore our full delicious menu of wood-fired sourdough pizzas, bagels, burgers & sides.",
    icon: "\u{1F37D}\u{FE0F}"
  },
  pizza: {
    label: "Pizza",
    description: "Wood-fired sourdough crusts topped with the good stuff.",
    icon: "\u{1F355}"
  },
  "pizza-bagels": {
    label: "Pizza Bagels",
    description: "Hand-rolled bagels meets pizzeria magic. Perfect snack-size.",
    icon: "\u{1F96F}"
  },
  burgers: {
    label: "Burgers",
    description: "Smashed Angus patties, gourmet toppings, brioche buns.",
    icon: "\u{1F354}"
  },
  sides: {
    label: "Sides",
    description: "The supporting cast that steals the show.",
    icon: "🍟"
  },
  drink: {
    label: "Drink",
    description: "Refreshing drinks to pair with your meal.",
    icon: "🥤"
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
