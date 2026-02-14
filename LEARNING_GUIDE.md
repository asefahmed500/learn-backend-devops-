# Mongoose Learning Guide

## Complete Guide to Understanding Mongoose Concepts in This Project

---

## 1. 📋 Schema Definition

**What it is**: A blueprint that defines the structure of documents in a MongoDB collection.

**Example from User.ts**:
```typescript
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'manager']
  }
});
```

**Key Points**:
- Defines field names and types
- Sets validation rules
- Specifies default values
- Controls uniqueness

---

## 2. ✅ Validation

**What it is**: Rules that ensure data meets certain criteria before saving.

**Built-in Validators**:
```typescript
{
  username: {
    type: String,
    required: true,      // Field must exist
    unique: true,        // Must be unique in collection
    minlength: 3,        // Minimum length
    maxlength: 30,       // Maximum length
    trim: true,          // Remove whitespace
    lowercase: true      // Convert to lowercase
  }
}
```

**Custom Validators**:
```typescript
{
  username: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^[a-z0-9_]+$/.test(v);
      },
      message: 'Username can only contain lowercase letters and numbers'
    }
  }
}
```

---

## 3. 🔍 Indexes

**What it is**: Database structures that improve query performance.

**Example**:
```typescript
// Single field index
userSchema.index({ email: 1 });

// Compound index (multiple fields)
userSchema.index({ role: 1, isActive: 1 });

// Text search index
taskSchema.index({ title: 'text', description: 'text' });
```

**When to use**:
- Fields you frequently query
- Fields used in sorting
- Fields used in filtering
- Text search fields

**Query with index**:
```typescript
// Fast query using index
const users = await User.find({ email: 'john@example.com' });
```

---

## 4. 🔄 Middleware (Hooks)

**What it is**: Functions that run before or after certain operations.

### Pre-save Hook
```typescript
userSchema.pre('save', async function(next) {
  // Runs BEFORE saving
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### Post-save Hook
```typescript
userSchema.post('save', function(doc) {
  // Runs AFTER saving
  console.log('User saved:', doc.email);
});
```

**Common Use Cases**:
- Hashing passwords
- Updating timestamps
- Logging changes
- Cascading deletes
- Data validation

---

## 5. 🎯 Virtual Properties

**What it is**: Computed fields that don't get stored in the database.

**Example**:
```typescript
// Define virtual
userSchema.virtual('profileUrl').get(function() {
  return `/users/${this._id}`;
});

// Use virtual
const user = await User.findById(id);
console.log(user.profileUrl); // "/users/507f1f77bcf86cd799439011"
```

**Virtual Populate** (for relationships):
```typescript
userSchema.virtual('tasks', {
  ref: 'Task',           // Model to use
  localField: '_id',     // Field in this model
  foreignField: 'assignedTo'  // Field in other model
});

// Use it
const user = await User.findById(id).populate('tasks');
console.log(user.tasks); // Array of tasks
```

---

## 6. 🛠️ Instance Methods

**What it is**: Methods available on individual documents.

**Define**:
```typescript
userSchema.methods.comparePassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
};
```

**Use**:
```typescript
const user = await User.findById(id).select('+password');
const isMatch = await user.comparePassword('password123');
```

**Common Use Cases**:
- Password comparison
- Generating tokens
- Formatting data
- Document-specific operations

---

## 7. 📊 Static Methods

**What it is**: Methods available on the model itself (not on documents).

**Define**:
```typescript
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};
```

**Use**:
```typescript
const user = await User.findByEmail('john@example.com');
```

**Common Use Cases**:
- Custom find operations
- Bulk operations
- Complex queries
- Statistics

---

## 8. 🔗 Query Helpers

**What it is**: Custom query chain methods.

**Define**:
```typescript
userSchema.query.byRole = function(role: string) {
  return this.where({ role });
};

userSchema.query.active = function() {
  return this.where({ isActive: true });
};
```

**Use**:
```typescript
// Chain them together!
const users = await User
  .find()
  .byRole('admin')
  .active()
  .sort({ createdAt: -1 });
```

---

## 9. 🔗 Population (References)

**What it is**: Replacing ObjectId references with actual documents.

**Define Reference**:
```typescript
const taskSchema = new Schema({
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'  // References User model
  }
});
```

**Use**:
```typescript
// Without populate - gets only ID
const task = await Task.findById(id);
console.log(task.assignedTo); // ObjectId

// With populate - gets full user object
const task = await Task.findById(id).populate('assignedTo');
console.log(task.assignedTo); // { _id, username, email, ... }

// Populate with field selection
const task = await Task.findById(id)
  .populate('assignedTo', 'username email');

// Multiple populations
const task = await Task.findById(id)
  .populate('assignedTo')
  .populate('project')
  .populate('createdBy');
```

---

## 10. 📦 Subdocuments (Embedded Documents)

**What it is**: Documents nested inside other documents.

**Define**:
```typescript
const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  text: String,
  createdAt: Date
});

const taskSchema = new Schema({
  title: String,
  comments: [commentSchema]  // Array of subdocuments
});
```

**Use**:
```typescript
// Add subdocument
const task = await Task.findById(id);
task.comments.push({
  user: userId,
  text: 'Great work!',
  createdAt: new Date()
});
await task.save();

// Access subdocuments
console.log(task.comments[0].text);
```

---

## 11. 📈 Aggregation Pipeline

**What it is**: Powerful framework for data analysis and transformation.

**Example - Group by status**:
```typescript
const stats = await Task.aggregate([
  // Stage 1: Match documents
  { $match: { project: projectId } },
  
  // Stage 2: Group by status
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgHours: { $avg: '$estimatedHours' }
    }
  },
  
  // Stage 3: Sort results
  { $sort: { count: -1 } }
]);

