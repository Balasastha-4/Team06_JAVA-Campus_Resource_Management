# 🎓 Campus Resource Management System (CRMS)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive, full-stack enterprise solution designed to streamline the management, booking, and allocation of campus resources. This system handles everything from library transactions to large-scale event approvals with a multi-level hierarchical workflow.

---

## 🚀 Key Features

### 🏢 Resource & Asset Management
- **Smart Booking**: Real-time availability checking for Labs, Classrooms, and Auditoriums.
- **Conflict Prevention**: Sophisticated backend logic to prevent double-bookings.
- **Hierarchical Approval**: Integrated workflow where Students/Staff request and HOD/Admins approve.

### 📅 Event Orchestration
- **End-to-End Tracking**: Detailed request flow from initial proposal to final verification.
- **Faculty Assignment**: Assign staff-in-charge with automated availability verification.
- **Robust Routing**: Intelligent department mapping (e.g., handles "IT" vs "Information Technology" seamlessly).

### 📚 Digital Library Integration
- **Catalog Management**: Full CRUD operations for campus books.
- **Borrowing Workflow**: Automated due-date tracking and status updates.

### 🎫 Interactive Dashboards
- **Role-Specific Views**: Tailored experiences for Students, Staff, HODs, and Administrators.
- **Real-time Analytics**: Quick view of active events, pending approvals, and resource statuses.

---

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3 (Java 17)
- **Security**: Spring Security with JWT (Stateless Authentication)
- **Persistence**: Spring Data MongoDB
- **Utilities**: Lombok, Jakarta Validation

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React
- **Networking**: Axios with Interceptors

---

## 📋 Role-Based Access Control (RBAC)

| Feature | Student | Staff | HOD | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Request Resource | ✅ | ✅ | ✅ | ✅ |
| Request Event | ✅ | ✅ | ✅ | ✅ |
| Verify Dept. Requests | ❌ | ❌ | ✅ | ✅ |
| Final Approval | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Library Return | ❌ | ✅ | ❌ | ✅ |

---

## ⚙️ Getting Started

### Prerequisites
- **JDK 17** or higher
- **Node.js 18** or higher
- **MongoDB** (running on `localhost:27017`)

### 📦 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/campus-resource-management.git
   cd campus-resource-management
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Build and run using the provided PowerShell script (Windows)
   .\run-backend-jar.ps1
   # OR using Maven
   mvn spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🔌 API Summary

- `POST /api/auth/signin`: Stateless JWT authentication.
- `GET /api/users/staff/{department}`: Fetch department-specific faculty.
- `GET /api/event-requests/pending`: Fetch actionable items for HOD/Admin.
- `POST /api/bookings`: Create resource reservation.

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

