# System Architecture

## Overview

The AI-Based Civic Issue Monitoring System is designed to automate the detection, assignment, and resolution of civic issues in Vadodara's 19 wards. The system targets VMC employees only, with no citizen login required.

Key components:
- **Mobile App** (React Native): Used by Field Surveyors to capture issues on-site.
- **Backend** (Node.js/Express + Render): Handles API requests, geo-fencing, auto-routing, and workflow automation.
- **AI Service** (YOLOv8 + PyTorch): Processes images to detect and classify civic issues.
- **Database** (PostgreSQL + PostGIS): Stores user data, ward boundaries, issues, and resolution details.
- **Dashboards** (React.js + OpenStreetMap): Web interfaces for Ward Engineers and Admins to monitor and resolve issues.

## Roles
- **Field Surveyor**: Captures issues via mobile app.
- **Ward Engineer**: Reviews assigned issues, uploads resolution images.
- **Admin**: Monitors system-wide statistics and heatmaps.

## Data Flow
1. Field Surveyor captures image and GPS via Mobile App.
2. Mobile App sends data to Backend.
3. Backend performs geo-fencing to assign ward.
4. Backend sends image to AI for issue detection.
5. Issue is stored in Database with auto-assigned department and priority.
6. Ward Engineer receives notification and accesses Dashboard.
7. Engineer uploads resolution image, updating issue status.
8. Admin views analytics on Dashboard.

## Architecture Diagram

```mermaid
graph TD
    A[Field Surveyor Mobile App<br/>React Native + expo-camera] -->|Submit Issue: Image + GPS| B[Backend API Server<br/>Node.js/Express on Render]
    B -->|Geo-fencing<br/>PostGIS spatial queries| C[Ward Boundary Service<br/>PostgreSQL+PostGIS]
    C -->|Ward ID| B
    B -->|Image Analysis| D[AI Issue Detection<br/>YOLOv8 + PyTorch<br/>Local Inference]
    D -->|Issue Type + Confidence| B
    B -->|Store Issue<br/>Local /uploads| E[PostgreSQL Database<br/>Render Free Tier]
    E -->|Assign Issue| F[Ward Engineer Dashboard<br/>React + OpenStreetMap]
    F -->|Upload Resolution Image| B
    B -->|Update Status| E
    E -->|Fetch Stats| G[Admin Dashboard<br/>React + Leaflet Heatmaps]
    G -->|Analytics| E
    
    H[Firebase FCM Free] -->|Push Notifications| A
    H -->|Push Notifications| F
    
    I[Redis Cache<br/>Render Free] -->|Session & Cache| B
```
