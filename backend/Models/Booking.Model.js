// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true, minlength: 6 },
//   phoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
//   assignedVilla: { type: String, trim: true },
//   //status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
//   status: { 
//     type: String, 
//     enum: ["Confirmed", "Pending", "Cancelled"], 
//     default: "Pending" 
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("User", userSchema);



const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  guestName: { 
    type: String, 
    required: true, 
    trim: true 
  },
   villa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Villa',
      required: true,
    },

  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },

  phone: { 
    type: String, 
    required: true, 
    match: /^[0-9]{10}$/, 
    trim: true 
  },

  villaName: { 
    type: String, 
    required: true, 
    trim: true 
  },

  checkIn: { 
    type: Date, 
    required: true 
  },

  checkOut: { 
    type: Date, 
    required: true 
  },

  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },

  paymentMethod: { 
    type: String, 
    enum: ["UPI", "Cash", "Card", "Bank Transfer"], 
    default: "UPI" 
  },

  status: { 
    type: String, 
    enum: ["Confirmed", "Pending", "Cancelled"], 
    default: "Pending" 
  },

  paymentStatus: { 
    type: String, 
    enum: ["Paid", "Unpaid", "Refunded"], 
    default: "Unpaid" 
  },

  notes: { 
    type: String, 
    trim: true 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("user", userSchema);
