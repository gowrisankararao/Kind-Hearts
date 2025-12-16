# Kind Hearts - Backend

## Setup

1. Ensure MySQL is running and you have the credentials:
   - DB_USER=root
   - DB_PASS=Gowri@123

2. Import the database schema:
   - From terminal: `mysql -u root -p < db_init.sql`
   - (Or run the SQL inside db_init.sql manually)

3. Install dependencies:
   ```
   cd backend
   npm install
   ```

4. Start server:
   ```
   npm start
   ```

5. Open frontend files in a browser (frontend is static files in the parent folder).
   - Register -> Login -> Dashboard -> Report Case -> Donate

API endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/upload/person
- POST /api/donate
- GET /api/reports?user_id=#

// Example fetch request
const res = await fetch('https://your-backend.onrender.com/api/reports?user_id=...');
