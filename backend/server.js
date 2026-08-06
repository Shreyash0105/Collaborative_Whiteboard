require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Session = require('./models/Session');
const User = require('./models/Users');
const auth = require('./middleware/auth'); // Import the middleware

const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Wrap Express with Node's native HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS settings to allow your React app to connect
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST", "PUT"]
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ email, password });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login user and get token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Compare plain text password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate JWT
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ==========================================
// PROTECTED SESSION ROUTES
// ==========================================

// Get all sessions FOR THE LOGGED IN USER
app.get('/api/sessions', auth, async (req, res) => {
  try {
    // Notice we filter by owner: req.user.id
    const sessions = await Session.find({
      $or: [{ owner: req.user.id }, { sharedWith: req.user.id }]
    }, 'title lastModified owner').sort({ lastModified: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get a specific session
app.get('/api/sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    // Check if user is owner OR in sharedWith array
    const isOwner = session.owner.toString() === req.user.id;
    const isShared = session.sharedWith.includes(req.user.id);
    
    if (!isOwner && !isShared) {
      return res.status(401).json({ msg: 'Not authorized to view this session' });
    }
    
    res.json(session);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create a new empty session
app.post('/api/sessions', auth, async (req, res) => {
  try {
    const newSession = await Session.create({ 
      title: req.body.title, 
      elements: [],
      owner: req.user.id, // Attach the user ID from the JWT token
      sharedWith: []
    });
    res.json(newSession);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Save/Update canvas elements
app.put('/api/sessions/:id', auth, async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);
    
    const isOwner = session.owner.toString() === req.user.id;
    const isShared = session.sharedWith.includes(req.user.id);
    
    if (!isOwner && !isShared) {
      return res.status(401).json({ msg: 'Not authorized to edit this session' });
    }

    session.elements = req.body.elements;
    session.lastModified = Date.now();
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).send('Server error');
  }
});


// NEW: Share a session with another user
app.post('/api/sessions/:id/share', auth, async (req, res) => {
  try {
    const { email } = req.body;
    
    // 1. Find the session and verify ownership
    const session = await Session.findById(req.params.id);
    if (session.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only the owner can share this session' });
    }

    // 2. Find the target user by email
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found with that email' });
    }

    // 3. Prevent sharing with yourself or duplicating shares
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Cannot share with yourself' });
    }
    if (session.sharedWith.includes(targetUser._id)) {
      return res.status(400).json({ msg: 'Session already shared with this user' });
    }

    // 4. Add to array and save
    session.sharedWith.push(targetUser._id);
    await session.save();

    res.json({ msg: `Successfully shared with ${email}` });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ==========================================
// WEBSOCKET (REAL-TIME) LOGIC
// ==========================================
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Join a specific whiteboard session
  socket.on('join-board', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined board ${sessionId}`);
  });

  // 2. Receive drawing data and broadcast to everyone else in the room
  socket.on('draw', ({ sessionId, elements }) => {
    socket.to(sessionId).emit('board-updated', elements);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.BACKEND_PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));