#ProjectRequirements

##🏆100%FREESTACKCERTIFICATION

Thisprojectisbuiltentirelyusingopen-sourceandfreeserviceswithnopaiddependencies.

###FreeStackConstraints&Certifications

**ALLOWED:**
-✅Open-sourceframeworks(ReactNative,Express,PyTorch,etc.)
-✅Freecloudtiers(Render,Firebase)
-✅PostgreSQL+PostGIS(open-source)
-✅LocalAIinference(YOLOv8)
-✅Localfilestorage
-✅GitHubActions(free)
-✅OpenStreetMap(freemaps)

**NOTALLOWED:**
-❌GoogleMapsAPI
-❌AWS/GCP/Azurepaidservices
-❌CloudVisionAPIs
-❌AWSS3orpaidstorage
-❌PaidMLservices
-❌Kubernetes(usingRenderinstead)
-❌SMSgateways
-❌Mapboxorotherpaidmaps
-❌Proprietarymodels

---

##FunctionalRequirements

###Authentication&Authorization
-**FR1.1**Systemshallsupportrole-basedauthentication(FieldSurveyor,WardEngineer,Admin)
-**FR1.2**Usersmustloginwithemailandpassword
-**FR1.3**SystemshallissueJWTtokensvalidfor24hours
-**FR1.4**Tokensshallbeautomaticallyrefreshedbeforeexpiration
-**FR1.5**Systemshallimplementrole-basedaccesscontrol(RBAC)
-**FR1.6**Onlyauthorizeduserscanaccesstheirrespectivefeatures

###IssueReporting(FieldSurveyor)
-**FR2.1**FieldSurveyorcanaccessmobileapplicationtoreportcivicissues
-**FR2.2**MobileappshallcaptureGPScoordinates(latitude,longitude)
-**FR2.3**Mobileappshallcaptureimagesfromdevicecamera
-**FR2.4**Mobileappshallauto-detectissuetypeusingAI(withconfidencescore)
-**FR2.5**FieldSurveyorcanoverrideAI-detectedissuetypeifneeded
-**FR2.6**Mobileappshalldeterminecurrentwardusinggeo-fencing(PostGIS)
-**FR2.7**Systemshallvalidateimageformat(JPG,PNG)andsize(<10MB)
-**FR2.8**Systemshallsupportofflinemode-issuesstoredlocallyandsyncedwhenonline
-**FR2.9**Issuesubmissionshallincludemetadata:timestamp,surveyorID,image,coordinates
-**FR2.10**Systemshallauto-assignprioritybasedonissuetypeanddamageassessment

###IssueManagement(Backend)
-**FR3.1**Backendshallreceiveissuereportsfrommobileapp
-**FR3.2**Backendshallperformgeo-fencingtoidentifyward
-**FR3.3**BackendshallrouteissueimagetoAIserviceforclassification
-**FR3.4**Backendshallstoreissueindatabasewithallmetadata
-**FR3.5**Backendshallautomaticallyassignissuetoappropriatedepartment
-**FR3.6**BackendshallnotifyassignedWardEngineerofnewissues
-**FR3.7**Backendshallmaintainissuestatus:pending→assigned→resolved
-**FR3.8**Backendshalllogallchangestoissuestatusforaudittrail

###IssueResolution(WardEngineer)
-**FR4.1**WardEngineershallaccessdashboardtoviewassignedissues
-**FR4.2**WardEngineercanfilterissuesbypriority,type,status,ward,daterange
-**FR4.3**WardEngineercanviewissuedetails:image,location,type,priority,status
-**FR4.4**WardEngineercanaccept/claimanassignedissue
-**FR4.5**WardEngineercanupdateissuestatusduringresolution
-**FR4.6**WardEngineercanuploadmultipleresolutionimagesasproofofcompletion
-**FR4.7**WardEngineercanaddnotes/commentswhileresolvinganissue
-**FR4.8**WardEngineercanmarkissueasresolvedwithfinalstatusupdate
-**FR4.9**Systemshalltracktimetakenforresolution(created_attoresolved_at)
-**FR4.10**WardEngineercanreassignissueifnecessarywithcomments

