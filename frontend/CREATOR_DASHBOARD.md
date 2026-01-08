# O'larry Media Platform - Creator Dashboard

Professional creator dashboard for uploading, managing, and tracking media content on the O'larry platform. Features an intuitive upload interface, comprehensive media management, and performance analytics.

## 🎨 Features

### Creator Dashboard ([creator-dashboard.html](creator-dashboard.html))
- **Performance Stats**:
  - Total posts count
  - Total likes received
  - Total comments received
- **Media Grid**: View all your uploads in a responsive grid layout
- **Quick Actions**:
  - View media in consumer-style detail view
  - Delete posts with confirmation dialog
  - Track upload dates
  - Monitor engagement (likes/comments)

### Upload Interface ([upload-media.html](upload-media.html))
- **Drag-and-Drop Upload**: Intuitive file selection
- **File Preview**: See your media before uploading
- **Rich Metadata**:
  - Title (required)
  - Caption
  - Location
  - Tagged people (comma-separated usernames)
- **Real-time Progress**: Upload progress bar with percentage
- **File Validation**:
  - Type checking (images and videos only)
  - Size limit (50MB client-side warning)
  - Format verification

### Navigation
- Sticky navigation bar with:
  - O'larry Creator branding
  - "My Uploads" link
  - Prominent "Upload New" button
  - User profile dropdown with logout

## 🚀 Getting Started

### For Creators

1. **Register as Creator**:
   - Visit [/register.html](/register.html)
   - Select "Creator" role
   - Create account with username and password

2. **Login**:
   - Visit [/login.html](/login.html)
   - Enter credentials
   - Automatically redirected to creator dashboard

3. **Upload Media**:
   - Click "Upload New" button
   - Drag-drop or browse for file
   - Fill in metadata (title required)
   - Submit and track upload progress

4. **Manage Content**:
   - View all uploads in dashboard
   - Monitor performance metrics
   - Delete posts when needed

## 📁 Supported File Formats

### Images
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### Videos
- **MP4** (.mp4)
- **MOV** (.mov)
- **WebM** (.webm)
- **AVI** (.avi)
- **MPEG** (.mpeg)

**Maximum File Size**: 50MB (recommended client-side limit)

## 🔐 Authentication & Authorization

### Role-Based Access
- Only users with `role === "creator"` can access
- Authentication checked on page load
- JWT token required in localStorage
- Automatic redirect to login if unauthorized

### API Authentication
All creator endpoints require:
```javascript
headers: {
  'Authorization': 'Bearer {token}'
}
```

### Login Flow
```
1. User logs in → Receives JWT token and role
2. If role === "creator" → Redirect to /creator-dashboard.html
3. If role === "consumer" → Redirect to / (consumer interface)
4. Token stored in localStorage with username and role
```

## 📡 API Integration

### Upload Media
```
POST /api/upload_media?caption={text}&username={user}&location={loc}&tagged_people={tags}
Content-Type: image/jpeg | video/mp4 | etc.
Authorization: Bearer {token}
Body: Raw file binary
```

**Parameters**:
- `caption`: Media description (optional, defaults to title)
- `username`: Creator username (auto-filled from localStorage)
- `location`: Where media was taken (optional)
- `tagged_people`: Comma-separated usernames (optional)

**Response**: Success message or error

### List Media
```
GET /api/list_media
Authorization: Bearer {token}
```

**Response**: Array of media objects
- Dashboard filters to show only current user's posts
- Excludes profile picture posts (`caption !== '__profile_pic__'`)

### Delete Media
```
DELETE /api/delete_media?name={filename}
Authorization: Bearer {token}
```

**Response**: Success confirmation

## 🎯 Key Components

### Dashboard Page
**File**: `creator-dashboard.html`

**Features**:
- Statistics cards showing total posts, likes, comments
- Grid layout of all creator's media
- Each card shows:
  - Thumbnail (with video indicator for videos)
  - Title
  - Like and comment counts
  - Upload date
  - View and Delete buttons
- Empty state when no uploads
- Delete confirmation modal

**JavaScript Functions**:
- `checkAuth()` - Verify creator role
- `loadMedia()` - Fetch creator's media from API
- `displayMedia()` - Render media grid
- `updateStats()` - Calculate and display statistics
- `showDeleteModal()` - Show delete confirmation
- `confirmDelete()` - Execute deletion with API call

### Upload Page
**File**: `upload-media.html`

**Features**:
- Large drag-and-drop zone
- File type and size validation
- Image/video preview before upload
- Metadata form (title, caption, location, tags)
- Real-time upload progress with XHR
- Success screen with navigation options
- Cancel upload capability

