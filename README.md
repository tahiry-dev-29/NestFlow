---

# 🚀 Nest Flow  

## 📖 Introduction  
**Nest Flow** is a modern subscription management application built with **Angular 18** and **Spring Boot**, optimized for **SSR** and **NgRx Signal Store**.

---

## 📌 Tech Stack

### 🔹 Frontend (Angular 18)

-  **📦 Framework**: Angular 18 (Standalone Components)
-  **🌊 State Management**: NgRx Signal Store
-  **🎨 UI**: TailwindCSS
-  **🚀 Performance**: Angular Signals (`signal()`, `computed()`)
-  **📡 API Calls**: HTTP requests

### 🔹 Backend (Spring Boot)

-  **🔐 Security**: Spring Security & JWT
-  **📦 Database**: MongoDB
-  **📨 Notifications**: Email sending & subscription management
-  **📡 REST API**: Modular RESTful architecture
-  **☕ Java Version**: Java 21

---

## 📂 Project Structure

### 🏗️ Frontend (`nestflow-client`)

```bash
src/
│── app/
│   ├── core/               # Global configuration (interceptors, global services, guards)
│   ├── features/           # Functional modules
│   │   ├── auth/           # Authentication management
│   │   ├── dashboard/      # Dashboard
│   │   ├── subscription/   # Subscription management
│   │   ├── users/          # User management
│   ├── shared/             # Reusable components and directives
│   ├── store/              # Global Store (NgRx Signal Store)
│── tailwind.config.js      # TailwindCSS configuration
│── angular.json            # Angular configuration
│── package.json            # Project dependencies
```

### 🏗️ Backend (`nestflow-api`)

```bash
src/
│── main/java/com/nestflow/
│   ├── authentication/      # Authentication & JWT
│   ├── users/               # User management
│   ├── subscription/        # Subscription management
│   ├── email/               # Email sending service
│   ├── common/              # Exception handling & utilities
│── resources/
│   ├── application.yml      # Project configuration (MongoDB, security)
```

---

## 🚀 Installation & Setup

### 🔹 Prerequisites

-  **Node.js** (v18+)
-  **Angular CLI** (`npm install -g @angular/cli`)
-  **Java 21**
-  **MongoDB** installed & running

### 🔹 Frontend Installation

```bash
git clone https://github.com/tahiry-dev-29/NestFlow.git
cd nestflow-client
npm install
npm start
```

### 🔹 Backend Installation

```bash
cd nestflow-api
mvn clean install
mvn spring-boot:run
```

---

## 🎯 Key Features

✅ **Secure authentication** (JWT, Spring Security)  
✅ **Subscription management** with reminders & notifications  
✅ **Interactive dashboard** using **NgRx Signal Store**  
✅ **Optimized Angular with signals (`signal()`, `computed()`)**  
✅ **User & role management**  


---

## 🛠️ Contributing

Contributions are welcome! Clone the repo, create a branch, and submit your improvements.

```bash
git checkout -b feature-new-feature
git commit -m "Added a new feature"
git push origin feature-new-feature
```

---

## 👨‍💻 Author

**TANNER Tahiry** 🚀  
🔗 [GitHub](https://github.com/tahiry-dev-29)

---
