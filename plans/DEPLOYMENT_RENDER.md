#DeploymentGuide-RenderFreeTier(100%FreeStack)

##100%FREESTACKDEPLOYMENT

Thisguidecoversdeploymententirelyusing**RenderFreeTier**-NOAWS,NOKubernetes,NOpaidinfrastructure.

---

##ArchitectureOverview(RenderFreeTier)

```
Internet(Users)
Gô
RenderWebService(BackendAPI)
Gö£GöGöNode.js/ExpressServer
Gö£GöGöAIBackgroundWorker(Python/FastAPI)
GööGöGöLocalDiskStorage
Gô
RenderPostgreSQLDatabase(FreeTier)
Gö£GöGöPostgreSQL14+
GööGöGöPostGIS(geo-spatialqueries)
Gô
RenderRedis(FreeTier)
GööGöGöCaching&Sessions
Gô
FirebaseFCM(FreeTier)
GööGöGöPushNotifications
Gô
OpenStreetMap/Nominatim(Free)
GööGöGöMaps&ReverseGeocoding
```

---

##Prerequisites

###AccountsRequired(AllFREE)
-G£àRender.comaccount(freetier)
-G£àGitHubaccount(free)
-G£àFirebaseaccount(freetier)
-G£àDockerHubaccount(free)

###ToolsRequired(AllOpen-Source/Free)
-G£àGit
-G£àDocker(free)
-G£àNode.js18+
-G£àPython3.9+
-G£àPostgreSQLclienttools

###Domain(Optional)
-UseRender'sfreesubdomain:`app-name.onrender.com`
-ORconnectcustomdomain(freeDNS)

---

##Step1:PrepareGitHubRepository

###RepositoryStructure
```
AI-Based-Civic-Issue-Monitoring-System/
Gö£GöGöbackend/
GöéGö£GöGösrc/
GöéGö£GöGöpackage.json
GöéGö£GöGö.env.example
GöéGö£GöGöDockerfile
GöéGööGöGörender.yaml
Gö£GöGöai-service/
GöéGö£GöGöapp.py
GöéGö£GöGörequirements.txt
GöéGö£GöGöDockerfile
GöéGööGöGörender.yaml
Gö£GöGöweb/
GöéGö£GöGöpublic/
GöéGö£GöGösrc/
GöéGö£GöGöpackage.json
GöéGööGöGörender.yaml
GööGöGöREADME.md
```

###CreateDockerfileforBackend

**File:`backend/Dockerfile`**
```dockerfile
FROMnode:18-alpine

WORKDIR/app

#Copypackagefiles
COPYpackage*.json./

#Installdependencies
RUNnpmci--only=production

#Copyapplicationcode
COPYsrc./src
COPYconfig./config

#Createtempdirectoryforimagestorage
RUNmkdir-p/app/uploads

#Exposeport
EXPOSE3000

#Startapplication
CMD["node","src/app.js"]
```

###CreateDockerfileforAIService

**File:`ai-service/Dockerfile`**
```dockerfile
FROMpython:3.9-slim

WORKDIR/app

#Installsystemdependencies
RUNapt-getupdate&&apt-getinstall-y\
libsm6libxext6libxrender-dev\
&&rm-rf/var/lib/apt/lists/*

#Copyrequirements
COPYrequirements.txt./

#InstallPythondependencies
RUNpipinstall--no-cache-dir-rrequirements.txt

#DownloadYOLOv8model(doneduringbuild)
RUNpython-c"fromultralyticsimportYOLO;YOLO('yolov8n.pt')"

#Copyappcode
COPYapp.py.

#Exposeport
EXPOSE5000

#Startapplication
CMD["python","app.py"]
```

###Createrender.yaml

**File:`render.yaml`**(inrootdirectory)
```yaml
services:
#BackendAPI
-type:web
name:civic-issues-api
env:node
plan:free
buildCommand:cdbackend&&npmci
startCommand:cdbackend&&npmstart
envVars:
-key:NODE_ENV
value:production
-key:DATABASE_URL
fromDatabase:
name:civic-issues-db
property:connectionString
-key:REDIS_URL
fromService:
name:civic-issues-redis
type:pserv
property:connectionString
-key:JWT_SECRET
sync:false

#PostgreSQLDatabase(Free)
-type:pserv
name:civic-issues-db
plan:free
ipAllowList:[]
postgreSQLVersion:"14"

#RedisCache(Free)
-type:pserv
name:civic-issues-redis
plan:free
ipAllowList:[]
redisVersion:"7"

#AIService(BackgroundWorker)
-type:background_worker
name:civic-issues-ai
env:docker
plan:free
dockerfilePath:ai-service/Dockerfile
envVars:
-key:REDIS_URL
fromService:
name:civic-issues-redis
type:pserv
property:connectionString

#WebDashboard(StaticSite)
-type:static_site
name:civic-issues-dashboard
plan:free
buildCommand:cdweb&&npmrunbuild
staticPublishPath:web/build
envVars:
-key:REACT_APP_API_URL
value:https://civic-issues-api.onrender.com
```

