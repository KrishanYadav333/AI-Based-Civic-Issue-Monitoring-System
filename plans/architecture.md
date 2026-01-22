#SystemArchitecture

##🏆100%FREESTACKCERTIFIED

Thissystemuses**onlyopen-sourcetools**and**RenderFreeTier**deployment-NOpaidservices.

---

##Overview

TheAI-BasedCivicIssueMonitoringSystemisdesignedtoautomatethedetection,assignment,andresolutionofcivicissuesinVadodara's19wards.ThesystemtargetsVMCemployeesonly,withnocitizenloginrequired.

Keycomponents:
-**MobileApp**(ReactNative):UsedbyFieldSurveyorstocaptureissueson-site.
-**Backend**(Node.js/Express+Render):HandlesAPIrequests,geo-fencing,auto-routing,andworkflowautomation.
-**AIService**(YOLOv8+PyTorch):Processesimagestodetectandclassifycivicissues.
-**Database**(PostgreSQL+PostGIS):Storesuserdata,wardboundaries,issues,andresolutiondetails.
-**Dashboards**(React.js+OpenStreetMap):WebinterfacesforWardEngineersandAdminstomonitorandresolveissues.

###FreeStackDetails
-**Maps**:OpenStreetMap+Leaflet(NOGoogleMapsAPI)
-**AI**:YOLOv8localinference(NOCloudVisionAPIs)
-**Storage**:LocaldiskonRender(NOAWSS3)
-**Notifications**:FirebaseFCMFreeTier
-**Deployment**:RenderFreeTier(NOKubernetes,NOAWS/GCP/Azure)

##Roles
-**FieldSurveyor**:Capturesissuesviamobileapp.
-**WardEngineer**:Reviewsassignedissues,uploadsresolutionimages.
-**Admin**:Monitorssystem-widestatisticsandheatmaps.

##DataFlow
1.FieldSurveyorcapturesimageandGPSviaMobileApp.
2.MobileAppsendsdatatoBackend.
3.Backendperformsgeo-fencingtoassignward.
4.BackendsendsimagetoAIforissuedetection.
5.IssueisstoredinDatabasewithauto-assigneddepartmentandpriority.
6.WardEngineerreceivesnotificationandaccessesDashboard.
7.Engineeruploadsresolutionimage,updatingissuestatus.
8.AdminviewsanalyticsonDashboard.

##ArchitectureDiagram(RenderFreeTier-OpenSource)

```mermaid
graphTD
A[FieldSurveyorMobileApp<br/>ReactNative+expo-camera]-->|SubmitIssue:Image+GPS|B[BackendAPIServer<br/>Node.js/ExpressonRender]
B-->|Geo-fencing<br/>PostGISspatialqueries|C[WardBoundaryService<br/>PostgreSQL+PostGIS]
C-->|WardID|B
B-->|ImageAnalysis|D[AIIssueDetection<br/>YOLOv8+PyTorch<br/>LocalInference]
D-->|IssueType+Confidence|B
B-->|StoreIssue<br/>Local/uploads|E[PostgreSQLDatabase<br/>RenderFreeTier]
E-->|AssignIssue|F[WardEngineerDashboard<br/>React+OpenStreetMap]
F-->|UploadResolutionImage|B
B-->|UpdateStatus|E
E-->|FetchStats|G[AdminDashboard<br/>React+LeafletHeatmaps]
G-->|Analytics|E

H[FirebaseFCMFree]-->|PushNotifications|A
H-->|PushNotifications|F

I[RedisCache<br/>RenderFree]-->|Session&Cache|B

styleAfill:#90EE90
styleBfill:#87CEEB
styleDfill:#FFB6C1
styleEfill:#DDA0DD
styleFfill:#F0E68C
styleGfill:#F0E68C
```

###FreeStackComponents:
-✅**Frontend**:ReactNative(mobile),React.js(web),OpenStreetMap+Leaflet
-✅**Backend**:Node.js/Express,Multer(localuploads),JWTauth
-✅**Database**:PostgreSQL14+withPostGISextension
-✅**Caching**:Redis(Renderfreetier)
-✅**AI/ML**:YOLOv8,PyTorch,OpenCV(localinference)
-✅**Deployment**:RenderFreeTier,GitHubActionsCI/CD
-✅**Notifications**:FirebaseFCM(freetier)
-❌**NOTUSED**:AWS,GoogleCloud,Azure,Kubernetes,GoogleMapsAPI,S3

