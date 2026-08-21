require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Package = require('./models/Package');
const User = require('./models/User');

const categories = [
  { name: 'Beach', slug: 'beach', icon: '🏖️' },
  { name: 'Mountain', slug: 'mountain', icon: '⛰️' },
  { name: 'Adventure', slug: 'adventure', icon: '🧗' },
  { name: 'Honeymoon', slug: 'honeymoon', icon: '💑' },
  { name: 'Family', slug: 'family', icon: '👨‍👩‍👧' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DBNAME });
  console.log('Connected. Clearing old data...');

  await Category.deleteMany({});
  await Package.deleteMany({});
  await User.deleteMany({ email: { $in: ['owner@demo.com', 'admin@demo.com', 'tourist@demo.com'] } });

  // Demo accounts so you can log in immediately after seeding.
  // Passwords are hashed automatically by the User model's pre-save hook.
  const demoOwner = await User.create({ name: 'Demo Owner', email: 'owner@demo.com', password: 'password123', role: 'owner' });
  await User.create({ name: 'Demo Admin', email: 'admin@demo.com', password: 'password123', role: 'admin' });
  await User.create({ name: 'Demo Tourist', email: 'tourist@demo.com', password: 'password123', role: 'tourist' });

  const createdCategories = await Category.insertMany(categories);
  const byCategory = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]));

  const packages = [
    {
      title: 'Goa Beach Getaway',
      slug: 'goa-beach-getaway',
      description: 'A relaxing 4-day escape to the sandy beaches of Goa with water sports and beach shacks.',
      shortDescription: 'Sun, sand, and seafood in Goa.',
      images: ['https://picsum.photos/seed/goa1/800/500', 'https://picsum.photos/seed/goa2/800/500'],
      price: 15999,
      discountPrice: 12999,
      duration: '4 Days / 3 Nights',
      location: 'Goa, India',
      category: byCategory.beach,
      owner: demoOwner._id,
      status: "published",
      itinerary: [
        { day: 1, title: 'Arrival & Beach Time', description: 'Check-in and relax at Baga Beach.' },
        { day: 2, title: 'Water Sports', description: 'Parasailing, jet-ski, banana boat.' },
        { day: 3, title: 'Old Goa Tour', description: 'Visit churches and local markets.' },
        { day: 4, title: 'Departure', description: 'Check-out and travel back.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'Airport transfers'],
      exclusions: ['Flights', 'Personal expenses'],
      rating: 4.5,
      reviewCount: 128,
      isFeatured: true,
    },
    {
      title: 'Manali Mountain Retreat',
      slug: 'manali-mountain-retreat',
      description: 'Explore the snow-capped peaks and valleys of Manali on this 5-day adventure trip.',
      shortDescription: 'Snow, valleys, and mountain air.',
      images: ['https://picsum.photos/seed/manali1/800/500', 'https://picsum.photos/seed/manali2/800/500'],
      price: 18999,
      duration: '5 Days / 4 Nights',
      location: 'Manali, Himachal Pradesh',
      category: byCategory.mountain,
      owner: demoOwner._id,
      status: "published",
      itinerary: [
        { day: 1, title: 'Arrival in Manali', description: 'Check-in and local sightseeing.' },
        { day: 2, title: 'Solang Valley', description: 'Adventure sports and cable car ride.' },
        { day: 3, title: 'Rohtang Pass', description: 'Snow trek and photography.' },
        { day: 4, title: 'Old Manali', description: 'Cafes and riverside walk.' },
        { day: 5, title: 'Departure', description: 'Check-out and travel back.' },
      ],
      inclusions: ['Hotel stay', 'All meals', 'Sightseeing cab'],
      exclusions: ['Flights', 'Adventure activity charges'],
      rating: 4.7,
      reviewCount: 96,
      isFeatured: true,
    },
    {
      title: 'Rishikesh Adventure Camp',
      slug: 'rishikesh-adventure-camp',
      description: 'River rafting, camping, and bungee jumping in the adventure capital of India.',
      shortDescription: 'Rafting, camping, and thrills.',
      images: ['https://picsum.photos/seed/rishikesh1/800/500'],
      price: 8999,
      duration: '3 Days / 2 Nights',
      location: 'Rishikesh, Uttarakhand',
      category: byCategory.adventure,
      owner: demoOwner._id,
      status: "published",
      itinerary: [
        { day: 1, title: 'River Rafting', description: '16km rafting on the Ganges.' },
        { day: 2, title: 'Camping & Bonfire', description: 'Riverside camp stay with bonfire.' },
        { day: 3, title: 'Bungee Jumping', description: "India's highest bungee jump and departure." },
      ],
      inclusions: ['Camping stay', 'Rafting charges', 'Meals'],
      exclusions: ['Bungee jumping fee', 'Travel to Rishikesh'],
      rating: 4.6,
      reviewCount: 74,
      isFeatured: true,
    },
    {
      title: 'Udaipur Honeymoon Special',
      slug: 'udaipur-honeymoon-special',
      description: 'A romantic 4-day package in the City of Lakes with candlelight dinners and boat rides.',
      shortDescription: 'Romance by the lakes of Udaipur.',
      images: ['https://picsum.photos/seed/udaipur1/800/500'],
      price: 24999,
      duration: '4 Days / 3 Nights',
      location: 'Udaipur, Rajasthan',
      category: byCategory.honeymoon,
      owner: demoOwner._id,
      status: "published",
      itinerary: [
        { day: 1, title: 'Arrival & Lake Pichola', description: 'Check-in and evening boat ride.' },
        { day: 2, title: 'City Palace Tour', description: 'Guided tour and candlelight dinner.' },
        { day: 3, title: 'Leisure Day', description: 'Spa and couple activities.' },
        { day: 4, title: 'Departure', description: 'Check-out and travel back.' },
      ],
      inclusions: ['Luxury hotel stay', 'Candlelight dinner', 'Boat ride'],
      exclusions: ['Flights', 'Spa charges'],
      rating: 4.8,
      reviewCount: 52,
      isFeatured: false,
    },
    {
      title: 'Kerala Family Backwaters',
      slug: 'kerala-family-backwaters',
      description: 'A relaxed family trip through the backwaters of Kerala on a traditional houseboat.',
      shortDescription: 'Houseboats and family fun.',
      images: ['https://picsum.photos/seed/kerala1/800/500'],
      price: 21999,
      duration: '5 Days / 4 Nights',
      location: 'Alleppey, Kerala',
      category: byCategory.family,
      owner: demoOwner._id,
      status: "published",
      itinerary: [
        { day: 1, title: 'Arrival in Kochi', description: 'Check-in and local sightseeing.' },
        { day: 2, title: 'Houseboat Stay', description: 'Overnight houseboat cruise in Alleppey.' },
        { day: 3, title: 'Munnar Tea Gardens', description: 'Scenic drive and tea plantation visit.' },
        { day: 4, title: 'Wildlife Sanctuary', description: 'Family-friendly nature walk.' },
        { day: 5, title: 'Departure', description: 'Check-out and travel back.' },
      ],
      inclusions: ['Houseboat stay', 'Hotel stay', 'All meals'],
      exclusions: ['Flights', 'Personal expenses'],
      rating: 4.4,
      reviewCount: 61,
      isFeatured: false,
    },
  ];

  await Package.insertMany(packages);
  console.log(`Seeded ${createdCategories.length} categories and ${packages.length} published packages.`);
  console.log('Demo logins (password: password123):');
  console.log('  Owner:   owner@demo.com');
  console.log('  Admin:   admin@demo.com');
  console.log('  Tourist: tourist@demo.com');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