// Result:
// [
//   { _id: 'todo', count: 10, avgHours: 5 },
//   { _id: 'done', count: 8, avgHours: 4.5 }
// ]
```

**Common Pipeline Stages**:
- `$match` - Filter documents
- `$group` - Group and aggregate
- `$sort` - Sort results
- `$project` - Select/reshape fields
- `$lookup` - Join with other collections
- `$facet` - Multiple aggregations in one query

**Complex Example**:
```typescript
const analytics = await Task.aggregate([
  {
    $facet: {
      // Multiple aggregations at once
      byStatus: [
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ],
      byPriority: [
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ],
      overall: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgHours: { $avg: '$estimatedHours' }
          }
        }
      ]
    }
  }
]);
```

---

## 12. 🔨 Bulk Operations

**What it is**: Operating on multiple documents at once.

**updateMany**:
```typescript
// Update all matching documents
await Task.updateMany(
  { status: 'todo' },
  { $set: { priority: 'low' } }
);
```

**deleteMany**:
```typescript
// Delete all matching documents
await Task.deleteMany({ isCompleted: true });
```

**bulkWrite** (advanced):
```typescript
await Task.bulkWrite([
  {
    updateOne: {
      filter: { _id: id1 },
      update: { $set: { status: 'done' } }
    }
  },
  {
    deleteOne: {
      filter: { _id: id2 }
    }
  }
]);
```

---

## 13. ⏰ Timestamps

**What it is**: Automatic createdAt and updatedAt fields.

**Enable**:
```typescript
const userSchema = new Schema({
  username: String
}, {
  timestamps: true  // Adds createdAt and updatedAt
});
```

**Result**:
```typescript
{
  _id: "...",
  username: "john",
  createdAt: "2024-01-01T10:00:00.000Z",
  updatedAt: "2024-01-02T15:30:00.000Z"
}
```

---

## 14. 🔍 Querying

### Basic Queries
```typescript
// Find all
const users = await User.find();

// Find with filter
const admins = await User.find({ role: 'admin' });

// Find one
const user = await User.findOne({ email: 'john@example.com' });

// Find by ID
const user = await User.findById('507f1f77bcf86cd799439011');
```

### Advanced Queries
```typescript
// Comparison operators
const users = await User.find({
  age: { $gte: 18, $lte: 65 }  // Greater/less than or equal
});

// Logical operators
const users = await User.find({
  $or: [
    { role: 'admin' },
    { role: 'manager' }
  ]
});

// Regular expressions
const users = await User.find({
  username: { $regex: 'john', $options: 'i' }  // Case-insensitive
});

// Array operations
const tasks = await Task.find({
  tags: { $in: ['urgent', 'important'] }
});
```

### Query Chaining
```typescript
const users = await User
  .find({ isActive: true })
  .select('username email')      // Select specific fields
  .sort({ createdAt: -1 })      // Sort descending
  .skip(10)                      // Skip first 10
  .limit(5)                      // Limit to 5 results
  .populate('tasks');            // Populate references
```

---

## 15. 📝 CRUD Operations

### Create
```typescript
// Method 1: Using create
const user = await User.create({
  username: 'john',
  email: 'john@example.com'
});

// Method 2: Using new + save
const user = new User({
  username: 'john',
  email: 'john@example.com'
});
await user.save();
```

### Read
```typescript
// Find all
const users = await User.find();

// Find with conditions
const user = await User.findOne({ email: 'john@example.com' });

// Find by ID
const user = await User.findById(id);
```

### Update
```typescript
// Method 1: findByIdAndUpdate
const user = await User.findByIdAndUpdate(
  id,
  { $set: { username: 'newname' } },
  { new: true, runValidators: true }
);

// Method 2: Find + save (runs middleware)
const user = await User.findById(id);
user.username = 'newname';
await user.save();

// Method 3: updateMany
await User.updateMany(
  { isActive: false },
  { $set: { role: 'inactive' } }
);
```

### Delete
```typescript
// Method 1: findByIdAndDelete
await User.findByIdAndDelete(id);

// Method 2: Find + delete
const user = await User.findById(id);
await user.deleteOne();

// Method 3: deleteMany
await User.deleteMany({ isActive: false });
```

---

## 16. 💡 Best Practices

1. **Always use TypeScript interfaces** for type safety
2. **Use indexes** for frequently queried fields
3. **Use select** to limit returned fields
4. **Use lean()** for read-only operations (faster)
5. **Use populate** wisely (can be slow)
6. **Handle errors** properly with try-catch
7. **Use validation** at schema level
8. **Use middleware** for cross-cutting concerns
9. **Use virtuals** for computed fields
10. **Use aggregation** for complex analytics

---

## 17. 🎯 Common Patterns

### Pagination
```typescript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const users = await User
  .find()
  .skip(skip)
  .limit(limit);

const total = await User.countDocuments();
const pages = Math.ceil(total / limit);
```

### Search
```typescript
const search = 'john';
const users = await User.find({
  $or: [
    { username: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { fullName: { $regex: search, $options: 'i' } }
  ]
});
```

### Soft Delete
```typescript
// Instead of deleting, mark as deleted
const userSchema = new Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
});

// Override delete methods
userSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Filter out deleted in queries
userSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});
```

---

## 🚀 Practice Exercises

1. Add a new field to User model with custom validation
2. Create a middleware that logs all updates
3. Add a virtual field that calculates user's age
4. Create an aggregation to find top 5 most productive users
5. Implement full-text search across multiple fields
6. Add a compound index and test query performance
7. Create a static method to find users with overdue tasks
8. Implement cascade delete for projects and tasks

---

**Keep practicing! The more you use these concepts, the more natural they'll become!**
