# FairFund

**FairFund** is a collaborative budgeting and expense management platform designed for roommates, community groups, nonprofits, and co-ops to transparently track shared expenses and manage group finances.

---

## Features

TBD

---

## Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | React.js, React Native (mobile support)   |
| Backend   | Node.js, Express.js                       |
| Database  | MongoDB (via Mongoose)                    |
| Auth      | Google OAuth 2.0, JWT                     |
| Hosting   | AWS (EC2 / S3)                            |
| DevOps    | Azure DevOps (CI/CD)                      |

---

## Project Structure
fairfund-backend/
├── config/ # DB connection setup
├── controllers/ # Route logic
├── middleware/ # Auth middleware
├── models/ # Mongoose schemas
├── routes/ # API routes
├── swagger.js # Swagger/OpenAPI docs setup
├── server.js # Express server

---

## Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```
---

## Install Dependencies 
 ```
 npm install
 ```
---
## Run unit tests
```
npm test
```
---
## Run the backend
```
npm run dev
```

## Check out the Swagger
```
http://localhost:5000/swagger
```

---