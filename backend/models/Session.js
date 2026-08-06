const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Whiteboard' },
  elements: { type: Array, default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);