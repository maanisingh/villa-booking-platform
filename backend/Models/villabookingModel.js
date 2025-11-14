// const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema({
//   // Villa se link
//   villa: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Villa',
//     required: true,
//   },
//   // Owner se link (Zaroori hai Owner Dashboard ke liye)
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   guestName: {
//     type: String,
//     required: true,
//   },
//   checkIn: {
//     type: Date,
//     required: true,
//   },
//   checkOut: {
//     type: Date,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ['Confirmed', 'Pending', 'Cancelled'],
//     default: 'Pending',
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['Paid', 'Unpaid', 'Partial'],
//     default: 'Unpaid',
//   },
//   // Revenue calculate karne ke liye ise required kar diya hai
//   price: {
//     type: Number,
//     required: true, 
//   },
// }, {
//   timestamps: true,
// });

// module.exports = mongoose.model('Booking', bookingSchema);