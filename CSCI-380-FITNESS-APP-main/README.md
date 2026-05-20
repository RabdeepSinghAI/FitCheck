## Description

**FitCheck** is a cross-platform mobile app built with **Expo** and **React Native** (TypeScript) for **CSCI 380**. It supports multiple user roles (**members** and **trainers**) behind a shared authentication layer.

- **Members**: log food (manual + photo→AI), see daily calories vs goal, weekly history, edit profile (age/weight/height/activity/goal).
- **Trainers**: view assigned members, view member food logs + calorie trends, set a per-member daily calorie goal + note (auto-suggested via BMR/TDEE).

This app uses **Supabase Auth** + a `profiles` table for **role-based access control (RBAC)**.

### Tech stack

- Expo ~54, React Native, TypeScript  
- React Navigation, Async Storage, gesture handler & safe area  

### Run locally

```bash
npm install
npm start
```

Then open the project in the Expo dev tools and run on iOS, Android, or web as needed.
