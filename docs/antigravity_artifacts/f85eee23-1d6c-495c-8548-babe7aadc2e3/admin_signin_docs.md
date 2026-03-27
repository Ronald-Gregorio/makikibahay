# Admin Sign-In Documentation

This document provides instructions on how to access the Admin Panel and manage administrative roles in the Makikibahay platform.

## 🔑 Default Admin Credentials (Mockup)

For development and demonstration purposes, the platform includes a "mock" admin account that bypasses the backend and allows immediate access to the admin dashboard.

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `admin123` | **Admin** |

> [!NOTE]
> These credentials work on the standard **Login Page** (`/login`). You do not need to select a specific tab; simply enter the details and click **Sign In**.

## 🚀 Accessing the Admin Panel

Once logged in as an admin, you can access the management dashboard at:
**[http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)**

The Admin Panel includes sections for:
- **User Management**: View and verify registered users.
- **Listing Moderation**: Review and approve property listings.
- **System Metrics**: Monitor platform performance and usage.
- **Logs**: View application and system logs.

## 🛠️ Managing Roles in Database

If you wish to promote a regular user to an **Admin** role in the actual database, you can do so by updating their `role` field in MongoDB.

### Using MongoDB Compass / Atlas
1. Connect to your database (`test`).
2. Navigate to the `users` collection.
3. Find the user document by their email.
4. Edit the `role` field from `"user"` or `"owner"` to `"admin"`.
5. Save the changes.

### Using a Script
You can also use the following script to promote a user via the terminal:

```typescript
// apps/backend/src/scripts/promote-admin.ts
import mongoose from 'mongoose';
import User from '../models/User';

async function promote(email: string) {
    await mongoose.connect(process.env.MONGODB_URI!);
    await User.findOneAndUpdate({ email }, { role: 'admin' });
    console.log(`${email} is now an Admin`);
    process.exit(0);
}

promote('your-email@example.com');
```

## 🛡️ Role-Based Access Control (RBAC)

- **Frontend**: The route `/admin/*` is protected by the `AdminLayout` component. It checks the `user.role` from the `useAuth` hook and redirects non-admins to `/login`.
- **Backend**: API routes starting with `/api/admin` (to be implemented/expanded) should utilize the `admin` middleware to verify the role from the JWT token.
