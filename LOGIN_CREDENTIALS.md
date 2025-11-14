# 🔐 Villa Booking Platform - Login Credentials

## 🌐 Access URL
**Production URL**: https://villas.alexandratechlab.com

---

## 👥 User Accounts

### 1. Admin Account (Super Admin)
- **Role**: Admin
- **Email**: `admin@gmail.com`
- **Password**: `123`
- **Dashboard**: `/admin-dashboard`
- **Permissions**:
  - Full system access
  - Create/manage owners
  - View all bookings
  - Manage all villas
  - System-wide analytics

### 2. Owner Account (Villa Owner)
- **Role**: Owner
- **Email**: `owner@gmail.com`
- **Password**: `123`
- **Dashboard**: `/owner-dashboard`
- **Permissions**:
  - Manage assigned villa(s)
  - View own bookings
  - Update profile
  - Change password
  - View villa-specific analytics

---

## 🚀 Quick Login Feature

The login page now includes **Quick Login buttons** for easy testing:

### On the Login Page:
1. Visit: https://villas.alexandratechlab.com
2. You'll see two buttons:
   - **"Admin Login"** - Auto-fills admin credentials
   - **"Owner Login"** - Auto-fills owner credentials
3. Click either button to auto-populate the form
4. Click "Sign In" to login

### Manual Login:
1. Select your role (Admin or Owner)
2. Enter email and password
3. Click "Sign In"

---

## 🔧 API Endpoints

### Authentication Endpoints:

#### Admin Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "123"
}
```

#### Owner Login
```bash
POST /api/owner/login
Content-Type: application/json

{
  "email": "owner@gmail.com",
  "password": "123"
}
```

#### Create New Owner (Admin Only)
```bash
POST /api/owners
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "Owner Name",
  "email": "neowner@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "assignedVilla": 1,
  "status": "Active"
}
```

---

## 📊 Role Comparison

| Feature | Admin | Owner |
|---------|-------|-------|
| Create Owners | ✅ | ❌ |
| Delete Owners | ✅ | ❌ |
| View All Bookings | ✅ | ⚠️ Own Only |
| Manage All Villas | ✅ | ⚠️ Assigned Only |
| System Analytics | ✅ | ⚠️ Villa-specific |
| Update Own Profile | ✅ | ✅ |
| Change Password | ✅ | ✅ |

---

## 🗃️ Database Information

### MongoDB Connection:
- **Host**: localhost (from host machine)
- **Port**: 27018
- **Database**: loginSystem
- **Collections**:
  - `logins` - User accounts (admin & owners)
  - `bookings` - Booking records
  - `villas` - Villa listings

### Connect to Database:
```bash
# Using Docker
docker exec -it villa-booking-mongodb mongosh loginSystem

# From host (if MongoDB client installed)
mongosh mongodb://localhost:27018/loginSystem
```

### View Users:
```bash
docker exec -it villa-booking-mongodb mongosh loginSystem --eval "db.logins.find().pretty()"
```

---

## 🔄 Creating Additional Users

### Via API (Admin Token Required):

1. **Login as Admin** to get token:
```bash
curl -X POST http://localhost:9000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}'
```

2. **Create New Owner**:
```bash
curl -X POST http://localhost:9000/api/owners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "9876543210",
    "assignedVilla": 2,
    "status": "Active"
  }'
```

### Via MongoDB Direct:
```bash
docker exec -it villa-booking-mongodb mongosh loginSystem --eval '
db.logins.insertOne({
  name: "Jane Owner",
  email: "jane@example.com",
  password: "$2b$10$/qzC0kND0CbfqxUe.w.JV.6bfGtP.6FiQ4.vMVXLSYO1Gjjx7SObe",
  phoneNumber: "5555555555",
  assignedVilla: 3,
  status: "Active",
  role: "owner",
  createdAt: new Date(),
  updatedAt: new Date()
})'
```
*Note: The password hash above is for "123"*

---

## 🛡️ Security Notes

### Current Setup (Development):
- ⚠️ **Hardcoded Admin Credentials**: Admin login uses hardcoded credentials (not database)
- ✅ **Owner Password Hashing**: Owner passwords are properly hashed with bcrypt
- ✅ **JWT Tokens**: Authentication uses JWT with 1-day expiration
- ✅ **HTTPS Enabled**: Production site secured with SSL

### Recommended for Production:
1. **Change Default Passwords**: Update admin credentials
2. **Environment Variables**: Move secrets to .env
3. **Database Admin Auth**: Store admin in database with hashed password
4. **Strong JWT Secret**: Use cryptographically secure random string
5. **Password Policy**: Enforce minimum 8 characters with complexity
6. **Rate Limiting**: Add rate limiting to prevent brute force
7. **2FA**: Consider adding two-factor authentication

---

## 🧪 Testing Scenarios

### 1. Admin Flow:
1. Login as admin
2. View dashboard with all statistics
3. Create a new owner
4. View all owners list
5. Manage villa listings
6. View all bookings across all villas

### 2. Owner Flow:
1. Login as owner
2. View personal dashboard
3. See assigned villa(s)
4. Manage bookings for assigned villa
5. Update profile information
6. Change password

### 3. Booking Flow:
1. Login as owner
2. Navigate to bookings
3. Create new booking
4. View/edit existing bookings
5. Check calendar availability

---

## 📝 Password Reset Flow

Currently, password reset is not implemented. Users must:
1. Contact admin to reset password, OR
2. Admin creates new account

**To implement password reset:**
- Add forgot password endpoint
- Implement email service
- Generate reset tokens
- Create reset password page

---

## 🎯 Quick Test Commands

### Test Admin Login:
```bash
curl -X POST https://villas.alexandratechlab.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}'
```

### Test Owner Login:
```bash
curl -X POST https://villas.alexandratechlab.com/api/owner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@gmail.com","password":"123"}'
```

### Check User Count:
```bash
docker exec villa-booking-mongodb mongosh loginSystem \
  --eval "db.logins.countDocuments()"
```

---

## 📞 Support & Troubleshooting

### Login Issues:

**"Invalid credentials"**
- Verify email and password are correct
- Check if user exists in database
- Ensure role is selected before login

**"Server not responding"**
- Check if backend container is running: `docker ps | grep villa-booking`
- View backend logs: `docker logs villa-booking-backend`
- Verify API endpoint in browser DevTools

**"Token expired"**
- Token expires after 1 day
- Simply login again to get new token
- Check localStorage in browser DevTools

### Database Issues:

**Check if users exist:**
```bash
docker exec villa-booking-mongodb mongosh loginSystem \
  --eval "db.logins.find({}, {name:1, email:1, role:1})"
```

**Reset owner password:**
```bash
docker exec villa-booking-mongodb mongosh loginSystem \
  --eval "db.logins.updateOne(
    {email: 'owner@gmail.com'},
    {\$set: {password: '\$2b\$10\$/qzC0kND0CbfqxUe.w.JV.6bfGtP.6FiQ4.vMVXLSYO1Gjjx7SObe'}}
  )"
```

---

## ✅ Summary

| Account Type | Email | Password | Dashboard |
|--------------|-------|----------|-----------|
| **Admin** | admin@gmail.com | 123 | /admin-dashboard |
| **Owner** | owner@gmail.com | 123 | /owner-dashboard |

**Live URL**: https://villas.alexandratechlab.com

**Quick Login**: Click "Admin Login" or "Owner Login" buttons on the login page!

---

*Last Updated: November 13, 2025*
