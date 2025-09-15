# 🌍 WanderLust

A modern, robust web app for sharing and discovering travel experiences. WanderLust lets you create, browse, and review travel listings with ease—built for speed, reliability, and developer happiness.

---

## 🚀 Quick Start
```bash
# Clone the repository
 git clone <repository-url>
 cd wanderLust

# Install dependencies
 npm install

# Set up your environment
# (create a .env file in the root folder)
# ATLASDB_URL=your_mongodb_connection_string
# SECRET=your_session_secret
# NODE_ENV=development
# CLOUD_NAME=your_cloudinary_cloud_name
# CLOUD_API_KEY=your_cloudinary_api_key
# CLOUD_API_SECRET=your_cloudinary_api_secret

# Run the app
 node app.js

# Open in browser
 http://localhost:8080
```

---

## ✨ Feature Highlights
| Feature                | Description                                 |
|------------------------|---------------------------------------------|
| 👤 User Auth           | Sign up, login, and logout                  |
| 📝 Listings            | Create, edit, and delete travel listings    |
| 🖼️ Image Upload        | Cloudinary-powered image storage            |
| 📍 Map Integration     | Mapbox integration for location display     |
| ⭐ Reviews              | Add reviews to listings                     |
| 💬 Flash Messages      | Instant feedback for user actions           |
| 🚦 Error Handling      | Friendly error pages and robust validation  |
| 📱 Responsive Design   | Works great on desktop and mobile           |
| 🔒 Authorization        | Owner-only editing and deletion             |

---

## 🏆 Why WanderLust?
- **Lightning-fast setup** – Get started in minutes
- **Clean, modular codebase** – MVC architecture with separated concerns
- **Modern stack** – Built with Node.js, Express, MongoDB, and EJS
- **Production-ready** – Session management, authentication, and error handling out of the box
- **Developer-friendly** – Clear structure, helpful comments, and robust utilities
- **Image handling** – Cloudinary integration for seamless image uploads
- **Location services** – Mapbox integration for enhanced user experience

---

## 📁 Project Structure
```
wanderLust/
  app.js              # Main app file
  middleware.js       # Authentication & validation middleware
  cloudConfig.js      # Cloudinary configuration
  controllers/        # Business logic (MVC)
    ├── listings.js   # Listing operations
    ├── reviews.js    # Review operations
    └── users.js      # User operations
  models/             # Mongoose models
  routes/             # Express routes
  views/              # EJS templates
  public/             # Static assets (CSS, JS)
  utils/              # Helpers & error handling
  init/               # Initialization scripts
  ...
```

---

## ⚙️ Tech Stack
- **Node.js & Express** – Fast, scalable server
- **MongoDB & Mongoose** – Flexible, modern database
- **Passport.js** – Secure authentication
- **EJS & ejs-mate** – Elegant server-side rendering
- **Cloudinary** – Cloud image storage and optimization
- **Mapbox** – Location and mapping services
- **Multer** – File upload handling
- **Joi** – Data validation
- **connect-mongo, connect-flash** – Sessions & user feedback

---

## 📊 Project Achievements
- **MVC Architecture** – Clean separation of concerns with controllers
- **100% RESTful routes** for listings and reviews
- **Session-based authentication** with Passport.js
- **Middleware-powered** authorization and validation
- **Cloudinary integration** for image uploads and storage
- **Mapbox integration** for location services
- **Flash messaging** for a smooth user experience
- **Error handling** with custom error pages
- **Mobile-ready** with responsive EJS templates
- **Easy deployment** – just set your environment variables and go!

---

## 🤝 Contributing
1. Fork the repo and create your branch
2. Make your changes and add tests if needed
3. Open a pull request – all contributions welcome!

---

## 👨‍💻 Author
**Yogiraj Shinde**  
*B.Tech Computer Engineering*

### 🤝 Let's Connect!
📧 **Email:** yogirajshinde357@gmail.com  
🔗 **LinkedIn:** [@yogiraj-shinde-155354295](https://www.linkedin.com/in/yogiraj-shinde-155354295/)

*Feel free to reach out for collaborations, questions, or just to say hello! 👋* 
