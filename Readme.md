# FitTrace — Personal Health & Activity Tracker

## 1. Project Title

FitTrace	— Personal	Health	&	Activity	Tracker

## 2. Problem Statement

People	trying	to	stay	fit	often	juggle	multiple	tracking	tools	(workouts	in	one	place,	meals	in	
another,	reminders	somewhere	else).	There’s	a	need	for	a	single	web	app	that	lets	users	
create/manage	workouts,	log	nutrition,	get	a	daily	random	exercise	to	maintain	streaks,	
track	water	intake,	and	view	personal	progress	and	leaderboards	— all	tied	together	with	
calendar	scheduling	and	easy	quick-add	options.

## 3. System Architecture

High-level	flow:
Frontend	(Next.js)	→	Backend	API	(Node.js	+	Express)	→	ORM	(Prisma)	→	Relational	DB	
(PostgreSQL)
Auxiliary	services:	Background	worker	(BullMQ	/	Redis)	for	reminders	&	leaderboard	
recalculation,	Media	storage	(S3	or	compatible),	Push	Notifications	(Web	Push	/	FCM),	
Optional	AI	microservice	(OpenAI)	for	tutorial	generation/summaries.

Frontend	(Next.js):	Pages	for	auth,	dashboard,	workouts,	nutrition,	daily-random,	
leaderboard,	profile,	calendar.	Backend	(Node.js	+	Express):	REST	API	endpoints,	
authentication	(JWT	+	refresh	tokens),	and	business	logic	for	all	features.	Database:	
PostgreSQL	via	Prisma	ORM.	Redis	for	caching	and	job	queue.	Hosting	with	Vercel	
(frontend),	Render/Railway	(backend),	and	managed	Postgres	(Aiven/RDS).

## 5. Key Features

Category Features

Authentication	&	Authorization Sign	up,	login,	logout,	email	verification,	
JWT	access	+	refresh	tokens,	OAuth	
(Google),	role-based	access	(user/admin).

Workout	Management	(CRUD) Create	/	Read	/	Update	/	Delete	workouts	
with	difficulty,	equipment,	instructions,	and	
optional	tutorial.

Workout	Scheduling	&	Calendar Add	workouts	to	personal	calendar,	
recurring	schedules,	and	reminders.

Nutrition	Tracker Log	meals	with	food	item,	meal	type,	
serving	size,	calories,	macros,	and	
date/time.


Quick	Add	Meals Predefined	items	(coffee,	milk,	rice,	banana,	
etc.)	for	one-click	logging.

Daily	Random	Exercise	(Streak	System) Random	daily	exercise	with	points	and	
difficulty.	Completing	earns	points	and	
maintains	streak.

Leaderboards Weekly	and	monthly	leaderboards	
computed	from	streaks,	workouts,	and	
nutrition	consistency.

User	Profile	&	Analytics Profile	showing	progress,	workouts,	meals,	
streaks,	and	upcoming	events.

Water	Drinking	Reminder Configurable	push/email	reminders	and	
tracking	of	daily	water	intake.

## 6. Tech Stack

Layer Technologies

Frontend Next.js,	React	Query/SWR,	TailwindCSS,	
TypeScript

Backend Node.js,	Express.js,	TypeScript

ORM Prisma

Database PostgreSQL,	Redis	(cache	+	job	queue)

Auth JWT	(access	+	refresh),	OAuth	2.0	(Google),	
bcrypt

Media AWS	S3	/	DigitalOcean	Spaces

Background	Jobs BullMQ	/	Bee-Queue	+	Redis

Notifications Web	Push,	FCM,	SendGrid/Mailgun

AI	/	Enhancements Optional	OpenAI	for	exercise	descriptions	
and	summaries

Testing	&	CI Jest,	Playwright,	GitHub	Actions

Hosting Vercel	(frontend),	Render/Railway	
(backend),	Aiven/AWS	RDS	(database)

Monitoring Sentry,	Prometheus/Grafana


## 7. API Overview

Below	are	example	endpoints	with	descriptions	and	access	levels.

Endpoint Method Description Access

/api/auth/signup POST Register	new	user Public

/api/auth/login POST Authenticate	user Public

/api/workouts POST Create	new	
workout

```
Authenticated
```
/api/workouts/:id PUT Update	workout Authenticated

/api/workouts/:id DELETE Delete	workout Admin/Owner

/api/meals POST Log	a	meal Authenticated

/api/meals/quick-add POST Quick	add	common	
meal

```
Authenticated
```
/api/random-
exercise/today

```
GET Fetch	today's	
random	exercise
```
```
Authenticated
```
/api/leaderboard/weekly GET Fetch	weekly	
leaderboard

```
Authenticated
```
/api/water/log POST Log	water	intake Authenticated

This	proposal	outlines	the	full	scope	of	FitTrace,	including	key	modules,	architecture,	and	
tech	stack	for	a	production-grade	implementation	using	Next.js,	Node.js,	Express,	Prisma,	
and	PostgreSQL.


