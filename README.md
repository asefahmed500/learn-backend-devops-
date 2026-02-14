# Task Management API - Complete Mongoose + TypeScript Learning Project

A comprehensive REST API built with **TypeScript**, **Express.js**, and **Mongoose** to learn all core concepts of backend development with MongoDB.

## 🎯 Learning Objectives

This project covers:

### TypeScript Concepts
- ✅ Interfaces and Types
- ✅ Type safety for Express routes and Mongoose models
- ✅ Generic types
- ✅ Enums
- ✅ Async/await with proper typing

### Mongoose ORM Features
- ✅ **Schema Definition** - Defining document structure
- ✅ **Data Types** - String, Number, Date, Boolean, ObjectId, Arrays, Mixed
- ✅ **Validation** - Built-in and custom validators
- ✅ **Indexes** - Single, compound, and text search indexes
- ✅ **Middleware (Hooks)** - pre/post save, update, delete
- ✅ **Virtual Properties** - Computed fields
- ✅ **Instance Methods** - Methods on documents
- ✅ **Static Methods** - Methods on models
- ✅ **Query Helpers** - Custom query chains
- ✅ **Population** - Referencing other collections
- ✅ **Subdocuments** - Embedded documents
- ✅ **Aggregation Pipeline** - Complex data analysis
- ✅ **Bulk Operations** - updateMany, deleteMany
- ✅ **Timestamps** - Auto createdAt/updatedAt

### REST API Concepts
- ✅ CRUD Operations (Create, Read, Update, Delete)
- ✅ Query Parameters (filtering, sorting, pagination, search)
- ✅ Route organization
- ✅ Error handling
- ✅ HTTP Status codes
- ✅ RESTful conventions

## 📁 Project Structure

```
task-management-api/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── models/
│   │   ├── User.ts              # User model with all Mongoose features
│   │   ├── Project.ts           # Project model with references
│   │   └── Task.ts              # Task model with subdocuments
│   ├── controllers/
│   │   ├── userController.ts    # User business logic
│   │   ├── projectController.ts # Project business logic
│   │   └── taskController.ts    # Task business logic
│   ├── routes/
│   │   ├── userRoutes.ts        # User endpoints
│   │   ├── projectRoutes.ts     # Project endpoints
│   │   └── taskRoutes.ts        # Task endpoints
│   └── server.ts                # Main application entry point
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or create the project**
```bash
mkdir task-management-api
cd task-management-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

5. **Run the development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Users API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user |
| GET | `/api/users` | Get all users (with filters) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/active/list` | Get all active users |
| GET | `/api/users/role/:role` | Get users by role |

### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create new project |
| GET | `/api/projects` | Get all projects (with filters) |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/projects/:id/analytics` | Get project analytics |

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks` | Get all tasks (with filters) |
| GET | `/api/tasks/:id` | Get task by ID |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/complete` | Mark task as complete |
| POST | `/api/tasks/:id/comments` | Add comment to task |
| GET | `/api/tasks/analytics/statistics` | Get task statistics |
| GET | `/api/tasks/status/overdue` | Get overdue tasks |
| PATCH | `/api/tasks/bulk/update` | Bulk update tasks |

## 🧪 API Usage Examples

### 1. Create a User
```bash
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "user"
}
```

### 2. Get Users with Filtering
```bash
GET http://localhost:5000/api/users?role=admin&isActive=true&page=1&limit=10&sortBy=createdAt&order=desc
```

### 3. Create a Project
```bash
POST http://localhost:5000/api/projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "owner": "USER_ID_HERE",
  "members": ["USER_ID_1", "USER_ID_2"],
  "status": "active",
  "priority": "high",
  "startDate": "2024-01-01",
  "tags": ["frontend", "design"]
}
```

### 4. Create a Task
```bash
POST http://localhost:5000/api/tasks
Content-Type: application/json

{
  "title": "Design Homepage",
  "description": "Create mockup for new homepage",
  "project": "PROJECT_ID_HERE",
  "assignedTo": "USER_ID_HERE",
  "createdBy": "USER_ID_HERE",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-31",
  "estimatedHours": 8,
  "tags": ["design", "ui"]
}
```

