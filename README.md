# MarketplaceMobile

A simple practice project that pairs a React Native (Expo) frontend with a Node.js/Express + MongoDB backend. The app demonstrates a minimal marketplace where users can view and create products, with image uploads handled via Cloudinary on the server.

## Tech Stack
- Frontend: React Native (Expo)
- Backend: Node.js, Express
- Database: MongoDB
- Auth: JSON Web Tokens (JWT)
- Media: Cloudinary
- API Docs: OpenAPI/Swagger

## Repository Layout
```
Marketplacemobile/
├─ frontend/        # React Native (Expo) app
└─ server/          # Node.js/Express API + Swagger
```

## Prerequisites
- Node.js LTS (>= 18 recommended)
- npm or yarn
- MongoDB running locally or a hosted MongoDB connection string
- Cloudinary account (for image uploads)
- Expo CLI (for running the RN app)

Install Expo CLI if you don’t have it yet:
```
npm i -g expo-cli
```

---

## Quick Start

### 1) Backend (server)
1. Open a terminal in `server/`.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in `server/` (see Environment Variables below).
4. Start the API server:
   ```
   npm run dev   # if available (nodemon)
   # or
   npm start
   ```
5. Default API base URL: `http://localhost:4000` (configurable via `PORT`).

API documentation (Swagger) is defined in:
```
server/src/swagger/swagger.yaml
```
If your project exposes Swagger UI, open it in your browser once the server is running (route depends on your implementation, e.g. `/api-docs`).

### 2) Frontend (React Native / Expo)
1. Open a second terminal in `frontend/`.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` in `frontend/` if you need to change the API URL (see Environment Variables below).
4. Start the app:
   ```
   npm start
   ```
5. Use the Expo DevTools QR code to open on a device or run in an emulator/simulator.

---

## Environment Variables

### Server `.env`
Create a file at `server/.env` with the following variables:
```
# Server
PORT=4000
FRONTEND_URL=http://localhost:19006

# Database
MONGO_URI=mongodb://localhost:27017/mini_marketplace

# Auth
JWT_SECRET=replace-with-a-long-random-string
BCRYPT_SALT_ROUNDS=10

# Cloudinary (required for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
Notes:
- Use a strong random value for `JWT_SECRET`.
- `FRONTEND_URL` should match the Expo dev URL (e.g., `http://localhost:19006`).
- If you deploy, adjust all values accordingly.

### Frontend `.env`
Expo (SDK 49+) supports public env vars prefixed with `EXPO_PUBLIC_`. Create `frontend/.env` (optional) to override the API base URL used by the app:
```
EXPO_PUBLIC_API_URL=http://localhost:4000
```
Then, in your React Native code, you can read it via `process.env.EXPO_PUBLIC_API_URL`.

If your project uses a different env approach (e.g., `react-native-dotenv`), adapt accordingly.

---

## Common Scripts
These may vary depending on your existing `package.json` scripts.
- Server:
  - `npm run dev` — start with nodemon (hot reload), if defined
  - `npm start` — start the API server
- Frontend:
  - `npm start` — start Expo DevTools
  - `npm run android` — launch Android
  - `npm run ios` — launch iOS (on macOS)

---

## Development Tips
- Ensure MongoDB is running before starting the server.
- Cloudinary credentials must be correct for image upload features to work.
- If you face CORS issues, confirm `FRONTEND_URL` matches your Expo dev URL and that the server CORS config allows it.
- To test token-protected routes, sign in to obtain a JWT and include it in the `Authorization: Bearer <token>` header.

---

## Troubleshooting
- Port already in use: change `PORT` in `server/.env` or free the port.
- Cannot connect to MongoDB: verify `MONGO_URI` and that MongoDB is running/accessible.
- Images not uploading: re-check Cloudinary environment variables and any server upload route logs.
- Expo cannot reach the API: ensure the device/emulator can resolve your machine IP; on physical devices use your machine’s LAN IP instead of `localhost` for `EXPO_PUBLIC_API_URL`.

---

## License
This project is for learning and practice purposes. Add a license of your choice if distributing.