###Analytics&Reporting(Admin)
-**FR5.1**Adminshallaccessdashboardtoviewsystem-widestatistics
-**FR5.2**Admincanviewtotalissuesreported(bystatus,type,ward,priority)
-**FR5.3**Admincanviewresolutionratebywardanddepartment
-**FR5.4**Admincangenerateissueheatmapsshowingconcentrationbylocation
-**FR5.5**Admincanviewtime-seriesdataofissues(daily,weekly,monthlytrends)
-**FR5.6**AdmincanexportreportsinPDF/CSVformat
-**FR5.7**Admincanviewengineerperformancemetrics
-**FR5.8**Admincanviewsystemalertsandnotifications

###UserManagement(Admin)
-**FR6.1**Admincanviewlistofalluserswiththeirrolesandwards
-**FR6.2**Admincancreatenewuseraccountswithroleassignment
-**FR6.3**Admincanupdateuserinformation(name,email,ward,role)
-**FR6.4**Admincandeactivate/deleteuseraccounts
-**FR6.5**Admincanresetuserpasswords
-**FR6.6**Admincanmanagewardassignmentsforengineers
-**FR6.7**Systemshallmaintainuserauditlogs

###WardManagement(Admin)
-**FR7.1**Admincanviewall19wardswithgeographicalboundaries
-**FR7.2**Admincanmanageward-to-departmentmapping
-**FR7.3**WardboundariesshallbestoredasGeoJSONpolygons
-**FR7.4**Systemshallsupportdynamicwardboundaryupdates

###Geo-fencing
-**FR8.1**SystemshalldeterminewardfromGPScoordinates(PostGISspatialquery)
-**FR8.2**SystemshallvalidatecoordinatesarewithinVadodaracitylimits
-**FR8.3**Systemshallprovideaccuratewardidentificationwith<99%accuracy
-**FR8.4**Geo-fencingshallworkwithofflinecachedwardboundaries

###Notifications
-**FR9.1**SystemshallnotifyWardEngineerwhennewissueisassigned
-**FR9.2**Systemshallsupportin-appnotifications
-**FR9.3**Systemshallsupportemail/SMSnotifications(optional)
-**FR9.4**Userscancustomizenotificationpreferences
-**FR9.5**Notificationsshallincludeissuesummary,priority,location

###DataIntegrity
-**FR10.1**Allissuedatashallbevalidatedbeforestorage
-**FR10.2**Systemshallpreventduplicateissuesubmissionwithin100mradiusin1hour
-**FR10.3**Systemshallmaintainreferentialintegrityforallforeignkeys
-**FR10.4**Systemshallimplementsoftdeletesforhistoricaldatapreservation

---

##Non-FunctionalRequirements(WithFree-TierConstraints)

###Performance(FreeTierOptimized)
-**NFR1.1**APIendpointsshallrespondwithin1-2seconds(freetieracceptable)
-**NFR1.2**Imageprocessing/classificationshallcompletewithin10seconds(localinference)
-**NFR1.3**Databasequeriesshallexecutewithin200ms(Renderfreetier)
-**NFR1.4**Mobileappshallloadin<5secondson4Gnetwork
-**NFR1.5**Webdashboardsshallloadin<3seconds
-**NFR1.6**Systemshallsupport10-50concurrentusers(Renderfreelimits)
-**NFR1.7**Systemshallhandle100-200dailyissuesubmissionsinitially

###Scalability(Free-TierFriendly)
-**NFR2.1**BackenddeployableonRenderFreeTierinitially
-**NFR2.2**ScalabletopaidRendertierswhenneeded(novendorlock-in)
-**NFR2.3**Localdiskstoragewithautomatedcleanup
-**NFR2.4**Simplearchitecture(nomicroservicesinitially)

###Availability&Reliability(FreeTier)
-**NFR3.1**Systemshallhavebest-effortavailability(freetier)
-**NFR3.2**Databasebackupsencouraged(manualorscheduled)
-**NFR3.3**Mobileappshallworkinofflinemodewithautomaticsync
-**NFR3.4**Datapersistenceensureddespiteserverrestarts