---

##Step2:EnvironmentConfiguration

###BackendEnvironmentVariables

**File:`backend/.env`**
```bash
#Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://civic-issues-api.onrender.com

#Database(ProvidedbyRender)
DATABASE_URL=postgresql://user:password@dpg-xxx.postgresql.render.com:5432/civic_issues
DB_POOL_SIZE=5
DB_POOL_IDLE_TIMEOUT=30000

#Redis(ProvidedbyRender)
REDIS_URL=redis://:password@redis-xxxx.render.com:6379

#JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=24h

#AIService
AI_SERVICE_URL=http://civic-issues-ai.onrender.com:5000

#Storage(LocalDisk)
STORAGE_PATH=/app/uploads
MAX_FILE_SIZE=5242880

#FirebaseFCM
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_email

#Logging
LOG_LEVEL=info
```

###AIServiceEnvironmentVariables

**File:`ai-service/.env`**
```bash
REDIS_URL=redis://:password@redis-xxxx.render.com:6379
MODEL_PATH=/app/models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
PORT=5000
```

---

##Step3:DatabaseSetup

###InitializePostgreSQLwithPostGIS

Createinitializationscript:**`database/init.sql`**

```sql
--EnablePostGIS
CREATEEXTENSIONIFNOTEXISTSpostgis;
CREATEEXTENSIONIFNOTEXISTSpostgis_topology;

--Createuserstable
CREATETABLEIFNOTEXISTSusers(
idUUIDPRIMARYKEYDEFAULTgen_random_uuid(),
emailVARCHAR(255)UNIQUENOTNULL,
password_hashVARCHAR(255)NOTNULL,
roleVARCHAR(50)NOTNULL,
ward_idINTEGER,
created_atTIMESTAMPDEFAULTCURRENT_TIMESTAMP
);

--Createwardstable
CREATETABLEIFNOTEXISTSwards(
idSERIALPRIMARYKEY,
nameVARCHAR(100)NOTNULL,
geometryGEOMETRY(POLYGON,4326),
populationINTEGER
);

--Createissuestable
CREATETABLEIFNOTEXISTSissues(
idUUIDPRIMARYKEYDEFAULTgen_random_uuid(),
issue_typeVARCHAR(50)NOTNULL,
locationGEOGRAPHY(POINT,4326)NOTNULL,
ward_idINTEGERREFERENCESwards(id),
statusVARCHAR(50)DEFAULT'OPEN',
priorityVARCHAR(50),
confidence_scoreFLOAT,
image_urlVARCHAR(500),
descriptionTEXT,
assigned_toUUIDREFERENCESusers(id),
created_byUUIDREFERENCESusers(id),
created_atTIMESTAMPDEFAULTCURRENT_TIMESTAMP,
resolved_atTIMESTAMP
);

--Createspatialindexes
CREATEINDEXidx_issues_locationONissuesUSINGGIST(location);
CREATEINDEXidx_wards_geometryONwardsUSINGGIST(geometry);

--Createindexesforperformance
CREATEINDEXidx_issues_statusONissues(status);
CREATEINDEXidx_issues_ward_idONissues(ward_id);
CREATEINDEXidx_issues_created_atONissues(created_atDESC);
```

###RunMigrationsonRender

AftercreatingthedatabaseserviceonRender:

1.GetPostgreSQLconnectionstringfromRenderdashboard
2.Connecttodatabase:
```bash
psql"postgresql://user:password@dpg-xxx.postgresql.render.com:5432/civic_issues"<database/init.sql
```

---

##Step4:DeployonRender

###Method1:Usingrender.yaml(Recommended)

1.**PushtoGitHub**
```bash
gitadd.
gitcommit-m"AddRenderdeploymentconfiguration"
gitpushoriginmain
```

