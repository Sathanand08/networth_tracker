const mongoose = require('mongoose');
const moment = require('moment');

const loanSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'A loan must have an amount'],
    min: [1, 'Loan amount must be at least 1']
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'A loan must have a due date']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  remainingAmount: {
    type: Number,
    min: 0
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Loan must belong to a customer']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Loan must belong to a shopkeeper']
  },
  repayments: [
    {
      amount: {
        type: Number,
        required: true,
        min: 1
      },
      date: {
        type: Date,
        default: Date.now
      },
      notes: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Set remainingAmount equal to amount on creation
loanSchema.pre('save', function(next) {
  if (this.isNew) {
    this.remainingAmount = this.amount;
  }
  next();
});

// Method to update loan status based on due date
loanSchema.methods.updateStatus = function() {
  if (this.remainingAmount <= 0) {
    this.status = 'paid';
  } else if (moment().isAfter(this.dueDate)) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  return this.status;
};

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;