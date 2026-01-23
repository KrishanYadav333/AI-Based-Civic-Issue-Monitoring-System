# API List

This document outlines the basic API endpoints required for the system. These will be expanded in later phases.

## Authentication
- POST /api/auth/login - Employee login (returns JWT token)

## Issue Management
- POST /api/issues - Submit new issue
  - Body: { image: file, latitude: float, longitude: float }
  - Response: { issue_id, ward_id, issue_type, priority }
- GET /api/issues/{id} - Get issue details
- POST /api/issues/{id}/resolve - Upload resolution image
  - Body: { resolution_image: file }
  - Response: { status: 'resolved' }

## Ward and Geo-fencing
- GET /api/wards - List all wards
- GET /api/wards/{lat}/{lng} - Get ward ID from coordinates

## Dashboard APIs
- GET /api/dashboard/engineer/{engineer_id} - Get assigned issues for engineer
  - Query: priority (optional filter)
- GET /api/dashboard/admin/stats - Get system statistics
  - Response: { total_issues, resolved_issues, pending_issues, ward_stats: [] }
- GET /api/dashboard/admin/heatmap - Get issue heatmap data

## User Management (Admin only)
- GET /api/users - List users
- POST /api/users - Create user
- PUT /api/users/{id} - Update user

All endpoints require JWT authentication except login.