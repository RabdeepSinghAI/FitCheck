# 💪 FitCheck — Fitness Tracking & Social Competition App

> A cross-platform mobile fitness tracking app with workout logging, leaderboards, challenges, personal trainer support, and role-based dashboards. Built with React Native + Supabase.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## 📌 Overview

FitCheck is a fitness tracking and social competition application that allows users to record workouts, monitor progress, and stay motivated through community-based features. The system solves a common fitness problem — lack of consistency and accountability — by combining workout logging, progress tracking, leaderboards, challenges, and social interaction in one platform.

Built as a team project for CSCI 380 (Intro to Software Engineering) at NYIT using the **Agile Scrum** methodology.

---

## ✨ Features

### 👤 Regular Users
- **Workout Logging** — log exercise type, duration, intensity, calories burned, and notes
- **Progress Tracking** — view total workouts, calories burned, streaks, and performance trends
- **Workout History** — review past sessions and compare performance over time
- **Leaderboards** — compete with friends ranked by workouts, calories, or challenge points
- **Challenges** — join weekly goals, streak challenges, and friend-based competitions
- **Badges & Achievements** — earn rewards for milestones like first workout or weekly streaks
- **Social Features** — add friends, share achievements, view activity feed

### 🏋️ Personal Trainers
- Create and assign custom workout programs to users
- Monitor assigned users' progress and logs
- Provide feedback and recommendations
- Manage trainer profile and specialties

### 🔧 Administrators
- Manage all user and trainer accounts
- Approve or remove personal trainers
- Monitor overall platform activity
- Manage challenges and competitions
- Generate activity and engagement reports

---

## 🏗️ System Architecture
---

## 🗄️ Database Design

Built on **PostgreSQL via Supabase** with a normalized relational schema:

| Table | Key Fields |
|-------|-----------|
| Users | UserID, Username, Password, Status |
| Profiles | First_Name, Last_Name, Bio, Age, Weight, Height, Fitness_Goal |
| Workouts | WorkoutID, Work_Name, Description, Difficulty |
| Exercises | ExerciseID, Exercise_Name, Muscle_Group, Equipment |
| Posts | PostID, Content, Image, Created_At |
| Leaderboards | Rankings by workout count, calories, challenges |
| Reports | Admin-generated activity and engagement reports |

**Security:** Supabase Row-Level Security (RLS) ensures users can only access their own data. Role-Based Access Control (RBAC) enforces privilege levels across Member, Trainer, and Admin roles.

---

## 🔐 Security

- Password hashing and salting via Supabase Auth
- Secure session tokens with configurable expiry
- HTTPS encryption for all API communications
- Row-Level Security (RLS) on all database tables
- Role-based routing at the navigation level — users are routed into entirely separate app flows, not just hidden tabs

---

## 💻 Key Code Examples

### Role-Based Navigation
```typescript
// RootNavigator.tsx
const effectiveRole = profile?.role ?? user?.role ?? null;

return (
  <Stack.Navigator key={stackKey}>
    {!user ? (
      <Stack.Screen name="Auth" component={AuthNavigator} />
    ) : effectiveRole === 'member' ? (
      <Stack.Screen name="Member" component={MemberNavigator} />
    ) : effectiveRole === 'trainer' ? (
      <Stack.Screen name="Trainer" component={TrainerNavigator} />
    ) : (
      <Stack.Screen name="Admin" component={AdminNavigator} />
    )}
  </Stack.Navigator>
);
```

### Workout Logging (Standardized Data Model)
```typescript
// WorkoutTracking.tsx
const submit = (payload: Record<string, any>) => {
  const type = String(payload?.type ?? selectedWorkout ?? 'custom');
  const duration = Number(payload?.durationMinutes ?? payload?.duration ?? 0);
  const workout = {
    id: `${Date.now()}`,
    type, date, duration,
    details: payload,
    summary,
  };
  onLogWorkout?.(workout);
};
```

---

## 🧪 Testing

- **Functionality testing** — all features tested for Members, Trainers, and Admins
- **Authentication testing** — role routing and access control verified
- **Performance testing** — concurrent users, live leaderboard updates
- **Security testing** — password hashing, RLS policies, API encryption
- **Integration testing** — frontend ↔ backend ↔ database communication
- **Cross-platform testing** — verified on both iOS and Android

---

## 📁 File Structure
---

## 👥 Team

| Member | Role |
|--------|------|
| Franklin Vasquez | Team Lead, System Architecture, Backend |
| Flo Amadou Nguevo | Frontend Development, UI Design |
| Anagha Sunny | Frontend Development, UI Design |
| Angelina Do | API Development, Database Design |
| Edrich Silva | Database Integration, Testing |
| **Rabdeep Singh** | **Backend Development, System Testing** |

---

## 🏫 Course

CSCI 380 — Intro to Software Engineering | NYIT | Spring 2026
Professor Maherukh Akhtar