**JavaScript Functions**:
- `handleFileSelect()` - Validate and process selected file
- `showPreview()` - Display image/video preview
- `uploadFile()` - Execute upload with progress tracking
- `showSuccess()` - Display success message
- `cancelUpload()` - Abort upload in progress

## 🎨 Styling & Theme

### Color Palette
- **Background**: `#E8E8E8` (Matte grey)
- **Cards**: `#F5F5F5` (Light grey)
- **Navigation**: `#2A2A2A` (Dark grey)
- **Primary Action**: `#4A90E2` (Blue)
- **Text**: `#1A1A1A` (Near black)
- **Muted Text**: `#6B6B6B` (Grey)
- **Error**: `#E74C3C` (Red)
- **Success**: `#27AE60` (Green)

### Design Principles
- **Creator-Focused**: Professional, desktop-optimized interface
- **Clear Hierarchy**: Important actions prominently displayed
- **Visual Feedback**: Hover states, transitions, loading indicators
- **Mobile Responsive**: Works on all screen sizes
- **Consistent**: Matches platform aesthetic

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 768px (optimized view)
- **Tablet**: 481px - 768px
- **Mobile**: < 480px

### Mobile Optimizations
- Stacked stats cards
- Smaller media grid (2 columns)
- Vertical button layouts
- Touch-friendly targets
- Simplified navigation

## ⚡ Upload Process

### Step-by-Step Flow

1. **File Selection**
   - User drags file or clicks to browse
   - Client validates file type and size
   - Shows error if invalid

2. **Preview & Metadata**
   - Display image/video preview
   - Show form for metadata entry
   - Require title, optional other fields

3. **Upload**
   - Build query parameters from form
   - Create XHR request with auth header
   - Send raw file as body
   - Track upload progress

4. **Progress Tracking**
   - Update progress bar in real-time
   - Show percentage completion
   - Allow cancellation

5. **Completion**
   - Show success message
   - Offer "View Dashboard" or "Upload Another"
   - Reset form for next upload

### Error Handling
- File type validation before upload
- Size limit warnings
- Network error detection
- Server error messages
- Upload cancellation support

## 🔒 Security Features

- **JWT Authentication**: All requests include bearer token
- **Role Verification**: Server validates creator role
- **Client-side Validation**: Prevent invalid uploads
- **CSRF Protection**: Token-based authentication
- **Secure Logout**: Clear all localStorage data

## 🐛 Troubleshooting

### Common Issues

**"This area is for creators only"**
- Your account role is not "creator"
- Register a new account and select "Creator" role
- Contact admin to change role on existing account

**Upload Fails**
- Check file size (< 50MB recommended)
- Verify file format is supported
- Ensure stable internet connection
- Check authentication token is valid

**Media Not Appearing in Dashboard**
- Refresh the page
- Check that upload completed successfully
- Verify you're logged in with correct account
- Check browser console for API errors

**401 Unauthorized Errors**
- Token expired - log out and log back in
- Invalid token - clear localStorage and re-login
- Wrong role - must be creator role

## 📊 Performance Tips

### Optimal Upload Sizes
- **Images**: Keep under 10MB for best performance
- **Videos**: Compress to 20-30MB when possible
- **Thumbnails**: Platform auto-generates previews

### Best Practices
- Fill in all metadata for better discoverability
- Use descriptive titles and captions
- Tag relevant people to increase engagement
- Add location for geographic context
- Upload high-quality content
- Monitor performance stats regularly

## 🔄 Future Enhancements

Potential features for future versions:
- Edit metadata after upload
- Bulk upload multiple files
- Schedule posts for later
- Advanced analytics dashboard
- Revenue/monetization tracking
- Content moderation tools
- Collaboration features
- Portfolio/showcase view

## 📄 File Structure

```
frontend/
├── creator-dashboard.html    # Main creator dashboard
├── upload-media.html          # Upload interface
├── login.html                 # Login page (updated)
├── register.html              # Registration (updated)
└── CREATOR_DASHBOARD.md       # This documentation
```

## 🤝 Integration with Consumer Interface

### Viewing Content
- Creators can view their posts in consumer interface
- Click "View" on any media card to open detail modal
- Same comment/like functionality as consumers

### Cross-Platform Features
- Media uploaded by creators appears in consumer feed
- Comments from consumers visible in both interfaces
- Like counts synchronized across platforms
- User profiles consistent between roles

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify API connectivity
4. Check authentication status
5. Contact platform support

---

**Built for creators** ❤️ Share your vision with O'larry
