# Project Requirements

## Functional Requirements

### Authentication & Authorization
- **FR1.1** System shall support role-based authentication (Field Surveyor, Ward Engineer, Admin)
- **FR1.2** Users must log in with email and password
- **FR1.3** System shall issue JWT tokens valid for 24 hours
- **FR1.4** Tokens shall be automatically refreshed before expiration
- **FR1.5** System shall implement role-based access control (RBAC)
- **FR1.6** Only authorized users can access their respective features

### Issue Reporting (Field Surveyor)
- **FR2.1** Field Surveyor can access mobile application to report civic issues
- **FR2.2** Mobile app shall capture GPS coordinates (latitude, longitude)
- **FR2.3** Mobile app shall capture images from device camera
- **FR2.4** Mobile app shall auto-detect issue type using AI (with confidence score)
- **FR2.5** Field Surveyor can override AI-detected issue type if needed
- **FR2.6** Mobile app shall determine current ward using geo-fencing (PostGIS)
- **FR2.7** System shall validate image format (JPG, PNG) and size (< 10MB)
- **FR2.8** System shall support offline mode - issues stored locally and synced when online
- **FR2.9** Issue submission shall include metadata: timestamp, surveyor ID, image, coordinates
- **FR2.10** System shall auto-assign priority based on issue type and damage assessment

### Issue Management (Backend)
- **FR3.1** Backend shall receive issue reports from mobile app
- **FR3.2** Backend shall perform geo-fencing to identify ward
- **FR3.3** Backend shall route issue image to AI service for classification
- **FR3.4** Backend shall store issue in database with all metadata
- **FR3.5** Backend shall automatically assign issue to appropriate department
- **FR3.6** Backend shall notify assigned Ward Engineer of new issues
- **FR3.7** Backend shall maintain issue status: pending → assigned → resolved
- **FR3.8** Backend shall log all changes to issue status for audit trail

### Issue Resolution (Ward Engineer)
- **FR4.1** Ward Engineer shall access dashboard to view assigned issues
- **FR4.2** Ward Engineer can filter issues by priority, type, status, ward, date range
- **FR4.3** Ward Engineer can view issue details: image, location, type, priority, status
- **FR4.4** Ward Engineer can accept/claim an assigned issue
- **FR4.5** Ward Engineer can update issue status during resolution
- **FR4.6** Ward Engineer can upload multiple resolution images as proof of completion
- **FR4.7** Ward Engineer can add notes/comments while resolving an issue
- **FR4.8** Ward Engineer can mark issue as resolved with final status update
- **FR4.9** System shall track time taken for resolution (created_at to resolved_at)
- **FR4.10** Ward Engineer can reassign issue if necessary with comments

### Analytics & Reporting (Admin)
- **FR5.1** Admin shall access dashboard to view system-wide statistics
- **FR5.2** Admin can view total issues reported (by status, type, ward, priority)
- **FR5.3** Admin can view resolution rate by ward and department
- **FR5.4** Admin can generate issue heatmaps showing concentration by location
- **FR5.5** Admin can view time-series data of issues (daily, weekly, monthly trends)
- **FR5.6** Admin can export reports in PDF/CSV format
- **FR5.7** Admin can view engineer performance metrics
- **FR5.8** Admin can view system alerts and notifications

### User Management (Admin)
- **FR6.1** Admin can view list of all users with their roles and wards
- **FR6.2** Admin can create new user accounts with role assignment
- **FR6.3** Admin can update user information (name, email, ward, role)
- **FR6.4** Admin can deactivate/delete user accounts
- **FR6.5** Admin can reset user passwords
- **FR6.6** Admin can manage ward assignments for engineers
- **FR6.7** System shall maintain user audit logs

### Ward Management (Admin)
- **FR7.1** Admin can view all 19 wards with geographical boundaries
- **FR7.2** Admin can manage ward-to-department mapping
- **FR7.3** Ward boundaries shall be stored as GeoJSON polygons
- **FR7.4** System shall support dynamic ward boundary updates

### Geo-fencing
- **FR8.1** System shall determine ward from GPS coordinates (PostGIS spatial query)
- **FR8.2** System shall validate coordinates are within Vadodara city limits
- **FR8.3** System shall provide accurate ward identification with < 99% accuracy
- **FR8.4** Geo-fencing shall work with offline cached ward boundaries

### Notifications
- **FR9.1** System shall notify Ward Engineer when new issue is assigned
- **FR9.2** System shall support in-app notifications
- **FR9.3** System shall support email/SMS notifications (optional)
- **FR9.4** Users can customize notification preferences
- **FR9.5** Notifications shall include issue summary, priority, location

### Data Integrity
- **FR10.1** All issue data shall be validated before storage
- **FR10.2** System shall prevent duplicate issue submission within 100m radius in 1 hour
- **FR10.3** System shall maintain referential integrity for all foreign keys
- **FR10.4** System shall implement soft deletes for historical data preservation

---

## Non-Functional Requirements

