# O'larry Media Platform — Modern Media Sharing Platform

O'larry is a comprehensive media-sharing platform with dual interfaces: a **Consumer Interface** for browsing and interacting with content, and a **Creator Dashboard** for uploading and managing media. Built with React (consumer) and vanilla HTML/CSS/JS (creator), featuring JWT authentication, role-based access, and modern design.

## 🎯 Overview

**Two Distinct Interfaces:**
- **Consumer Interface** - Instagram-like feed for viewing, liking, and commenting on media
- **Creator Dashboard** - Professional upload and management interface for content creators

**Key Features:**
- Role-based authentication (Consumer/Creator)
- Media upload with metadata (title, caption, location, tagged people)
- Real-time search and filtering
- Threaded comments system
- Like functionality with count tracking
- Responsive Bape grey matte futuristic design
- Video support with HTML5 player

---

## 📚 Documentation

### Consumer Interface
See [CONSUMER_INTERFACE.md](CONSUMER_INTERFACE.md) for complete documentation on:
- Feed and media browsing
- Search functionality
- Media detail modal with comments
- Authentication setup
- API integration

### Creator Dashboard
See [CREATOR_DASHBOARD.md](CREATOR_DASHBOARD.md) for complete documentation on:
- Upload interface with drag-drop
- Media management dashboard
- Performance analytics
- File format support
- Upload process

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Backend API running on `http://localhost:7071/api/`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Authentication

### Registration
1. Visit `/register.html`
2. Choose role: **Consumer** or **Creator**
3. Enter username and password (min 6 characters)
4. Submit to create account

### Login
1. Visit `/login.html`
2. Enter credentials
3. Automatically redirected based on role:
   - **Creator** → `/creator-dashboard.html`
   - **Consumer** → `/` (main feed)

### Roles

**Consumer**:
- View media feed
- Search and filter content
- Like posts
- Add threaded comments
- View media details

**Creator**:
- All consumer capabilities
- Upload media (images/videos)
- Add metadata (title, caption, location, tags)
- Track performance (likes, comments)
- Manage uploads (view, delete)
- Analytics dashboard

---

## 📁 Project Structure

```
frontend/
├── src/                       # React consumer interface
│   ├── api.js                # API service with auth
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   ├── components/
│   │   ├── AuthGuard.jsx     # Auth wrapper
│   │   ├── MediaDetail.jsx   # Media detail modal
│   │   ├── Navbar.jsx        # Navigation
│   │   └── PostCard.jsx      # Media card
│   ├── pages/
│   │   └── Feed.jsx          # Main feed page
│   └── styles/
│       └── theme.js          # Design tokens
├── login.html                # Login page
├── register.html             # Registration page
├── creator-dashboard.html    # Creator dashboard
├── upload-media.html         # Upload interface
├── index.html                # Consumer entry
├── CONSUMER_INTERFACE.md     # Consumer docs
├── CREATOR_DASHBOARD.md      # Creator docs
└── README.md                 # This file
```

---

## 🎨 Design Theme

**Bape Grey Matte Futuristic Aesthetic**

### Colors
- Primary Grey: `#8B8B8B`
- Light Grey: `#B8B8B8`
- Dark Grey: `#5A5A5A`
- Background: `#E8E8E8`
- Accent Blue: `#4A90E2`
- Card: `#F5F5F5`

### Features
- Smooth transitions and hover effects
- Modern card-based layouts
- Responsive grid systems
- Clean typography
- Professional spacing

---

## 📡 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Media
- `GET /api/list_media` - List all media
- `GET /api/search_media?q=query` - Search media
- `GET /api/get_media?name=filename` - Get single media
- `POST /api/upload_media?caption=X&username=Y&location=Z&tagged_people=A,B` - Upload media
- `POST /api/like_media?name=filename` - Like media
- `DELETE /api/delete_media?name=filename` - Delete media

### Comments
- `GET /api/get_comments?media_name=filename` - Get comments
- `POST /api/add_comment` - Add comment
  - Body: `{ media_name, comment, parent_id }`

**All authenticated endpoints require:**
```javascript
headers: {
  'Authorization': 'Bearer {token}'
}
```

---
- Returns short-lived SAS URLs for images (used directly in `<img>` tags).

If you bring your own backend, ensure the API surface matches the endpoints below and update `API_PROXY_TARGET` in `vite.config.js` as needed.

---

## Profile pictures & usernames (how it works)
Implementation summary for maintainers:
- The frontend uploads a profile image as a regular media post and tags it by setting `caption=__profile_pic__` on upload.
- The frontend derives avatars by choosing the latest `__profile_pic__` post per username when building the feed or profile header.
- After a successful profile upload, the client issues `DELETE` requests for older `__profile_pic__` posts for that username to keep storage tidy.

Note: The caption-based approach avoids backend changes; for production, consider adding a dedicated profile endpoint to store a single canonical avatar per user and server-side resizing.

---

## Screenshots / Flow
Below are illustrative screenshots that show the profile upload flow (select image → preview/crop → upload). These are intended as visual guidance; feel free to replace them with real app screenshots.

![Profile — choose file](./screenshots/profile-upload-step1.svg)

![Profile — preview & upload](./screenshots/profile-upload-step2.svg)

---

## Development notes
- API surface (frontend ↔ backend): `POST /api/upload_media`, `GET /api/list_media`, `POST /api/like_media`, `DELETE /api/delete_media`, `GET /api/ai_caption`.
- Uploads send raw image bytes in the request body; do not use `FormData` or set `Content-Type` manually (backend expects a binary body).
- SAS tokens returned by `list_media` expire (short-lived for security).

---

## Developer checklist & E2E test stub ✅
Use the checklist below to validate the profile upload flow during development; an example Playwright test stub is provided in `tests/e2e/profile-upload.spec.js`.

Checklist:
1. Start backend (`func host start`) and frontend (`npm run dev`).
2. Set a username in the Navbar and confirm it persists (localStorage).
3. Go to `/<your-username>` and select a profile image; verify Original and Cropped previews.
4. Upload the image and verify the profile header updates with the new avatar.
5. Verify older `__profile_pic__` posts for the username are deleted (via `GET /api/list_media`).

Run E2E (Playwright):
- Install Playwright and browsers: `npm i -D @playwright/test && npx playwright install`
- Run tests: `npm run test:e2e`

The stub `tests/e2e/profile-upload.spec.js` demonstrates the flow and includes a note on adding a binary fixture for file upload testing.

---

## UI theme — BAPE matte grey

- Futuristic glass panels, neon accent pulses, and matte grey backdrop across feed, navbar, and upload studio.
- Dev proxy avoids CORS in development: `API_BASE` uses `/api` in dev (see `vite.config.js`), falls back to hosted API for production.
- Typography: Space Grotesk; accents: `--accent` (mint) and `--accent-2` (lavender). Tweak in `src/styles/global.css` if you want a different pop.
- Upload studio: drag/drop zone, glowing preview, progress bar, and pill actions styled in the same palette.

---

## Contributing
Contributions are welcome. Suggested next steps:
- Add server-side profile endpoints and image resizing.
- Add E2E tests for the upload and cleanup flow.
- Add screenshots or a short GIF to the README to illustrate the profile upload flow.

Please open an issue or a pull request with a short description of the change.

---

## License
This repository is provided for educational purposes. Include your preferred license file if you plan to reuse or distribute the project.

---

If you want, I can add screenshots or a short GIF to the README, or expand any section with more technical detail (API examples, curl commands, or a dev checklist).