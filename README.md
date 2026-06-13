# EcoTrack – Personal Carbon Footprint Tracker

EcoTrack is a modern, responsive web application designed to help individuals calculate, track, and offset their daily carbon footprint. The application provides interactive forms, dynamic dashboards, community goals, and achievements to motivate users toward green habit creation.

---

## 🌎 Problem Statement

Human-induced greenhouse gas emissions are driving climate change, raising global temperatures, and threatening ecosystems. While many individuals want to help, carbon footprints often feel abstract, complex, and difficult to conceptualize. There is a critical need for an accessible, daily-use tool that translates high-level emission numbers into small, concrete, and actionable lifestyle changes.

---

## 🌱 Solution Description

EcoTrack offers a clean, client-side solution that transforms carbon statistics into personal action items. Users can input their transport modes, energy utilities, diet profiles, and shopping habits to view an instant carbon footprint estimation. 

Once calculated, the app offers custom recommendations, tracks daily carbon-reducing actions (such as cycling or eating plant-based meals), displays long-term progress metrics, and unlocks rewarding digital badges as positive reinforcement.

---

## ✨ Features

1. **Carbon Footprint Calculator**: Enter daily travel distance, primary transport method, monthly electricity use, dietary preferences, plastic waste, and retail consumption to get an instant calculation of your monthly CO2 output.
2. **Dynamic Dashboard Metrics**: View your footprint category (Low, Moderate, or High), total carbon saved over time, total actions completed, best eco habits, and target goal progress.
3. **Daily Action Tracker**: Select positive habits completed each day (e.g., used public transport, avoided plastic, ate plant-based meals) and log them.
4. **Action History Logs**: Chronological review of saved daily actions and their offset values.
5. **Personalized Insights**: Real-time advice cards triggered by high-emission input fields (e.g., suggestions for reducing transport or utilities output).
6. **Eco Challenges**: Join challenges (e.g., 7-Day Plastic Free, Save Electricity Week) that persist in localStorage.
7. **Rewards & Achievements**: Unlock badges (Green Starter, Energy Saver, Plastic-Free Hero, Green Traveler, Climate Champion) based on habits logged in history.
8. **Client-Side Persistence**: Fully powered by `localStorage`—no databases or server accounts needed. Refreshing your browser preserves all statistics.

---

## 🛠️ Tech Stack

- **Frontend Structure**: HTML5 (Semantic Structure)
- **Styling**: Vanilla CSS3 (Custom Glassmorphism, CSS Variables, Responsive Grids, Keyframe Animations)
- **Scripting & Logic**: Vanilla ES6 JavaScript (LocalStorage API, DOM event handling, custom state controller)
- **Icons**: Emoji Glyphs & Inline SVGs

---

## 🚀 How to Run the Project

Since this is a client-side application with no backend dependencies, it can be run directly inside any modern web browser.

1. **Clone or Download** the folder to your local machine.
2. Open the directory containing `index.html`, `style.css`, and `app.js`.
3. Double-click [index.html](index.html) (or right-click and choose **Open with Web Browser**) to launch it.
4. Alternatively, use a development server (such as Visual Studio Code's **Live Server** extension) to view it at `http://127.0.0.1:5500`.

---

## 📊 Carbon Calculation Formulas

### 1. Transportation
$$\text{Transport Emissions (Monthly)} = \text{Daily Distance (km)} \times 30 \times \text{Factor}$$
*Factors (kg CO2 per km)*:
- Walking / Bicycle: `0`
- Bus: `0.05`
- Motorcycle / Bike: `0.09`
- Car: `0.21`
- Train: `0.04`

### 2. Utilities
$$\text{Electricity Emissions} = \text{kWh} \times 0.82 \text{ kg CO2}$$

### 3. Dietary Habits (per Month)
- Vegetarian: `50 kg CO2`
- Mixed Diet: `100 kg CO2`
- Non-Vegetarian: `150 kg CO2`

### 4. Waste & Consumption (per Month)
- **Plastic Usage**: Low (`5 kg`), Medium (`15 kg`), High (`30 kg`)
- **Shopping Habits**: Low (`10 kg`), Medium (`30 kg`), High (`60 kg`)

### 5. Daily Reductions
- Public Transport: `-2.0 kg CO2`
- Walked or Cycled: `-3.0 kg CO2`
- Saved Electricity: `-1.5 kg CO2`
- Avoided Plastic: `-1.0 kg CO2`
- Recycled Waste: `-1.2 kg CO2`
- Plant-based Meal: `-2.5 kg CO2`
- Reusable Bottle: `-0.5 kg CO2`

---

## 🔮 Future Improvements

- **Interactive Charts**: Integrate chart libraries (like Chart.js) to display a pie-chart breakdown of carbon footprints and bar charts showing historical daily savings.
- **Custom Challenges**: Allow users to define their own custom green targets and input personalized carbon saving parameters.
- **Streak & Habit Tracking**: Award special badges for keeping up daily streaks (e.g. logging actions 7 days in a row).
- **Multi-User Profiles**: Allow multiple user profiles on a single device by saving multiple workspace keys.
- **Dark Mode**: Add a sleek toggle to transition the green glassmorphic layout to a dark theme.

---

## 👤 Author

- Created for EcoTrack Carbon Footprint Campaign.
- Designed with 🌱 for a cleaner, greener earth.