2.**ConnecttoRenderDashboard**
-Gotohttps://render.com/dashboard
-Click"New+"GÆ"WebService"
-SelectGitHubrepository
-Pastethiscommandin"BuildCommand":
```
npminstall-grender-cli&&renderdeploy
```

3.**ConfigureServices**
-BackendWebService
-PostgreSQLDatabase
-RedisCache
-AIService(BackgroundWorker)
-WebDashboard(StaticSite)

###Method2:DeployviaRenderCLI

```bash
#InstallRenderCLI
npminstall-grender-cli

#LogintoRender
renderlogin

#Deploy
renderdeploy
```

---

##Step5:ConfigureServicesonRender

###BackendAPISetup

1.**CreateWebService**
-Name:`civic-issues-api`
-Environment:Node
-BuildCommand:`npmci&&npmrunbuild`
-StartCommand:`npmstart`
-Plan:Free

2.**ConnectDatabase&Redis**
-AddenvironmentvariablesfromRenderservices

3.**ConfigureHealthCheck**
-URL:`/health`
-Expectedstatus:200

###AIServiceSetup

1.**CreateBackgroundWorker**
-Name:`civic-issues-ai`
-Environment:Docker
-DockerfilePath:`ai-service/Dockerfile`
-Plan:Free

2.**ConnectRedis**
-Add`REDIS_URL`environmentvariable

###WebDashboardSetup

1.**CreateStaticSite**
-Name:`civic-issues-dashboard`
-BuildCommand:`npmrunbuild`
-PublishDirectory:`build`
-Plan:Free

2.**SetAPIEndpoint**
-Environmentvariable:`REACT_APP_API_URL=https://civic-issues-api.onrender.com`

###PostgreSQLDatabaseSetup

1.**CreatePostgreSQLService**
-Plan:Free(512MB)
-PostgreSQLVersion:14
-Copyconnectionstringto`DATABASE_URL`

2.**RunInitializationScript**
```bash
#Afterdatabaseiscreated
psql"postgresql://..."<database/init.sql
```

###RedisCacheSetup

1.**CreateRedisService**
-Plan:Free(256MB)
-Copyconnectionstringto`REDIS_URL`

---

##Step6:LocalImageStorageSetup

Sincewe'reNOTusingAWSS3,weuselocaldiskstorageonRender.

###BackendUploadHandler

**File:`backend/src/routes/upload.js`**
```javascript
constmulter=require('multer');
constpath=require('path');
constfs=require('fs');

//Configurestorage
conststorage=multer.diskStorage({
destination:function(req,file,cb){
constuploadDir=process.env.STORAGE_PATH||'/app/uploads';
if(!fs.existsSync(uploadDir)){
fs.mkdirSync(uploadDir,{recursive:true});
}
cb(null,uploadDir);
},
filename:function(req,file,cb){
cb(null,Date.now()+'-'+file.originalname);
}
});

constupload=multer({storage:storage,limits:{fileSize:5*1024*1024}});

router.post('/upload',upload.single('image'),(req,res)=>{
res.json({
success:true,
filename:req.file.filename,
path:`/uploads/${req.file.filename}`
});
});

module.exports=router;
```

###CleanupOldFiles

Createascheduledjobtocleanupoldimages:

**File:`backend/src/jobs/cleanup.js`**
```javascript
constfs=require('fs');
constpath=require('path');

asyncfunctioncleanupOldFiles(){
constuploadDir=process.env.STORAGE_PATH||'/app/uploads';
constmaxAge=30*24*60*60*1000;//30days

fs.readdirSync(uploadDir).forEach(file=>{
constfilepath=path.join(uploadDir,file);
conststat=fs.statSync(filepath);

if(Date.now()-stat.mtimeMs>maxAge){
fs.unlinkSync(filepath);
console.log(`Deletedoldfile:${file}`);
}
});
}

//Rundaily
setInterval(cleanupOldFiles,24*60*60*1000);

module.exports={cleanupOldFiles};
```

---

##Step7:GitHubActionsCI/CD

Createautomateddeploymentpipeline.

**File:`.github/workflows/deploy.yml`**
```yaml
name:DeploytoRender

on:
push:
branches:[main]

jobs:
deploy:
runs-on:ubuntu-latest

steps:
-uses:actions/checkout@v3

-name:RunTests
run:|
cdbackend
npmci
npmtest

-name:NotifyRenderDeploy
run:|
curlhttps://api.render.com/deploy/srv-${{secrets.RENDER_SERVICE_ID}}?key=${{secrets.RENDER_API_KEY}}
```

---