### Performance
- **NFR1.1** API endpoints shall respond within 500ms (95th percentile)
- **NFR1.2** Image processing/classification shall complete within 5 seconds
- **NFR1.3** Database queries shall execute within 100ms
- **NFR1.4** Mobile app shall load in < 3 seconds on 4G network
- **NFR1.5** Web dashboards shall load in < 2 seconds
- **NFR1.6** System shall support 100+ concurrent users
- **NFR1.7** System shall handle 1000+ daily issue submissions

### Scalability
- **NFR2.1** Backend shall be horizontally scalable using load balancing
- **NFR2.2** Database shall support sharding for future growth
- **NFR2.3** File storage shall be cloud-based (AWS S3/Google Cloud Storage)
- **NFR2.4** System architecture shall support microservices expansion

### Availability & Reliability
- **NFR3.1** System shall have 99.5% uptime SLA
- **NFR3.2** Database shall have automated backup every 24 hours
- **NFR3.3** Database shall support point-in-time recovery
- **NFR3.4** System shall have failover mechanisms for critical components
- **NFR3.5** Mobile app shall work in offline mode with automatic sync

### Security
- **NFR4.1** All data transmission shall use HTTPS/TLS 1.2+
- **NFR4.2** Passwords shall be hashed using bcrypt with salt
- **NFR4.3** Sensitive data (PII) shall be encrypted at rest
- **NFR4.4** System shall implement SQL injection prevention (parameterized queries)
- **NFR4.5** System shall implement CSRF token protection
- **NFR4.6** Image uploads shall be scanned for malware
- **NFR4.7** API requests shall be rate-limited (100 req/minute per user)
- **NFR4.8** System shall validate and sanitize all user inputs
- **NFR4.9** Database shall run with principle of least privilege
- **NFR4.10** All admin actions shall be logged with user and timestamp

### Usability
- **NFR5.1** Mobile app shall work on iOS 12+ and Android 8+
- **NFR5.2** Mobile app shall be intuitive with minimal training
- **NFR5.3** Web dashboards shall be responsive (mobile, tablet, desktop)
- **NFR5.4** UI shall comply with accessibility standards (WCAG 2.1 AA)
- **NFR5.5** All text shall support language localization (English, Gujarati)
- **NFR5.6** Mobile app shall provide clear error messages

### Maintainability
- **NFR6.1** Code shall follow DRY (Don't Repeat Yourself) principle
- **NFR6.2** Code shall include comprehensive documentation and comments
- **NFR6.3** API shall follow RESTful design principles
- **NFR6.4** Database schema shall be normalized to 3rd normal form
- **NFR6.5** Unit test coverage shall be ≥ 80%
- **NFR6.6** All third-party dependencies shall be regularly updated

### Compliance
- **NFR7.1** System shall comply with data protection regulations
- **NFR7.2** System shall maintain audit logs for 1 year minimum
- **NFR7.3** System shall support data export and deletion (right to be forgotten)
- **NFR7.4** Photo/image metadata shall be handled securely

### Deployment & Infrastructure
- **NFR8.1** System shall be containerized using Docker
- **NFR8.2** System shall be deployable using Kubernetes
- **NFR8.3** Infrastructure as Code (IaC) shall be used for deployment
- **NFR8.4** CI/CD pipeline shall support automated testing and deployment

---

## Business Requirements

### Operational
- **BR1** System must support all 19 wards of Vadodara
- **BR2** System shall integrate with existing VMC departments (Water, Roads, Garbage, Cattle Control, Drainage)
- **BR3** System shall be accessible 24/7 with minimal downtime
- **BR4** System must generate weekly/monthly reports for management
- **BR5** System must support data analytics for resource planning

### User Base
- **BR6** Primary users: VMC Field Surveyors and Ward Engineers (~100 concurrent users)
- **BR7** Secondary users: VMC Admin/Management (~10 concurrent users)
- **BR8** System shall support role-based user management

### Issue Tracking
- **BR9** System must track issues from creation to resolution
- **BR10** System must maintain historical data for at least 2 years
- **BR11** System must enable performance analysis by ward and department
- **BR12** System must identify trends and recurring problems

### Cost Considerations
- **BR13** System should use open-source technologies where feasible
- **BR14** Infrastructure costs should be optimized using cloud services
- **BR15** System should be cost-effective to maintain and scale

---

## Constraints

- **CON1** Only VMC employees can use the system (no citizen access)
- **CON2** Mobile app must work offline in areas with poor connectivity
- **CON3** System must handle seasonal variations in issue reporting
- **CON4** Privacy: Images should only be stored with location information (no PII capture)
- **CON5** System must support only English and Gujarati languages
- **CON6** Integration with existing VMC systems may be limited

---

## Priority Levels

- **Critical**: FR1, FR2, FR3, FR4, FR8, NFR1, NFR3, NFR4
- **High**: FR5, FR6, FR7, FR9, NFR2, NFR5, NFR6
- **Medium**: FR10, NFR7, NFR8, BR6-BR8
- **Low**: Language localization, advanced analytics, mobile app native features
