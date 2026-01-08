# O'larry Media Platform - Consumer Interface

A modern, Instagram-like consumer interface for viewing and interacting with media content on the O'larry platform. Features a sleek **Bape grey matte futuristic design** with full authentication and commenting capabilities.

## 🎨 Design Features

- **Bape Grey Matte Theme**: Professional futuristic aesthetic with matte grey tones
- **Responsive Grid Layout**: Masonry-style media grid that adapts to all screen sizes
- **Modern UI Components**: Clean cards, smooth animations, and intuitive interactions
- **Mobile-First Design**: Optimized for mobile, tablet, and desktop viewing

## ✨ Key Features

### Homepage/Feed
- Grid layout displaying all media (images and videos)
- Each media card shows:
  - Thumbnail preview with play button overlay for videos
  - Title/caption
  - Creator username (clickable to filter)
  - Like count with heart icon
  - Comment count
  - Location (if available)
- Click any card to open detailed view
- Infinite scroll capability

### Media Detail Modal
- Full-size image or HTML5 video player
- Complete media information:
  - Title and caption
  - Creator profile with avatar
  - Location and tagged people (clickable tags)
- Interactive features:
  - Functional like button with count updates
  - Full comments section with:
    - All comments with username and timestamp
    - Threaded replies (indented under parent)
    - Reply button for each comment
    - Add comment textarea and submit button

### Search Functionality
- Real-time search across:
  - Titles
  - Captions
  - Locations
  - Tagged people
  - Usernames
- Search results displayed in same grid layout
- Result count header
- Clear search to return to feed

### Navigation Bar
- Sticky header with:
  - O'larry logo/home button
  - Search bar
  - User profile dropdown:
    - View my posts
    - Logout option
  - Login button (when not authenticated)

### Authentication
- Dedicated login and register pages
- JWT token-based authentication
- Role-based access (consumer only)
- Automatic token validation
- Redirect to login if unauthenticated
- Authorization headers on all API calls
- Handle 401 errors gracefully

## 🚀 Getting Started

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

## 🔐 Authentication Flow

1. **Registration** (`/register.html`):
   - New users create account with username/password
   - Account role automatically set to "consumer"
   - Redirects to login after successful registration

2. **Login** (`/login.html`):
   - Users authenticate with credentials
   - Receives JWT token and stores in localStorage
   - Checks for "consumer" role
   - Redirects to main feed

3. **Protected Routes**:
   - AuthGuard component wraps the app
   - Checks for valid token on mount
   - Validates user role is "consumer"
   - Redirects to login if authentication fails

4. **API Integration**:
   - All API calls include `Authorization: Bearer {token}` header
   - 401 responses trigger automatic logout and redirect

## 📡 API Integration

The app connects to these endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Media
- `GET /api/list_media` - Load all media
- `GET /api/search_media?q=query` - Search media
- `GET /api/get_media?name=filename` - Get single media
- `POST /api/like_media?name=filename` - Like media (requires auth)

### Comments
- `GET /api/get_comments?media_name=filename` - Load comments
- `POST /api/add_comment` - Add comment (requires auth)
  - Body: `{ media_name, comment, parent_id }`

## 🎨 Theme Customization

The theme is defined in `src/styles/theme.js`:

```javascript
export const theme = {
  colors: {
    bape: "#8B8B8B",           // Primary grey
    bapeLight: "#B8B8B8",      // Light grey
    bapeDark: "#5A5A5A",       // Dark grey
    background: "#E8E8E8",     // Matte background
    card: "#F5F5F5",           // Card background
    accentBright: "#4A90E2",   // Futuristic blue
    // ... more colors
  },
  // ... radius, spacing, shadows, transitions
};
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── api.js             # API service with auth
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   ├── index.css          # Global styles
│   ├── components/
│   │   ├── AuthGuard.jsx  # Authentication wrapper
│   │   ├── MediaDetail.jsx # Media detail modal
│   │   ├── Navbar.jsx     # Navigation bar
│   │   └── PostCard.jsx   # Media card component
│   ├── pages/
│   │   └── Feed.jsx       # Main feed page
│   └── styles/
│       └── theme.js       # Design tokens
├── login.html             # Login page
├── register.html          # Registration page
└── package.json
```

## 🔧 Configuration

### API Base URL
Set via environment variable:
```bash
VITE_API_BASE=http://localhost:7071/api
```

Or defaults to `/api` for proxy/rewrite configurations.

### Vite Dev Proxy
Configure in `vite.config.js` to proxy `/api` to backend server during development.

## 🎯 Key Components

### PostCard
Displays media thumbnail with metadata. Props:
- `post` - Media object
- `onLike` - Like handler
- `onClick` - Open detail handler

### MediaDetail
Full-screen modal with media viewer and comments. Props:
- `media` - Media object
- `onClose` - Close handler

### Feed
Main feed page with search and filtering. Props:
- `search` - Search query
- `filterUsername` - Username filter

### Navbar
Sticky navigation with search and user menu. Props:
- `onSearch` - Search handler
- `onHome` - Home handler
- `onFilterUser` - User filter handler

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: 768px - 1024px
- **Wide**: > 1024px

Grid automatically adjusts columns based on viewport width.

## 🎥 Video Support

Videos are automatically detected by file extension:
- `.mp4`
- `.mov`
- `.webm`

Video cards show play button overlay. Detail modal uses HTML5 video player with controls.

## 🔒 Security Features

- JWT token storage in localStorage
- Automatic token validation on mount
- Role-based access control
- 401 error handling with auto-logout
- Authorization headers on all authenticated requests
- CSRF protection via token-based auth

## 🐛 Error Handling

- Network errors show user-friendly messages
- 401 responses trigger logout
- Failed likes revert optimistically
- Comment submission errors display alerts
- Loading states for all async operations

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using React and modern web technologies
