const foodItems = [
  // ============ PIZZA ============
  {
    id: "p1",
    name: "Margherita Classica",
    description: "San Marzano tomato, fresh fior di latte mozzarella, basil leaves, extra-virgin olive oil, on a 48-hour fermented sourdough crust.",
    price: 16.5,
    category: "pizza",
    image: "/images/products/001-margherita.jpg",
    tags: ["Bestseller", "Wood-fired"],
    rating: 4.9,
    popular: true,
    vegetarian: true
  },
  {
    id: "p2",
    name: "Pepperoni Diavola",
    description: "Spicy cup-and-char pepperoni, double mozzarella, San Marzano sauce, chili flakes, honey drizzle for the perfect sweet-heat balance.",
    price: 19,
    category: "pizza",
    image: "/images/products/002-pepperoni.jpg",
    tags: ["Spicy", "Crowd favorite"],
    rating: 4.8,
    popular: true,
    spicy: true
  },
  {
    id: "p3",
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola DOP, fontina, parmigiano reggiano, finished with walnuts and a drizzle of truffle honey.",
    price: 21,
    category: "pizza",
    image: "/images/products/006-quattro-formaggi.jpg",
    tags: ["Premium", "Vegetarian"],
    rating: 4.7,
    vegetarian: true
  },
  {
    id: "p4",
    name: "Nonna's Garden",
    description: "Roasted peppers, caramelized onions, saut\xE9ed mushrooms, olives, fresh arugula, balsamic reduction on a thin crust.",
    price: 18.5,
    category: "pizza",
    image: "/images/products/007-nonnas-garden.jpg",
    tags: ["Vegetarian", "Seasonal"],
    rating: 4.6,
    vegetarian: true
  },
  // ============ PIZZA BAGELS ============
  {
    id: "pb1",
    name: "Classic Pizza Bagel",
    description: "Toasted everything bagel topped with San Marzano sauce, melty mozzarella, and a sprinkle of oregano. The original comfort bite.",
    price: 7.5,
    category: "pizza-bagels",
    image: "/images/products/003-classic-pizza-bagel.jpg",
    tags: ["Bestseller", "Quick bite"],
    rating: 4.9,
    popular: true,
    vegetarian: true
  },
  {
    id: "pb2",
    name: "Pepperoni Pizza Bagel",
    description: "Hand-rolled bagel, sweet-tangy tomato sauce, double cheese, and crisp pepperoni cups. Six mini bagels per order.",
    price: 9,
    category: "pizza-bagels",
    image: "/images/products/008-pepperoni-bagel.jpg",
    tags: ["Fan favorite"],
    rating: 4.8,
    popular: true
  },
  {
    id: "pb3",
    name: "Four Cheese Pizza Bagel",
    description: "Mozzarella, cheddar, parmesan, and gorgonzola melted over a sourdough bagel with garlic butter base.",
    price: 8.5,
    category: "pizza-bagels",
    image: "/images/products/009-four-cheese-bagel.jpg",
    tags: ["Vegetarian", "Cheesy"],
    rating: 4.7,
    vegetarian: true
  },
  // ============ BURGERS ============
  {
    id: "b1",
    name: "Flame & Crust Signature",
    description: "Double smashed Angus beef patties, aged cheddar, caramelized onions, house pickles, and smoky bacon jam on a brioche bun.",
    price: 16,
    category: "sides",
    image: "/images/products/004-flame-signature.jpg",
    tags: ["Bestseller", "Double patty"],
    rating: 4.9,
    popular: true
  },
  {
    id: "b2",
    name: "Bacon Blue Deluxe",
    description: "Half-pound Angus patty, crispy bacon, gorgonzola crumbles, saut\xE9ed mushrooms, arugula, and balsamic glaze.",
    price: 17.5,
    category: "burgers",
    image: "/images/products/010-bacon-blue.jpg",
    tags: ["Premium", "Bold flavor"],
    rating: 4.8,
    popular: true
  },
  {
    id: "b3",
    name: "Classic Cheeseburger",
    description: "Single Angus patty, melted American cheese, lettuce, tomato, onion, and our secret sauce on a toasted brioche bun.",
    price: 12,
    category: "burgers",
    image: "/images/products/011-classic-cheeseburger.jpg",
    tags: ["Classic", "Family pick"],
    rating: 4.7
  },
  {
    id: "b4",
    name: "Smokehouse Stack",
    description: "Triple-stack Angus, double bacon, sharp cheddar, onion rings, BBQ sauce, and jalape\xF1o for that perfect kick.",
    price: 19.5,
    category: "burgers",
    image: "/images/products/012-smokehouse-stack.jpg",
    tags: ["Spicy", "Triple stack"],
    rating: 4.8,
    spicy: true
  },
  // ============ SIDES ============
  {
    id: "s1",
    name: "Truffle Parm Fries",
    description: "Hand-cut Yukon Gold fries tossed in truffle oil, parmesan, parsley, and served with garlic aioli dip.",
    price: 8,
    category: "sides",
    image: "/images/products/005-truffle-fries.jpeg",
    tags: ["Bestseller", "Vegetarian"],
    rating: 4.9,
    popular: true,
    vegetarian: true
  },
  {
    id: "s2",
    name: "Buffalo Wings",
    description: "Eight jumbo wings tossed in our house buffalo sauce, served with celery, carrot sticks, and blue cheese dip.",
    price: 12.5,
    category: "sides",
    image: "/images/products/013-buffalo-wings.jpg",
    tags: ["Spicy", "Game day"],
    rating: 4.8,
    spicy: true
  },
  {
    id: "s3",
    name: "Garlic Knots",
    description: "Six pillowy garlic-knot rolls brushed with herb butter, sprinkled with parmesan, and served with marinara dip.",
    price: 6.5,
    category: "sides",
    image: "/images/products/014-garlic-knots.jpg",
    tags: ["Vegetarian", "Shareable"],
    rating: 4.7,
    vegetarian: true
  },
  {
    id: "s4",
    name: "Crispy Onion Rings",
    description: "Sweet onions hand-dipped in buttermilk batter, golden-fried, served with chipotle ranch dip.",
    price: 7,
    category: "sides",
    image: "/images/products/015-onion-rings.jpg",
    tags: ["Vegetarian", "Crispy"],
    rating: 4.6,
    vegetarian: true
  },
  // These fallback items mirror the products stored in MySQL.
  {
    id: "p5",
    name: "Spicy Calabrese",
    description: "Calabrese salami, roasted peppers, mozzarella and chili oil on a wood-fired crust.",
    price: 18.5,
    category: "pizza",
    image: "/images/products/016-spicy-calabrese.jpg",
    tags: ["Spicy", "Wood-fired"],
    rating: 4.8,
    spicy: true
  },
  {
    id: "p6",
    name: "Prosciutto Verde",
    description: "Prosciutto, arugula, mozzarella, shaved parmesan and a balsamic finish.",
    price: 20,
    category: "pizza",
    image: "/images/products/017-prosciutto-verde.webp",
    tags: ["Premium", "Fresh"],
    rating: 4.8
  },
  {
    id: "p7",
    name: "BBQ Chicken Pizza",
    description: "Charred chicken, smoked mozzarella, red onion and house BBQ glaze.",
    price: 19.5,
    category: "pizza",
    image: "/images/products/018-bbq-chicken.jpeg",
    tags: ["Bestseller", "Smoky"],
    rating: 4.8,
    popular: true
  },
  {
    id: "p8",
    name: "Mushroom Truffle Pizza",
    description: "Roasted mushrooms, mozzarella, thyme and truffle cream on a crisp sourdough crust.",
    price: 20.5,
    category: "pizza",
    image: "/images/products/019-mushroom-truffle.jpg",
    tags: ["Premium", "Vegetarian"],
    rating: 4.7,
    vegetarian: true
  },
  {
    id: "pb4",
    name: "Breakfast Pizza Bagel",
    description: "Toasted pizza bagel with egg, mozzarella, bacon and roasted tomato.",
    price: 10,
    category: "pizza-bagels",
    image: "/images/products/020-breakfast-bagel.jpg",
    tags: ["New", "Breakfast"],
    rating: 4.7
  },
  {
    id: "pb5",
    name: "Jalapeno Popper Bagel",
    description: "Cream cheese, cheddar, jalapeno and herbs toasted over a pizza bagel.",
    price: 9.5,
    category: "pizza-bagels",
    image: "/images/products/021-jalapeno-popper-bagel.jpg",
    tags: ["Spicy", "Shareable"],
    rating: 4.7,
    spicy: true,
    vegetarian: true
  },
  {
    id: "pb6",
    name: "Garlic Butter Bagel Bites",
    description: "Mini toasted bagel bites brushed with garlic butter, parmesan and herbs.",
    price: 8.5,
    category: "pizza-bagels",
    image: "/images/products/022-garlic-butter-bites.jpg",
    tags: ["Vegetarian", "Shareable"],
    rating: 4.6,
    vegetarian: true
  },
  {
    id: "b5",
    name: "Crispy Chicken Burger",
    description: "Crispy chicken, slaw, pickles and spicy house sauce on a toasted bun.",
    price: 16.5,
    category: "burgers",
    image: "/images/products/023-crispy-chicken-burger.jpg",
    tags: ["New", "Crispy"],
    rating: 4.8
  },
  {
    id: "b6",
    name: "Mushroom Swiss Burger",
    description: "Angus patty, sauteed mushrooms, Swiss cheese and garlic aioli.",
    price: 17.5,
    category: "sides",
    image: "/images/products/024-mushroom-swiss-burger.jpg",
    tags: ["Premium", "Classic"],
    rating: 4.7
  },
  {
    id: "b7",
    name: "Firecracker Burger",
    description: "Smash patty, pepper jack, crispy onions and firecracker sauce.",
    price: 18,
    category: "sides",
    image: "/images/products/025-firecracker-burger.jpg",
    tags: ["Spicy", "New"],
    rating: 4.8,
    spicy: true
  }
];
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
    icon: "\u{1F35F}"
  }
};
const categoryOrder = [
  "all",
  "pizza",
  "pizza-bagels",
  "burgers",
  "sides"
];
export {
  categoryMeta,
  categoryOrder,
  foodItems
};
