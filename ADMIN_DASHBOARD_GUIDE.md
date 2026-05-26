# Admin Dashboard Guide

## Overview

The Blih Brain Knowledge Base now includes a complete admin dashboard for managing content. Admins can create, edit, organize, and delete documents with a rich text editor while all changes are automatically saved and reflected on the public site.

## Accessing the Admin Dashboard

1. **Navigate to**: `http://localhost:3000/admin`
2. **Default Password**: `admin123`
3. **Customize**: Set `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable to change the password

## Admin Features

### 1. Dashboard Overview (`/admin/dashboard`)
- View statistics: Categories, Sections, Documents counts
- Quick reference guide for admin features
- Navigation to content management pages

### 2. Manage Content (`/admin/content`)
- **Search & Filter**: Find documents by title, category, or section
- **Create New Documents**: Click "New Document" to add content
- **Edit Documents**: Click any document card to edit
- **Delete Documents**: Remove unwanted documents (with confirmation)
- **Document List**: Scan all documents quickly with category/section context

### 3. Manage Structure (`/admin/structure`)
- **Add Categories**: Create new knowledge base categories
- **Manage Sections**: Add/remove sections within categories
- **Organize Content**: Expand/collapse categories to manage structure
- **View Document Counts**: See how many documents each section contains

### 4. Rich Text Editor
The document editor includes a full-featured TipTap editor with:
- **Text Formatting**: H1, H2 headings, Bold, Italic, Underline
- **Lists**: Bullet lists and ordered lists
- **Code & Quotes**: Inline code and blockquotes
- **Links**: Add clickable links to content
- **Auto-save**: Changes are automatically persisted to localStorage
- **Validation**: Required fields validation with inline error messages

## Document Management

### Creating a New Document
1. Click "New Document" button
2. Fill in the title (required)
3. Select a category and section (required)
4. Add content using the rich text editor (required)
5. Click "Save Document"
6. Document ID is auto-generated from timestamp

### Editing a Document
1. Go to "Manage Content"
2. Click any document in the list
3. Edit the title, content, or move to different section
4. Click "Save Document" to update
5. Changes appear immediately on the public site

### Deleting a Document
1. While editing, click the "Delete" button
2. Confirm deletion when prompted
3. Document is permanently removed from the knowledge base

## Data Storage & Publishing

### How It Works
- **Admin changes** are saved to browser's `localStorage`
- **Public site** reads from localStorage first, then falls back to mock data
- **Changes are immediate** - no publish step needed
- **Data persists** across browser sessions (within same browser)

### Syncing Between Browsers
- Edits in one browser don't appear in another
- Each browser maintains its own localStorage copy
- To sync: manually copy localStorage or implement a backend

## Navigation Features

### Responsive Design
- **Desktop**: Sidebar always visible, three-column layout
- **Tablet**: Sidebar hides in drawer, accessible via menu button
- **Mobile**: Optimized single-column view, touch-friendly controls

### Layout Features
- **Breadcrumbs**: Navigate the document hierarchy
- **Table of Contents**: Auto-generated from document sections
- **Sidebar Navigation**: Quick access to all categories/sections
- **Logout**: Secure session management with 24-hour timeout

## Best Practices

1. **Use Descriptive Titles**: Help admins find content quickly
2. **Organize with Sections**: Group related documents
3. **Consistent Formatting**: Use headings and lists for readability
4. **Add Links**: Cross-reference related documents
5. **Regular Updates**: Keep content fresh and accurate

## Customization

### Change Admin Password
Set environment variable:
```bash
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

### Modify Rich Text Features
Edit `/components/RichTextEditor.tsx` to:
- Add/remove formatting options
- Change toolbar layout
- Customize editor styling
- Add new extensions

### Customize Dashboard Layout
Edit admin pages in `/app/admin/` to:
- Change color scheme
- Modify statistics displayed
- Add new features
- Adjust responsive breakpoints

## Troubleshooting

### Lost Changes?
- Check localStorage hasn't been cleared
- Verify you're logged in and changes were saved
- Check browser console for errors

### Data Not Showing on Public Site?
- Refresh the public site page
- Check that localStorage has data saved
- Verify admin changes were saved successfully

### Password Not Working?
- Verify environment variable is set correctly
- Clear browser cookies and try again
- Check that password matches exactly

## Security Notes

⚠️ **Important**: This demo uses localStorage and client-side authentication. For production:
- Implement server-side authentication with proper sessions
- Use a real database (PostgreSQL, MongoDB, etc.)
- Add proper access controls and user management
- Implement API authentication with tokens
- Use HTTPS for all admin connections
- Add audit logging for content changes

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all required fields are filled
3. Clear localStorage if data seems corrupted
4. Review the latest changes in the admin dashboard
