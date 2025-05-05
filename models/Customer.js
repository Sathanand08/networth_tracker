const mongoose = require('mongoose');
const validator = require('validator');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide customer phone number'],
    validate: {
      validator: function(v) {
        return validator.isMobilePhone(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    type: String,
    trim: true
  },
  trustScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  totalCredit: {
    type: Number,
    default: 0
  },
  totalRepaid: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Customer must belong to a shopkeeper']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;