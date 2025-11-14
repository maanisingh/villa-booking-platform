const mongoose = require('mongoose');

const villaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  type: {
    type: String, // "3BHK", "4BHK" etc.
  },
  price: {
    type: String, // "1.25 Cr"
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Under Maintenance'],
    default: 'Available',
  },
  area: {
    type: String, // "2500" (sq. ft.)
  },
  description: {
    type: String,
  },
  
  // Owner ko link karna - Mixed type to support both ObjectId and String
  owner: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Login',
    default: null,
  },

  // === YEH NAYI LINES ADD KI HAIN ===
  agreementStartDate: {
    type: Date,
    default: null
  },
  agreementEndDate: {
    type: Date,
    default: null
  },
  // ===================================

  // === PLATFORM INTEGRATION FIELDS ===
  publishedPlatforms: {
    type: [String], // ['airbnb', 'booking_com', 'vrbo']
    default: [],
  },
  externalListingIds: {
    type: Map,
    of: String, // { airbnb: '12345', booking_com: '67890' }
    default: new Map(),
  },
  amenities: {
    type: [String],
    default: [],
  },
  // ====================================

}, {
  timestamps: true,
});

module.exports = mongoose.model('Villa', villaSchema);