##Step8:SecurityConfiguration

###CORSSetup
```javascript
//backend/src/middleware/cors.js
constcors=require('cors');

constcorsOptions={
origin:[
'https://civic-issues-dashboard.onrender.com',
'http://localhost:3000'
],
credentials:true
};

module.exports=cors(corsOptions);
```

###RateLimiting
```javascript
//backend/src/middleware/rateLimit.js
constrateLimit=require('express-rate-limit');

constlimiter=rateLimit({
windowMs:15*60*1000,//15minutes
max:100//limiteachIPto100requestsperwindowMs
});

module.exports=limiter;
```

###JWTValidation
```javascript
//backend/src/middleware/auth.js
constjwt=require('jsonwebtoken');

functionvalidateJWT(req,res,next){
consttoken=req.headers.authorization?.split('')[1];
if(!token)returnres.status(401).json({error:'Unauthorized'});

try{
constdecoded=jwt.verify(token,process.env.JWT_SECRET);
req.user=decoded;
next();
}catch(err){
res.status(403).json({error:'Invalidtoken'});
}
}

module.exports=validateJWT;
```

---

##Step9:Monitoring&Logging

###ApplicationLogging

**File:`backend/src/config/logger.js`**
```javascript
constwinston=require('winston');

constlogger=winston.createLogger({
level:process.env.LOG_LEVEL||'info',
format:winston.format.json(),
transports:[
newwinston.transports.Console(),
newwinston.transports.File({filename:'/app/logs/app.log'})
]
});

module.exports=logger;
```

###HealthCheckEndpoint

```javascript
//backend/src/routes/health.js
router.get('/health',(req,res)=>{
res.json({
status:'OK',
timestamp:newDate(),
environment:process.env.NODE_ENV
});
});
```

###DatabaseConnectionCheck

```javascript
router.get('/health/db',async(req,res)=>{
try{
constresult=awaitdb.query('SELECTNOW()');
res.json({status:'OK',database:'Connected'});
}catch(err){
res.status(503).json({status:'ERROR',database:'Disconnected'});
}
});
```

---

##Step10:Post-Deployment

###VerifyDeployment
```bash
#CheckAPIendpoint
curlhttps://civic-issues-api.onrender.com/health

#Checkdatabase
curlhttps://civic-issues-api.onrender.com/health/db

#TestAIservice
curl-XPOSThttps://civic-issues-ai.onrender.com/predict-F"image=@test.jpg"
```

###BackupDatabase

CreatemonthlybackupsonRender:

```bash
#Manualbackup
pg_dump"postgresql://user:pass@host/db">backup-$(date+%Y%m%d).sql

#StoreinGitHub(encrypted)
git-cryptadd-gpg-useryour-email@example.com
gitaddbackups/
gitcommit-m"Adddatabasebackup"
gitpush
```

---

##CostBreakdown(100%FREE)

|Service|FreeTier|Cost|
|---------|-----------|------|
|RenderWebService|2vCPU,512MBRAM,auto-suspend|FREE|
|PostgreSQL(Render)|512MBstorage,1concurrentconnection|FREE|
|Redis(Render)|256MBstorage|FREE|
|BackgroundWorker(Render)|512MBRAM|FREE|
|StaticSite(Render)|Unlimitedbandwidth|FREE|
|GitHubActions|2000minutes/month|FREE|
|FirebaseFCM|Freetier|FREE|
|OpenStreetMap|Unlimitedqueries|FREE|
|**TOTAL**||**$0/month**|

---

##Troubleshooting

###ServiceWon'tStart
```bash
#Checklogs
renderlogscivic-issues-api

#Checkenvironmentvariables
renderenvcivic-issues-api
```

###DatabaseConnectionIssues
```bash
#Verifyconnectionstring
psql"postgresql://..."

#Checkdatabasesize
SELECTpg_size_pretty(pg_database_size('civic_issues'));
```

###AIServiceNotRunning
```bash
#Checkworkerlogs
renderlogscivic-issues-ai

#Testlocally
dockerbuild-tcivic-aiai-service/
dockerrun-eREDIS_URL=...civic-ai
```

---

##Summary

G£à**100%FreeDeployment**usingRenderFreeTier
G£à**ZeroAWS/GCP/Azure**costs
G£à**Open-sourceonly**tools
G£à**Simpletoscale**whenneeded
G£à**Easytomigrate**topaidtiersifneeded

Allservicesarefreeandopen-source.Nohiddencharges.Novendorlock-in!