### 5. Add Comment to Task
```bash
POST http://localhost:5000/api/tasks/TASK_ID/comments
Content-Type: application/json

{
  "userId": "USER_ID_HERE",
  "text": "Great progress on this task!"
}
```

### 6. Get Task Statistics
```bash
GET http://localhost:5000/api/tasks/analytics/statistics?projectId=PROJECT_ID
```

### 7. Search Users
```bash
GET http://localhost:5000/api/users?search=john&page=1&limit=5
```

### 8. Get Overdue Tasks
```bash
GET http://localhost:5000/api/tasks/status/overdue
```

## 🎓 Key Learning Points

### 1. Schema Definition
```typescript
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters']
  }
});
```

### 2. Virtual Properties
```typescript
userSchema.virtual('profileUrl').get(function() {
  return `/users/${this._id}`;
});
```

### 3. Middleware (Hooks)
```typescript
// Pre-save hook
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### 4. Instance Methods
```typescript
userSchema.methods.comparePassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
};
```

### 5. Static Methods
```typescript
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};
```

### 6. Population (References)
```typescript
const task = await Task.findById(id)
  .populate('project', 'name status')
  .populate('assignedTo', 'username email');
```

### 7. Aggregation Pipeline
```typescript
const stats = await Task.aggregate([
  { $match: { project: projectId } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

### 8. Query Helpers
```typescript
taskSchema.query.byStatus = function(status: string) {
  return this.where({ status });
};

// Usage: Task.find().byStatus('done')
```

### 9. Subdocuments
```typescript
comments: [{
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  text: String,
  createdAt: Date
}]
```

### 10. Indexes
```typescript
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 }); // Compound index
userSchema.index({ name: 'text' }); // Text search index
```

## 🔍 Advanced Features Demonstrated

### Pagination
```typescript
const skip = (page - 1) * limit;
const users = await User.find()
  .skip(skip)
  .limit(limit);
```

### Text Search
```typescript
// Enable text search with index
taskSchema.index({ title: 'text', description: 'text' });

// Search
const tasks = await Task.find({ $text: { $search: 'design' } });
```

### Bulk Operations
```typescript
await Task.updateMany(
  { _id: { $in: taskIds } },
  { $set: { status: 'done' } }
);
```

### Complex Aggregations
```typescript
const analytics = await Task.aggregate([
  { $match: { project: projectId } },
  {
    $facet: {
      byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }]
    }
  }
]);
```

## 🛠️ Testing the API

### Using cURL
```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456","fullName":"Test User"}'

# Get all users
curl http://localhost:5000/api/users
```

### Using Postman or Thunder Client
1. Import the collection
2. Set base URL: `http://localhost:5000`
3. Test all endpoints

## 📖 Mongoose Concepts Covered

1. **Schema & Models**: Define structure and create models
2. **Validation**: Built-in and custom validators
3. **Middleware**: Pre/post hooks for save, update, delete
4. **Virtual Properties**: Computed fields not stored in DB
5. **Instance Methods**: Methods available on documents
6. **Static Methods**: Methods available on models
7. **Query Helpers**: Custom query chains
8. **Population**: References between collections
9. **Subdocuments**: Embedded documents
10. **Indexes**: Performance optimization
11. **Aggregation**: Complex data analysis
12. **Timestamps**: Auto createdAt/updatedAt
13. **Plugins**: Reusable schema functionality

## 🎯 Next Steps

To further enhance your learning:

1. **Add Authentication**
   - JWT tokens
   - Password reset
   - Email verification

2. **Add Authorization**
   - Role-based access control
   - Permissions

3. **Add Validation**
   - express-validator
   - Custom validation middleware

4. **Add File Upload**
   - Multer
   - Cloud storage (AWS S3, Cloudinary)

5. **Add Real-time Features**
   - Socket.io for live updates
   - WebSockets

6. **Add Testing**
   - Jest
   - Supertest
   - Integration tests

7. **Add Documentation**
   - Swagger/OpenAPI
   - API documentation

## 📝 License

This is a learning project - feel free to use and modify as needed!

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

---

**Happy Learning! 🚀**
#   l e a r n - b a c k e n d - d e v o p s - 
 
 
