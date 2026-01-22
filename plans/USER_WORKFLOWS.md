# User Roles & Workflows

## User Roles Overview

The system is designed exclusively for VMC (Vadodara Municipal Corporation) employees. There are three primary roles:

| Role | Primary Function | Access Level | Devices |
|------|-----------------|--------------|---------|
| **Field Surveyor** | Identify and report civic issues | Mobile App only | Mobile device (2-wheeler) |
| **Ward Engineer** | Review, verify, and resolve issues | Web Dashboard | Desktop/Laptop |
| **System Administrator** | System monitoring and user management | Web Dashboard | Desktop/Laptop |

---

## Role 1: Field Surveyor

### Overview
Field Surveyors are VMC employees who conduct field surveys using two-wheelers to identify and report civic issues across assigned wards.

### Responsibilities
- Conduct regular field surveys in assigned ward
- Identify civic issues (potholes, garbage, debris, cattle, broken roads, open manholes)
- Capture high-quality images of identified issues
- Accurately record GPS location of issues
- Submit issue reports through mobile app
- Verify issue description and category

### Permissions
- ✅ Access mobile application
- ✅ Capture images
- ✅ Submit issue reports
- ✅ View personal issue history
- ✅ View issue status updates
- ❌ Cannot access web dashboards
- ❌ Cannot resolve issues
- ❌ Cannot view other surveyors' data
- ❌ Cannot access admin functions

### Workflow: Reporting an Issue

**Scenario**: Field Surveyor spots a pothole on Ward 5 Street

1. **Open App**
   - Launch mobile application
   - Auto-authentication if already logged in
   - App displays current location map

2. **Navigate to Issue Report Section**
   - Tap "Report Issue" button
   - App shows issue categories: Pothole, Garbage, Debris, Cattle, Broken Road, Open Manhole

3. **Capture Image**
   - Tap "Take Photo" or "Select from Gallery"
   - App automatically captures GPS coordinates
   - Image is compressed locally (70% quality)
   - Ensure image shows issue clearly

4. **AI Auto-Detection (Optional)**
   - App sends image to backend
   - AI service analyzes image (backend processing, not on device)
   - AI returns detected issue type with confidence score
   - App displays: "Detected: Pothole (92% confidence)"
   - Surveyor can confirm or override detection

5. **Review Issue Details**
   ```
   Issue Type: Pothole [confirmed]
   Location: Ward 5, Street Name
   GPS: 22.3072° N, 73.1812° E
   Date/Time: 13-Jan-2026 10:30 AM
   ```

6. **Submit Report**
   - Tap "Submit Issue"
   - App shows loading indicator
   - Issue sent to backend with all metadata
   - Confirmation message: "Issue #5421 submitted successfully"
   - Issue stored locally for offline access

7. **View Submitted Issues**
   - Tap "My Reports" to view all submitted issues
   - Filter by date, status, type
   - View statuses: Pending → Assigned → Resolved
   - Receive push notifications on status changes

### Key Features for Field Surveyor

**Offline Support**
- Issues can be created offline
- GPS location cached when offline
- Local SQLite database for queued issues
- Auto-sync when internet connectivity restored
- Local image storage with timestamps

**Image Management**
- Automatic compression (JPG format, <5MB)
- Metadata preservation (EXIF data removed for privacy)
- Multi-image support per issue
- Clear image validation (must show issue clearly)

**Notifications**
- Alert when issue is assigned to engineer
- Alert when issue is resolved
- In-app notifications with dismissal option
- No SMS/email by default (future enhancement)

**Issue Tracking**
- View personal issue statistics (submitted, pending, resolved)
- Search by date range or location
- Download issue reports (PDF)

### Training Requirements
- Basic smartphone/app navigation
- How to capture clear photos
- GPS location verification
- Issue category understanding
- Report submission process

### KPIs & Performance Metrics
- Issues submitted per day/week
- Issue accuracy (AI confidence score)
- Average image quality
- On-time submission rate
- Follow-up rate (issues requiring correction)

---

## Role 2: Ward Engineer

### Overview
Ward Engineers are responsible for reviewing, verifying, and resolving civic issues reported within their assigned ward. They coordinate with technical teams to implement solutions.

### Responsibilities
- Review new issues assigned to ward
- Verify issue authenticity and severity
- Plan and execute resolution activities
- Coordinate with technical teams (water, roads, garbage, cattle, drainage)
- Document resolution with before/after images
- Update issue status in system
- Generate resolution reports
- Track resolution timelines

