# 🏡 PropertyHub - Real Estate Listing & Recommendation Backend API
#   Youtube Demo : https://www.youtube.com/watch?v=qHNLWOfzxL4
#   POSTMAN DOCS : https://documenter.getpostman.com/view/32871222/2sB2qfAz1m


A powerful, modular backend service for a real estate platform where users can manage properties, mark favorites with priority, and send personalized property recommendations to other users. Built using **TypeScript**, **Node.js**, **Express**, and **MongoDB**, it ensures scalability, maintainability, and extensibility.

---

## 📚 Table of Contents

- [🔧 Tech Stack](#-tech-stack)
- [⚙️ Features](#️-features)
- [📁 Project Structure](#-project-structure)
- [🛠️ Setup Instructions](#️-setup-instructions)
- [🔐 Authentication](#-authentication)
- [🧩 Models](#-models)
  - [Property](#property)
  - [Favorite](#favorite)
  - [Recommendation](#recommendation)
- [📨 API Endpoints](#-api-endpoints)
  - [Auth](#auth)
  - [Properties](#properties)
  - [Favorites](#favorites)
  - [Recommendations](#recommendations)
- [📦 Sample JSON Payloads](#-sample-json-payloads)
- [🎯 Filters & Query Options](#-filters--query-options)
- [🧪 Error Handling](#-error-handling)
- [🛡️ Security & Middleware](#️-security--middleware)
- [📌 Optimizations](#-optimizations)
- [🚀 Deployment Guide](#-deployment-guide)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🔧 Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (middleware injected user context)
- **Utilities**: Custom `ApiError`, `ApiResponse`, validation utils
- **Postman**: API testing suite

---

## ⚙️ Features

### 🏠 Property Listings
- Create, read, update, and delete real estate properties
- Search with filters (type, city, state, tags, etc.)
- Listing types: rent or sale
- Support for amenities, furnishing, ratings, and verification

### ⭐ Favorites System
- Mark/unmark properties as favorites
- Add priority (`low`, `medium`, `high`) and custom labels
- CRUD with filtering by priority or label

### 📤 Property Recommendations
- Recommend properties to other users
- Add personal note
- View sent/received recommendations
- Authorization middleware for secure edits/deletes

---

## 📁 Project Structure

src/
├── controllers/
│ ├── auth.controller.ts
│ ├── property.controller.ts
│ ├── favorite.controller.ts
│ └── recommendation.controller.ts
├── models/
│ ├── property.ts
│ ├── favorite.ts
│ └── recommendation.ts
  └── user
├── middleware/
│ ├── auth.ts
│ ├── isRecommendationOwner.middleware.ts
├── utils/
│ ├── ApiError.ts
│ ├── ApiResponse.ts
│ └── validators.ts
├── routes/
│ ├── property.routes.ts
│ ├── favorite.routes.ts
│ └── recommendation.routes.ts
  └── user.routes.ts
└── server.ts
└── .env


## 🛠️ Setup Instructions

### 🧪 Local Development

```bash
git clone https://github.com/yourusername/propertyhub-backend.git
cd propertyhub-backend
npm install
cp .env.example .env
# Fill in Mongo URI, JWT_SECRET, etc.

npm run dev

🔐 Authentication
This project uses JWT-based authentication. You must attach a Bearer <token> in headers for protected routes. Middleware will populate req.user.

Example header:

makefile
Copy
Edit
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
🧩 Models
🏠 Property

{
  id: String,
  title: String,
  description: String,
  type: "Apartment" | "Villa" | "Studio" | ...,
  price: Number,
  state: String,
  city: String,
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  furnished: "Furnished" | "Semi-Furnished" | "Unfurnished",
  availableFrom: Date,
  listedBy: "Owner" | "Agent",
  colorTheme: String,
  rating: Number,
  isVerified: Boolean,
  listingType: "rent" | "sale"
}
⭐ Favorite

{
  user: ObjectId (ref: User),
  property: ObjectId (ref: Property),
  priority: "low" | "medium" | "high",
  label: String
}
📩 Recommendation

{
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  propertyId: ObjectId (ref: Property),
  note: String
}
📨 API Endpoints
Users
Method	Endpoint	Description
Get	/api/v1/users	Get All users

🔐 Auth
Method	Endpoint	Description
POST	/api/v1/users/register	Register new user
POST	/api/v1/users/login	Authenticate user

🏘️ Properties
Method	Endpoint	Description
POST	/api/v1/properties	Create property
GET	/api/v1/properties	List/search properties
GET	/api/v1/properties/update/:propertyId	Get single property
PUT	/api/v1/properties/delete/:propertyId	Update property
DELETE	/api/v1/properties/:id	Delete property

⭐ Favorites
Method	Endpoint	Description
POST	/api/v1/favorites/create	create property as favorite
GET	/api/v1/favorites	List user favorites (filters)
PATCH	/api/v1/favorites/update/:favoriteId	Update priority/label
DELETE	/api/v1/favorites/delete/:favoriteId	Remove from favorites

📩 Recommendations
Method	Endpoint	Description
POST	/api/v1/recommendations/create	Recommend property to a user
GET	/api/v1/recommendations	View sent/received recommendations
PATCH	/api/v1/recommendations/update/:recommendationId	Update recommendation note
DELETE	/api/v1/recommendations/delete/:recommendationId	Delete recommendation

📦 Sample JSON Payloads
Create Property
json:

{
  "id": "PROP123",
  "title": "Modern 3BHK Apartment",
  "type": "Apartment",
  "price": 7000000,
  "state": "Karnataka",
  "city": "Bangalore",
  "areaSqFt": 1500,
  "bedrooms": 3,
  "bathrooms": 2,
  "furnished": "Furnished",
  "amenities": ["Pool", "Gym"],
  "listedBy": "Agent",
  "availableFrom": "2025-06-01",
  "colorTheme": "#00FFAA",
  "listingType": "sale",
  "rating": 4.5,
  "isVerified": true
}
Add Favorite
json
Copy
Edit
{
  "priority": "high",
  "label": "Investment property"
}
Recommend Property
json
Copy
Edit
{
  "propertyId": "66505ef5abc123",
  "toUserId": "66501def456789",
  "note": "This might suit your needs perfectly!"
}
🎯 Filters & Query Options
Favorites:
GET /api/favorites?priority=high&label=home

Case-insensitive label search

Priority must be one of enum values

Recommendations:
GET /api/recommendations?type=sent or received

🧪 Error Handling
Uses ApiError and ApiResponse for consistency.

ts
Copy
Edit
throw new ApiError(StatusCode.BAD_REQUEST, 'Missing required fields');
ts
Copy
Edit
return new ApiResponse(StatusCode.SUCCESS, data, {}, 'Fetched successfully').send(res);
🛡️ Security & Middleware
JWT Auth Middleware: Attaches req.user

Validation Utilities: validateEmail, validateObjectId, etc.

Authorization Middleware: isRecommendationOwner ensures only senders can edit/delete

📌 Optimizations
MongoDB Indexing on user, property, priority

Modular code for testability

Middleware-based access control

Enum-based validation and status filtering

🚀 Deployment Guide
Set environment variables in .env:

env
Copy
Edit
MONGODB_URI=mongodb+srv://your-uri
JWT_SECRET=your-secret
PORT=5000
Build and start:

bash
Copy
Edit
npm run build
npm start
For production: use Docker, PM2, or a cloud provider.

🤝 Contributing
Fork the repo

Create your feature branch (git checkout -b feature/feature-name)

Commit your changes (git commit -m "Add feature")

Push to the branch (git push origin feature/feature-name)

Open a Pull Request

📄 License
Licensed under the MIT License.

👤 Author
Developed with ❤️ by Your Name

📬 Feedback
Have suggestions? Feel free to create an issue or reach out via email.

