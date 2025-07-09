// app/api/photographers/search/route.ts

import { type NextRequest, NextResponse } from "next/server";

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Your comprehensive sample data for 60 photographers
const samplePhotographers = [
  // Wedding Photographers (6)
  {
    id: "1",
    name: "Isabella Rossi",
    location: "Napa Valley, CA",
    mainStyle: "Wedding",
    additionalStyles: ["Portrait", "Fine Art"],
    rating: 4.9,
    reviews: 210,
    price: "$4500",
    profile_image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 38.2975, lng: -122.2869 }
  },
  {
    id: "2",
    name: "Marcus Holloway",
    location: "New York, NY",
    mainStyle: "Wedding",
    additionalStyles: ["Documentary", "Candid"],
    rating: 4.8,
    reviews: 180,
    price: "$5000",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
      id: "3",
      name: "Eleanor Vance",
      location: "Charleston, SC",
      mainStyle: "Wedding",
      additionalStyles: ["Classic", "Romantic"],
      rating: 4.9,
      reviews: 250,
      price: "$4800",
      profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 32.7765, lng: -79.9311 }
  },
  {
      id: "4",
      name: "Javier Morales",
      location: "Miami, FL",
      mainStyle: "Wedding",
      additionalStyles: ["Vibrant", "Beach"],
      rating: 4.7,
      reviews: 150,
      price: "$5500",
      profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 25.7617, lng: -80.1918 }
  },
  {
      id: "5",
      name: "Seraphina Jolie",
      location: "Paris, France",
      mainStyle: "Wedding",
      additionalStyles: ["Editorial", "Luxury"],
      rating: 5.0,
      reviews: 300,
      price: "$7500",
      profile_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
      id: "6",
      name: "Finn Riley",
      location: "Dublin, Ireland",
      mainStyle: "Wedding",
      additionalStyles: ["Storytelling", "Natural"],
      rating: 4.8,
      reviews: 190,
      price: "$4200",
      profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1504754528070-dd0352c8037b?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1518779578900-5151b7e408f6?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 53.3498, lng: -6.2603 }
  },

  // Portrait Photographers (6)
  {
    id: "7",
    name: "Julian Alexander",
    location: "London, UK",
    mainStyle: "Portrait",
    additionalStyles: ["Headshots", "Corporate"],
    rating: 4.9,
    reviews: 320,
    price: "$800",
    profile_image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
      "https://images.unsplash.com/photo-1522228115018-d8213a816294?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 },
  },
  {
    id: "8",
    name: "Cora Lynn",
    location: "Brooklyn, NY",
    mainStyle: "Portrait",
    additionalStyles: ["Lifestyle", "Family"],
    rating: 4.8,
    reviews: 250,
    price: "$650",
    profile_image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.6782, lng: -73.9442 },
  },
  {
    id: "9",
    name: "Adrian Cross",
    location: "Los Angeles, CA",
    mainStyle: "Portrait",
    additionalStyles: ["Cinematic", "Moody"],
    rating: 4.9,
    reviews: 400,
    price: "$950",
    profile_image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: "10",
    name: "Penelope Cruz",
    location: "Madrid, Spain",
    mainStyle: "Portrait",
    additionalStyles: ["Fashion", "Beauty"],
    rating: 5.0,
    reviews: 500,
    price: "$1200",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
      "https://images.unsplash.com/photo-1552695845-4a023719c1e7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.4168, lng: -3.7038 },
  },
  {
    id: "11",
    name: "Silas Blackwood",
    location: "Seattle, WA",
    mainStyle: "Portrait",
    additionalStyles: ["Environmental", "Documentary"],
    rating: 4.7,
    reviews: 180,
    price: "$700",
    profile_image: "https://images.unsplash.com/photo-1533738363-b7f9a261e36c?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
      "https://images.unsplash.com/photo-1520454366363-c701385f5b24?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 47.6062, lng: -122.3321 },
  },
  {
    id: "12",
    name: "Genevieve Monet",
    location: "New Orleans, LA",
    mainStyle: "Portrait",
    additionalStyles: ["Fine Art", "Creative"],
    rating: 4.8,
    reviews: 220,
    price: "$850",
    profile_image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 29.9511, lng: -90.0715 },
  },
  
  // Event Photographers (6)
  {
    id: "13",
    name: "Liam Parker",
    location: "Las Vegas, NV",
    mainStyle: "Event",
    additionalStyles: ["Corporate", "Conference"],
    rating: 4.8,
    reviews: 450,
    price: "$1500",
    profile_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd51725?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 36.1699, lng: -115.1398 }
  },
  {
    id: "14",
    name: "Ava Chen",
    location: "San Francisco, CA",
    mainStyle: "Event",
    additionalStyles: ["Tech", "Startup"],
    rating: 4.9,
    reviews: 380,
    price: "$1800",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
      id: "15",
      name: "Noah Delgado",
      location: "Austin, TX",
      mainStyle: "Event",
      additionalStyles: ["Music", "Festival"],
      rating: 4.7,
      reviews: 300,
      price: "$1200",
      profile_image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1519750092190-c8f7803a6723?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 30.2672, lng: -97.7431 }
  },
  {
      id: "16",
      name: "Mia Rivera",
      location: "Chicago, IL",
      mainStyle: "Event",
      additionalStyles: ["Gala", "Fundraiser"],
      rating: 4.8,
      reviews: 260,
      price: "$1600",
      profile_image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 41.8781, lng: -87.6298 }
  },
  {
      id: "17",
      name: "Ethan Martinez",
      location: "Denver, CO",
      mainStyle: "Event",
      additionalStyles: ["Sporting", "Action"],
      rating: 4.6,
      reviews: 210,
      price: "$1300",
      profile_image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 39.7392, lng: -104.9903 }
  },
  {
      id: "18",
      name: "Zoe Kim",
      location: "Seoul, South Korea",
      mainStyle: "Event",
      additionalStyles: ["Fashion", "Launch Party"],
      rating: 4.9,
      reviews: 320,
      price: "$2000",
      profile_image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces",
      featured_images: [
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop",
      ],
      coordinates: { lat: 37.5665, lng: 126.9780 }
  },

  // Real Estate Photographers (6)
  {
    id: "19",
    name: "Oliver Quinn",
    location: "Los Angeles, CA",
    mainStyle: "Real Estate",
    additionalStyles: ["Architectural", "Interior"],
    rating: 4.9,
    reviews: 500,
    price: "$1000",
    profile_image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "20",
    name: "Charlotte Hayes",
    location: "Hamptons, NY",
    mainStyle: "Real Estate",
    additionalStyles: ["Luxury", "Drone"],
    rating: 5.0,
    reviews: 350,
    price: "$2500",
    profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.9575, lng: -72.3999 }
  },
  {
    id: "21",
    name: "Lucas Grey",
    location: "Phoenix, AZ",
    mainStyle: "Real Estate",
    additionalStyles: ["Commercial", "Twilight"],
    rating: 4.8,
    reviews: 280,
    price: "$800",
    profile_image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 33.4484, lng: -112.0740 }
  },
  {
    id: "22",
    name: "Amelia Sato",
    location: "Tokyo, Japan",
    mainStyle: "Real Estate",
    additionalStyles: ["Minimalist", "Urban"],
    rating: 4.9,
    reviews: 420,
    price: "$1200",
    profile_image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: "23",
    name: "Benjamin Hughes",
    location: "Vancouver, BC",
    mainStyle: "Real Estate",
    additionalStyles: ["Modern", "Lakefront"],
    rating: 4.8,
    reviews: 310,
    price: "$900",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 49.2827, lng: -123.1207 }
  },
  {
    id: "24",
    name: "Sophia Loren",
    location: "Lake Como, Italy",
    mainStyle: "Real Estate",
    additionalStyles: ["Luxury", "Villas"],
    rating: 5.0,
    reviews: 480,
    price: "$3000",
    profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1613977257363-31162d74a4b2?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 45.9733, lng: 9.2555 }
  },
  
  // Fashion Photographers (6)
  {
    id: "25",
    name: "Alexandre Dubois",
    location: "Paris, France",
    mainStyle: "Fashion",
    additionalStyles: ["Editorial", "Haute Couture"],
    rating: 5.0,
    reviews: 600,
    price: "$3500",
    profile_image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1492707892479-7a89489de35e?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: "26",
    name: "Gabriela Hearst",
    location: "New York, NY",
    mainStyle: "Fashion",
    additionalStyles: ["Street Style", "Lookbook"],
    rating: 4.9,
    reviews: 450,
    price: "$2800",
    profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "27",
    name: "Kenji Tanaka",
    location: "Tokyo, Japan",
    mainStyle: "Fashion",
    additionalStyles: ["Avant-Garde", "Commercial"],
    rating: 4.8,
    reviews: 390,
    price: "$2500",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: "28",
    name: "Chiara Ferragni",
    location: "Milan, Italy",
    mainStyle: "Fashion",
    additionalStyles: ["Influencer", "Lifestyle"],
    rating: 4.9,
    reviews: 700,
    price: "$4000",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1552664730-d3077884978e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 45.4642, lng: 9.1900 }
  },
  {
    id: "29",
    name: "Leo Maxwell",
    location: "London, UK",
    mainStyle: "Fashion",
    additionalStyles: ["Menswear", "Classic"],
    rating: 4.7,
    reviews: 320,
    price: "$2200",
    profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1516762689617-e1cff2b4b94f?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: "30",
    name: "Stella McCartney",
    location: "Los Angeles, CA",
    mainStyle: "Fashion",
    additionalStyles: ["Sustainable", "Bohemian"],
    rating: 4.8,
    reviews: 410,
    price: "$3000",
    profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  
  // Product Photographers (6)
  {
    id: "31",
    name: "Carter Reid",
    location: "New York, NY",
    mainStyle: "Product",
    additionalStyles: ["E-commerce", "Studio"],
    rating: 4.9,
    reviews: 600,
    price: "$900",
    profile_image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "32",
    name: "Harper Lee",
    location: "San Francisco, CA",
    mainStyle: "Product",
    additionalStyles: ["Tech", "Gadgets"],
    rating: 4.8,
    reviews: 450,
    price: "$1200",
    profile_image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: "33",
    name: "Miles Davis",
    location: "Chicago, IL",
    mainStyle: "Product",
    additionalStyles: ["Food", "Beverage"],
    rating: 4.9,
    reviews: 520,
    price: "$1000",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1550989460-0d9b6a1695b2?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 41.8781, lng: -87.6298 }
  },
  {
    id: "34",
    name: "Aurora Belle",
    location: "Paris, France",
    mainStyle: "Product",
    additionalStyles: ["Cosmetics", "Beauty"],
    rating: 5.0,
    reviews: 700,
    price: "$1500",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: "35",
    name: "Jasper Stone",
    location: "Portland, OR",
    mainStyle: "Product",
    additionalStyles: ["Handmade", "Craft"],
    rating: 4.8,
    reviews: 380,
    price: "$750",
    profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1524672322238-073a383a8455?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 45.5051, lng: -122.6750 }
  },
  {
    id: "36",
    name: "Clara Oswald",
    location: "London, UK",
    mainStyle: "Product",
    additionalStyles: ["Luxury Goods", "Jewelry"],
    rating: 4.9,
    reviews: 410,
    price: "$1800",
    profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1599351431202-173d8332152a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1531995811006-35e2e9162c25?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  
  // Food Photographers (6)
  {
    id: "37",
    name: "Gideon Ramsay",
    location: "London, UK",
    mainStyle: "Food",
    additionalStyles: ["Restaurant", "Editorial"],
    rating: 5.0,
    reviews: 800,
    price: "$1500",
    profile_image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: "38",
    name: "Sofia Vergara",
    location: "Los Angeles, CA",
    mainStyle: "Food",
    additionalStyles: ["Healthy", "Lifestyle"],
    rating: 4.9,
    reviews: 650,
    price: "$1200",
    profile_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "39",
    name: "Marco Pierre",
    location: "New York, NY",
    mainStyle: "Food",
    additionalStyles: ["Fine Dining", "Michelin"],
    rating: 5.0,
    reviews: 900,
    price: "$2000",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "40",
    name: "Aisha Khan",
    location: "Mumbai, India",
    mainStyle: "Food",
    additionalStyles: ["Street Food", "Cultural"],
    rating: 4.8,
    reviews: 720,
    price: "$800",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: "41",
    name: "Pablo Escobar",
    location: "Mexico City, Mexico",
    mainStyle: "Food",
    additionalStyles: ["Tacos", "Authentic"],
    rating: 4.9,
    reviews: 850,
    price: "$950",
    profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1565299585323-15d11e18935f?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 19.4326, lng: -99.1332 }
  },
  {
    id: "42",
    name: "Amelie Poulain",
    location: "Paris, France",
    mainStyle: "Food",
    additionalStyles: ["Patisserie", "Cafe"],
    rating: 4.9,
    reviews: 780,
    price: "$1300",
    profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1484723051597-62b8a788a660?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1495474472287-4d713b20e473?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  
  // Sports Photographers (6)
  {
    id: "43",
    name: "Jackson Heights",
    location: "Los Angeles, CA",
    mainStyle: "Sports",
    additionalStyles: ["Basketball", "Action"],
    rating: 4.9,
    reviews: 550,
    price: "$1200",
    profile_image: "https://images.unsplash.com/photo-1533738363-b7f9a261e36c?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1517424317454-0a424a9561e1?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "44",
    name: "Chloe Sullivan",
    location: "Denver, CO",
    mainStyle: "Sports",
    additionalStyles: ["Skiing", "Winter Sports"],
    rating: 4.8,
    reviews: 420,
    price: "$1000",
    profile_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1521405920953-b43b8109d375?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1546874136-22442b3b7547?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 39.7392, lng: -104.9903 }
  },
  {
    id: "45",
    name: "Kai Anderson",
    location: "Honolulu, HI",
    mainStyle: "Sports",
    additionalStyles: ["Surfing", "Water Sports"],
    rating: 4.9,
    reviews: 600,
    price: "$1400",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1532651664197-21a48c418ca7?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1502680390402-445e7b25ac39?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 21.3069, lng: -157.8583 }
  },
  {
    id: "46",
    name: "Rafa Nadal",
    location: "Barcelona, Spain",
    mainStyle: "Sports",
    additionalStyles: ["Tennis", "Action"],
    rating: 5.0,
    reviews: 1200,
    price: "$2500",
    profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1552664730-d3077884978e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560089015-74a69f640416?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 41.3851, lng: 2.1734 }
  },
  {
    id: "47",
    name: "Simone Biles",
    location: "Houston, TX",
    mainStyle: "Sports",
    additionalStyles: ["Gymnastics", "Athletics"],
    rating: 4.9,
    reviews: 950,
    price: "$1800",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1565992441121-4b97c5c2136a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1541534401786-2077ed84a95a?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 29.7604, lng: -95.3698 }
  },
  {
    id: "48",
    name: "Bjorn Borg",
    location: "Stockholm, Sweden",
    mainStyle: "Sports",
    additionalStyles: ["Hockey", "Team Sports"],
    rating: 4.8,
    reviews: 680,
    price: "$1600",
    profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1542751371-192b6a378a5d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1530379373916-2d39626a5757?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 59.3293, lng: 18.0686 }
  },
  
  // Street Photographers (6)
  {
    id: "49",
    name: "Vivian Maier",
    location: "Chicago, IL",
    mainStyle: "Street",
    additionalStyles: ["Documentary", "Black and White"],
    rating: 5.0,
    reviews: 1500,
    price: "$2000",
    profile_image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1523474253046-80044731b279?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 41.8781, lng: -87.6298 }
  },
  {
    id: "50",
    name: "Bruce Gilden",
    location: "New York, NY",
    mainStyle: "Street",
    additionalStyles: ["Candid", "Close-up"],
    rating: 4.9,
    reviews: 1200,
    price: "$1800",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "51",
    name: "Garry Winogrand",
    location: "Los Angeles, CA",
    mainStyle: "Street",
    additionalStyles: ["Urban", "Lifestyle"],
    rating: 4.8,
    reviews: 1000,
    price: "$1600",
    profile_image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1533738363-b7f9a261e36c?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "52",
    name: "Daido Moriyama",
    location: "Tokyo, Japan",
    mainStyle: "Street",
    additionalStyles: ["Gritty", "High Contrast"],
    rating: 4.9,
    reviews: 1300,
    price: "$2200",
    profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1513346940221-6f673d962e9a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1516245834210-c4c1427873ab?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: "53",
    name: "Jamal Shabazz",
    location: "Brooklyn, NY",
    mainStyle: "Street",
    additionalStyles: ["Hip Hop", "Culture"],
    rating: 4.8,
    reviews: 950,
    price: "$1400",
    profile_image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1520454366363-c701385f5b24?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.6782, lng: -73.9442 }
  },
  {
    id: "54",
    name: "Martha Cooper",
    location: "New York, NY",
    mainStyle: "Street",
    additionalStyles: ["Graffiti", "Urban Art"],
    rating: 4.9,
    reviews: 1100,
    price: "$1900",
    profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },

  // Pet Photographers (6)
  {
    id: "55",
    name: "Elias Weiss Friedman",
    location: "New York, NY",
    mainStyle: "Pet",
    additionalStyles: ["Dogs", "Candid"],
    rating: 5.0,
    reviews: 2500,
    price: "$500",
    profile_image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "56",
    name: "Carli Davidson",
    location: "Portland, OR",
    mainStyle: "Pet",
    additionalStyles: ["Action", "Studio"],
    rating: 4.9,
    reviews: 1800,
    price: "$600",
    profile_image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1583337130417-2346040878b2?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 45.5051, lng: -122.6750 }
  },
  {
    id: "57",
    name: "Seth Casteel",
    location: "Los Angeles, CA",
    mainStyle: "Pet",
    additionalStyles: ["Underwater", "Dogs"],
    rating: 4.9,
    reviews: 2200,
    price: "$750",
    profile_image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1529927064487-d4b4724a8985?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "58",
    name: "Walter Chandoha",
    location: "New York, NY",
    mainStyle: "Pet",
    additionalStyles: ["Cats", "Classic"],
    rating: 5.0,
    reviews: 3000,
    price: "$450",
    profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1574158622682-e40e6984100d?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "59",
    name: "Rachael Hale",
    location: "Auckland, New Zealand",
    mainStyle: "Pet",
    additionalStyles: ["Cute", "Commercial"],
    rating: 4.8,
    reviews: 1500,
    price: "$550",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: -36.8485, lng: 174.7633 }
  },
  {
    id: "60",
    name: "Tim Flach",
    location: "London, UK",
    mainStyle: "Pet",
    additionalStyles: ["Fine Art", "Studio"],
    rating: 5.0,
    reviews: 2800,
    price: "$900",
    profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    featured_images: [
        "https://images.unsplash.com/photo-1533738363-b7f9a261e36c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1517423568346-d5a23e239d8d?w=400&h=300&fit=crop",
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
];


export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Search API: Starting photographer search...")

    const { searchParams } = new URL(request.url);
    const style = searchParams.get("style");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = Number.parseInt(searchParams.get("radius") || "50");

    console.log("📊 Search API: Received params:", { style, lat, lng, radius });

    let filteredPhotographers = samplePhotographers;

    // Filter by style
    if (style && style !== "all") {
        console.log("🎨 Search API: Filtering by style:", style);
        const beforeCount = filteredPhotographers.length;
        filteredPhotographers = filteredPhotographers.filter(p => p.mainStyle.toLowerCase() === style.toLowerCase());
        console.log(`🎨 Style filter: ${beforeCount} → ${filteredPhotographers.length} photographers`);
    }

    // Filter by location if coordinates are provided
    if (lat && lng) {
        console.log("📍 Search API: Filtering by location within", radius, "miles");
        const searchLat = parseFloat(lat);
        const searchLng = parseFloat(lng);
        const beforeCount = filteredPhotographers.length;
        
        const photographersWithDistance = filteredPhotographers.map(photographer => {
            const distance = calculateDistance(searchLat, searchLng, photographer.coordinates.lat, photographer.coordinates.lng);
            return { ...photographer, distance };
        });

        filteredPhotographers = photographersWithDistance
            .filter(photographer => photographer.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
            
        console.log(`📍 Location filter: ${beforeCount} → ${filteredPhotographers.length} photographers within ${radius} miles`);
    }
    
    // Transform data for a consistent frontend response
    const transformedPhotographers = filteredPhotographers.map((photographer) => ({
      id: photographer.id,
      name: photographer.name,
      location: photographer.location,
      mainStyle: photographer.mainStyle,
      main_style: photographer.mainStyle, // Keep both for compatibility
      additionalStyles: photographer.additionalStyles,
      rating: photographer.rating,
      reviews: photographer.reviews,
      price: photographer.price,
      price_range: photographer.price, // Keep both for compatibility
      profile_image: photographer.profile_image,
      portfolioImage: photographer.profile_image, // Keep both for compatibility
      featured_images: photographer.featured_images,
      portfolioImages: photographer.featured_images, // Keep both for compatibility
      coordinates: photographer.coordinates,
      distance: (photographer as any).distance,
    }));

    console.log(`✅ Search API: Returning ${transformedPhotographers.length} photographers from local data.`);
    return NextResponse.json({
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
      success: true,
      source: 'local-sample-data'
    });
  } catch (error) {
    console.error("💥 Error in photographer search:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}