###Security
-**NFR4.1**AlldatatransmissionshalluseHTTPS/TLS1.2+(Renderprovides)
-**NFR4.2**Passwordsshallbehashedusingbcryptwithsalt
-**NFR4.3**JWTtokensforstatelessauthentication
-**NFR4.4**SQLinjectionpreventionviaparameterizedqueries(PrismaORM)
-**NFR4.5**CORSconfiguredforallowedoriginsonly
-**NFR4.6**Imageuploadsshallbescannedformalware
-**NFR4.7**APIrequestsshallberate-limited(100req/minuteperuser)
-**NFR4.8**Systemshallvalidateandsanitizealluserinputs
-**NFR4.9**Databaseshallrunwithprincipleofleastprivilege
-**NFR4.10**Alladminactionsshallbeloggedwithuserandtimestamp

###Usability
-**NFR5.1**MobileappshallworkoniOS12+andAndroid8+
-**NFR5.2**Mobileappshallbeintuitivewithminimaltraining
-**NFR5.3**Webdashboardsshallberesponsive(mobile,tablet,desktop)
-**NFR5.4**UIshallcomplywithaccessibilitystandards(WCAG2.1AA)
-**NFR5.5**Alltextshallsupportlanguagelocalization(English,Gujarati)
-**NFR5.6**Mobileappshallprovideclearerrormessages

###Maintainability
-**NFR6.1**CodeshallfollowDRY(Don'tRepeatYourself)principle
-**NFR6.2**Codeshallincludecomprehensivedocumentationandcomments
-**NFR6.3**APIshallfollowRESTfuldesignprinciples
-**NFR6.4**Databaseschemashallbenormalizedto3rdnormalform
-**NFR6.5**Unittestcoverageshallbe≥80%
-**NFR6.6**Allthird-partydependenciesshallberegularlyupdated

###Compliance
-**NFR7.1**Systemshallcomplywithdataprotectionregulations
-**NFR7.2**Systemshallmaintainauditlogsfor1yearminimum
-**NFR7.3**Systemshallsupportdataexportanddeletion(righttobeforgotten)
-**NFR7.4**Photo/imagemetadatashallbehandledsecurely

###Deployment&Infrastructure
-**NFR8.1**SystemshallbecontainerizedusingDocker
-**NFR8.2**SystemshallbedeployableusingKubernetes
-**NFR8.3**InfrastructureasCode(IaC)shallbeusedfordeployment
-**NFR8.4**CI/CDpipelineshallsupportautomatedtestinganddeployment

---

##BusinessRequirements

###Operational
-**BR1**Systemmustsupportall19wardsofVadodara
-**BR2**SystemshallintegratewithexistingVMCdepartments(Water,Roads,Garbage,CattleControl,Drainage)
-**BR3**Systemshallbeaccessible24/7withminimaldowntime
-**BR4**Systemmustgenerateweekly/monthlyreportsformanagement
-**BR5**Systemmustsupportdataanalyticsforresourceplanning

###UserBase
-**BR6**Primaryusers:VMCFieldSurveyorsandWardEngineers(~100concurrentusers)
-**BR7**Secondaryusers:VMCAdmin/Management(~10concurrentusers)
-**BR8**Systemshallsupportrole-basedusermanagement

###IssueTracking
-**BR9**Systemmusttrackissuesfromcreationtoresolution
-**BR10**Systemmustmaintainhistoricaldataforatleast2years
-**BR11**Systemmustenableperformanceanalysisbywardanddepartment
-**BR12**Systemmustidentifytrendsandrecurringproblems

###CostConsiderations
-**BR13**Systemshoulduseopen-sourcetechnologieswherefeasible
-**BR14**Infrastructurecostsshouldbeoptimizedusingcloudservices
-**BR15**Systemshouldbecost-effectivetomaintainandscale

---

##Constraints

-**CON1**OnlyVMCemployeescanusethesystem(nocitizenaccess)
-**CON2**Mobileappmustworkofflineinareaswithpoorconnectivity
-**CON3**Systemmusthandleseasonalvariationsinissuereporting
-**CON4**Privacy:Imagesshouldonlybestoredwithlocationinformation(noPIIcapture)
-**CON5**SystemmustsupportonlyEnglishandGujaratilanguages
-**CON6**IntegrationwithexistingVMCsystemsmaybelimited

---

##PriorityLevels

-**Critical**:FR1,FR2,FR3,FR4,FR8,NFR1,NFR3,NFR4
-**High**:FR5,FR6,FR7,FR9,NFR2,NFR5,NFR6
-**Medium**:FR10,NFR7,NFR8,BR6-BR8
-**Low**:Languagelocalization,advancedanalytics,mobileappnativefeatures