### Permissions
- ✅ Access web dashboard
- ✅ View assigned ward issues
- ✅ Filter and search issues
- ✅ View issue details and images
- ✅ Accept/claim issues
- ✅ Upload resolution images
- ✅ Add notes/comments
- ✅ Close issues
- ✅ View personal performance metrics
- ✅ View assigned issue history
- ❌ Cannot access issues from other wards
- ❌ Cannot view other engineers' data
- ❌ Cannot access system admin functions
- ❌ Cannot modify issue assignment algorithm
- ❌ Cannot delete issues

### Workflow: Resolving an Issue

**Scenario**: Ward Engineer reviews and resolves pothole issue

#### Phase 1: Issue Review & Assignment

1. **Access Dashboard**
   - Log in to web dashboard (http://localhost:3001/engineer)
   - Dashboard displays summary: "3 New Issues, 5 Pending, 2 In Progress"

2. **View New Issues**
   - Click "New Issues" tab
   - List displays issues assigned to engineer's ward
   - Sort by priority: High → Medium → Low
   - Issue card shows:
     ```
     Issue #5421 - Pothole [HIGH]
     Location: Ward 5, Street Name
     Submitted: 13-Jan-2026 10:30 AM
     AI Confidence: 92%
     ```

3. **Review Issue Details**
   - Click issue card to open detailed view
   - Display:
     ```
     Issue ID: 5421
     Type: Pothole
     Status: Assigned
     Priority: High
     Ward: 5
     Location: 22.3072° N, 73.1812° E (map view)
     Submitted By: Surveyor Name (ID: S001)
     Submitted Date: 13-Jan-2026 10:30 AM
     Confidence Score: 92%
     
     [Primary Image] [Zoom] [Open in Maps]
     ```

4. **Field Verification (Optional)**
   - Engineer may visit site to verify issue
   - Capture verification photo
   - Update status: "Verified - Ready for Resolution"
   - Add notes: "Confirmed pothole 2m x 0.5m, safety hazard"

5. **Accept Issue**
   - Click "Accept Issue" button
   - Status changes: Assigned → In Progress
   - Engineer name added to issue
   - Notification sent to surveyor

#### Phase 2: Issue Resolution

6. **Plan Resolution**
   - Department auto-assigned based on issue type:
     - Pothole → Roads Department
     - Garbage → Sanitation Department
     - Cattle → Animal Control Department
     - Drainage → Drainage Department
     - Water Supply → Water Department
   - Engineer coordinates with department
   - Timeline recorded (estimated completion date)

7. **Execute Resolution**
   - Roads department fills/repairs pothole
   - Follow VMC standard procedures
   - Document work progress (optional in-progress updates)

8. **Document Resolution**
   - Engineer captures after-resolution photos
   - Multiple angles showing completed work
   - Quality verification

#### Phase 3: Issue Closure

9. **Upload Resolution Evidence**
   - Click "Upload Resolution Images" button
   - Select 2-3 after-resolution photos
   - Add description: "Pothole filled and compacted, surface smooth"
   - System validates image quality

10. **Final Review & Closure**
    - Review issue resolution:
      ```
      Status Change: In Progress → Resolved
      Resolution Date: 15-Jan-2026 2:15 PM
      Resolution Time: 1.75 days
      Department: Roads
      Cost: [optional field]
      Notes: [resolution details]
      ```
    - Click "Mark as Resolved"
    - Status updated in database
    - Surveyor receives notification

11. **View Resolution Confirmation**
    - Issue appears in "Resolved" tab
    - Summary shows:
      ```
      Issue #5421 - RESOLVED
      Reported: 13-Jan-2026
      Resolved: 15-Jan-2026
      Duration: 1.75 days
      Department: Roads
      ```

### Dashboard Views

#### 1. Overview Dashboard
- **Widget 1**: Issue Statistics
  - Total assigned: 25
  - New (7 days): 8
  - Pending: 12
  - In progress: 5
  - Resolved (7 days): 8

- **Widget 2**: Priority Distribution
  - Bar chart: High (8) | Medium (12) | Low (5)

- **Widget 3**: Ward Map
  - Interactive map showing issue locations
  - Color-coded by priority
  - Click to view issue details

- **Widget 4**: Recent Activity
  - Issue #5421: Resolved 2 hours ago
  - Issue #5420: Assigned 4 hours ago
  - Issue #5419: In Progress since yesterday

#### 2. Issues List View
- Columns: ID | Type | Priority | Status | Location | Submitted | Days Pending
- Filters: Type, Priority, Status, Date Range
- Sort: By Priority, Date, Duration
- Actions: View Details, Accept, Close

#### 3. Issue Detail View
- Full image gallery with zoom
- Metadata: Type, location (map), priority, timestamps
- History log: Created → Assigned → In Progress → Resolved
- Comments/notes section
- Related issues (similar type/location)

#### 4. Performance Metrics
- Issues resolved (current month): 18
- Average resolution time: 1.2 days
- Average per issue: 1.2 days
- Accuracy rate: 98% (AI + engineer verification)
- Department distribution pie chart

### Key Features for Ward Engineer

**Issue Assignment & Filtering**
- Smart filters: Type, priority, status, date range
- Saved filters for quick access
- Full-text search by location or issue ID

**Collaboration**
- Add notes and comments
- Tag other departments
- Email notifications for urgent issues
- @mention other engineers (future)

**Performance Tracking**
- Personal KPIs dashboard
- Resolution time metrics
- Issue category proficiency
- Performance comparison (anonymous)

**Offline Functionality**
- Download assigned issues for offline access
- Sync updates when connectivity restored

### Training Requirements
- System navigation and dashboard usage
- Issue verification procedures
- Photo upload and documentation standards
- Department coordination processes
- Performance metrics interpretation
- Data privacy and security protocols

### KPIs & Performance Metrics
- Average resolution time per issue
- Issue resolution rate (%)
- High-priority resolution time
- On-time resolution percentage
- Issue accuracy verification
- Customer satisfaction (if surveys added)

### Escalation Procedures

**High-Priority Issues (< 24 hours)**
- Automatic notification to senior engineer
- Escalation if not started within 4 hours
- Daily status updates required

**Complex Issues**
- Can request expert consultation
- Document complexity reasons
- Extended deadline approval needed

**Safety Hazards**
- Immediate action required
- Emergency response notification
- Safety officer involvement

---

## Role 3: System Administrator

### Overview
System Administrators oversee the entire civic issue monitoring system, manage users, configure system parameters, and monitor overall performance and health.

### Responsibilities
- User account creation and management
- Role assignment and access control
- Ward configuration and boundary management
- System monitoring and health checks
- Analytics and reporting
- System configuration and settings
- Data backup and recovery
- Issue escalation management
- Performance optimization
- Security and compliance

### Permissions
- ✅ Full access to all dashboards
- ✅ Create/edit/delete user accounts
- ✅ View all issues (all wards, all engineers)
- ✅ View system-wide analytics
- ✅ Access admin settings
- ✅ Manage ward configurations
- ✅ View user activity logs
- ✅ Generate reports
- ✅ Configure system parameters
- ✅ View system health metrics
- ✅ Override issue assignments
- ✅ Delete/archive issues (with audit trail)
- ✅ Access API configuration
- ✅ Manage integrations

### Workflow: Admin Dashboard Usage

**Scenario**: Admin monitoring system performance

#### Task 1: Monitor System Health

1. **Access Admin Dashboard**
   - Log in to http://localhost:3001/admin
   - Dashboard displays key metrics at a glance

2. **System Health Widget**
   ```
   Status: OPERATIONAL (Green)
   - API Server: UP (200ms response)
   - Database: UP (95% health)
   - Redis Cache: UP
   - AI Service: UP
   - Storage: 85% utilized
   - Last Backup: 2 hours ago
   ```

3. **Performance Metrics**
   - Daily issues submitted: 45
   - Average resolution time: 1.3 days
   - Total users: 95
   - Active users today: 67
   - System load: 42%

#### Task 2: Manage Users

4. **View User List**
   - Navigate to "Users" section
   - Table displays:
     ```
     | Name | Email | Role | Ward | Status | Last Active |
     | Raj Kumar | raj@vmc.in | Surveyor | 5 | Active | 2 mins ago |
     | Priya Singh | priya@vmc.in | Engineer | 5 | Active | 1 hour ago |
     | Admin User | admin@vmc.in | Admin | - | Active | 15 mins ago |
     ```

5. **Create New User**
   - Click "Add User" button
   - Form:
     ```
     Name: John Doe
     Email: john@vmc.in
     Role: Field Surveyor
     Ward: 8
     Password: [auto-generated]
     Send Invite: [checkbox]
     ```
   - Submit → User created → Invite email sent

6. **Edit User**
   - Click user row → Edit option
   - Update role, ward, status
   - Changes logged with timestamp

7. **Deactivate/Delete User**
   - Click user → Deactivate
   - History maintained, access revoked
   - Can reactivate if needed

#### Task 3: Analytics & Reporting

8. **View System Analytics**
   - Navigate to "Analytics" dashboard
   - Multiple chart widgets:

   **Chart 1: Issues Over Time**
   - Line graph: Daily issue submissions (30-day view)
   - Y-axis: Number of issues (0-100)
   - X-axis: Dates
   - Filter: Date range, issue type

   **Chart 2: Ward-wise Distribution**
   - Bar chart: Issues by ward
   - Horizontal: Wards (1-19)
   - Vertical: Issue count
   - Sorted: High to low

   **Chart 3: Issue Type Distribution**
   - Pie chart: Percentage by type
   - Pothole: 32%
   - Garbage: 28%
   - Debris: 18%
   - Cattle: 12%
   - Broken Road: 7%
   - Open Manhole: 3%

   **Chart 4: Resolution Statistics**
   - Bar chart: Submitted vs Resolved
   - Trend line: Resolution rate over time
   - Target: 95% resolution rate

   **Chart 5: Priority Analysis**
   - Stacked bar: High/Medium/Low
   - Time to resolution by priority
   - High: 0.8 days avg
   - Medium: 1.5 days avg
   - Low: 3.2 days avg

9. **Generate Reports**
   - Click "Generate Report" button
   - Report type: Daily, Weekly, Monthly, Custom
   - Format: PDF, CSV, Excel
   - Include sections:
     - Executive Summary
     - Statistics & Trends
     - Ward-wise Performance
     - Department Performance
     - Top Issues
     - Recommendations
   - Email report to stakeholders

#### Task 4: Heatmap Visualization

10. **View Issue Heatmap**
    - Navigate to "Heatmap" section
    - Interactive map of Vadodara
    - Color intensity shows issue concentration:
      - Red: High density (>10 issues/area)
      - Orange: Medium (5-10 issues)
      - Yellow: Low (1-5 issues)
      - Green: No issues
    - Click area → Detailed breakdown
    - Filter by: Type, priority, date range, ward

#### Task 5: System Configuration

11. **Configure System Settings**
    - Navigate to "Settings"
    - Sections:
      ```
      General Settings
      - System Name
      - City Boundaries (GeoJSON upload)
      - Timezone
      - Language
      
      Issue Configuration
      - Issue Types (add/edit/delete)
      - Priority Rules (automated assignment)
      - Department Mapping
      
      Notification Settings
      - Email server configuration
      - SMS gateway configuration
      - Notification frequency
      
      Integration Settings
      - OpenStreetMap configuration (free, no API key)
      - Local storage configuration (Render disk)
      - AI Service endpoint
      ```

12. **Ward Management**
    - Upload/update ward boundaries (GeoJSON)
    - Map preview with boundaries
    - Assign engineers per ward
    - Verify geo-fencing logic

#### Task 6: Activity & Audit Logs

13. **View Activity Logs**
    - Navigate to "Activity Logs"
    - Table displays all system actions:
      ```
      | Timestamp | User | Action | Resource | Details |
      | 13-Jan 2:15 PM | Raj Kumar | Created | Issue #5421 | Pothole Ward 5 |
      | 13-Jan 2:20 PM | AI Service | Classified | Issue #5421 | Confidence 92% |
      | 13-Jan 3:00 PM | Priya Singh | Assigned | Issue #5421 | Ward 5 Engineer |
      ```
    - Filter: User, action type, date range, resource type
    - Export: CSV, JSON
    - Retention: 12 months minimum

### Admin Dashboard Widgets

#### 1. Quick Stats
- Total issues: 847
- Resolved (7 days): 156
- Pending: 234
- Critical alerts: 2

#### 2. System Health
- API Server: ✅ UP
- Database: ✅ UP
- Redis: ✅ UP
- AI Service: ✅ UP
- Storage: 85% used

#### 3. Top Issues by Type
- Pothole: 270
- Garbage: 236
- Debris: 152
- Cattle: 101
- Broken Road: 59
- Open Manhole: 25

#### 4. Ward Performance
- Best performer: Ward 3 (avg 0.9 days)
- Needs attention: Ward 18 (avg 3.1 days)
- Most active: Ward 5 (98 issues)

#### 5. User Activity
- Active now: 42 users
- Today: 67 users
- This week: 92 users
- Inactive (>7 days): 3 users

#### 6. System Alerts
- Database disk usage: 85% ⚠️
- Backup scheduled: Tonight 2 AM
- Service updates: 2 pending
- Security notices: None

### Key Features for Admin

**User Management**
- Bulk user import (CSV)
- Role templates (surveyor, engineer)
- Password reset/recovery
- Account activation/deactivation
- Activity tracking per user

**Advanced Analytics**
- Custom date ranges
- Drill-down capabilities (city → ward → location)
- Export to multiple formats
- Scheduled reports (email)
- Trend analysis and forecasting

**System Monitoring**
- Real-time health dashboard
- Alert thresholds configuration
- Performance metrics tracking
- Resource utilization monitoring

**Data Management**
- Automated backups (daily)
- Data export functionality
- Archive old data
- Data retention policies
- GDPR compliance tools

**Security & Compliance**
- Audit logs (12 months)
- User access logs
- API activity monitoring
- Security alerts
- Compliance reporting

### Training Requirements
- System architecture understanding
- Database basics (understanding data structures)
- User management procedures
- Report generation and analysis
- System troubleshooting
- Security best practices
- Backup and recovery procedures
- Compliance and audit procedures

### KPIs & Metrics for Admin

**System Health**
- System uptime: Target 99.5%
- Average API response time: < 500ms
- Database query performance: < 100ms
- Data backup success rate: 100%

**Operational Metrics**
- Daily issues submitted: Trend analysis
- Resolution rate: Target 95%
- Average resolution time: Target < 2 days
- User adoption rate: % active users
- System load: Average CPU/memory utilization

**Quality Metrics**
- AI classification accuracy: > 90%
- Engineer issue verification rate: > 95%
- Data completeness: > 98%
- Error rate: < 0.1%

---

## Cross-Role Workflows

### Issue Lifecycle (Complete Flow)

```
1. FIELD SURVEYOR
   ├─ Identifies issue
   ├─ Captures image + GPS
   └─ Submits report via mobile app
   
2. BACKEND SYSTEM
   ├─ Receives submission
   ├─ Geo-fences to ward
   ├─ Sends to AI service
   ├─ Stores in database
   └─ Notifies assigned engineer
   
3. WARD ENGINEER
   ├─ Receives notification
   ├─ Reviews issue details
   ├─ Field verification (optional)
   ├─ Accepts issue assignment
   ├─ Coordinates resolution
   ├─ Documents with photos
   └─ Closes issue
   
4. ADMIN
   ├─ Monitors resolution
   ├─ Views analytics
   ├─ Tracks performance
   ├─ Generates reports
   └─ Optimizes operations
```

### Escalation Workflow

**High-Priority Issues**
```
Issue Created (Priority: HIGH)
    ↓
Immediate Engineer Notification
    ↓
Required Start: 4 hours
    ↓
Admin Alert if not started
    ↓
Daily Status Updates
    ↓
Completion Target: 24 hours
```

**Complex/Safety Issues**
```
Issue Reported
    ↓
Escalation Flag Set
    ↓
Senior Engineer Notification
    ↓
Expert Team Assignment
    ↓
Extended Timeline Approval
    ↓
Regular Progress Updates
```

---

## Communication & Notifications

### Field Surveyor Notifications
- Issue accepted by engineer ✓
- Issue in progress status ✓
- Issue resolved notification ✓

### Ward Engineer Notifications
- New issue assigned 🔔
- High-priority issue alert 🔔
- Issue needs follow-up ⚠️

### Admin Notifications
- System health warnings ⚠️
- High-priority escalations 🔴
- Critical errors/failures 🔴
- Daily summary report 📊

---

## Security & Data Access

### Data Visibility Rules

| Data | Field Surveyor | Ward Engineer | Admin |
|------|----------------|---------------|-------|
| Own issues | ✅ | - | - |
| Ward issues | - | ✅ | ✅ |
| All issues | - | - | ✅ |
| Other users' data | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ✅ |
| Analytics | ❌ | Limited | ✅ |
| User management | ❌ | ❌ | ✅ |

### Access Control
- Role-based access control (RBAC)
- Ward-based data segregation
- API endpoint restrictions by role
- Frontend route protection
- Database row-level security (RLS)

---

## Training & Support

### User Training Programs

**Field Surveyor Training (2 hours)**
- App installation and login
- Camera and GPS functionality
- Image capture best practices
- Issue category identification
- Submission process
- Offline mode
- Q&A session

**Ward Engineer Training (3 hours)**
- Dashboard navigation
- Issue filtering and search
- Detail view and verification
- Resolution workflow
- Photo upload and documentation
- Performance metrics
- Q&A session

**Admin Training (4 hours)**
- Dashboard overview
- User management
- Analytics and reporting
- System configuration
- Troubleshooting basics
- Security and compliance
- Q&A session

### Support Channels
- In-app help and FAQs
- Email support: support@vmc.in
- Phone support: +91-XXXX-XXXXXX
- Ticketing system
- Video tutorials
- User documentation
