const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const moment = require('moment');

// Create a new loan
const createLoan = async (req, res) => {
  try {
    // Check if the customer belongs to the logged-in user
    const customer = await Customer.findOne({
      _id: req.body.customer,
      user: req.user.id
    });

    if (!customer) {
      return res.status(404).json({
        status: 'fail',
        message: 'No customer found with that ID or customer does not belong to you'
      });
    }

    // Create the loan
    const newLoan = await Loan.create({
      ...req.body,
      user: req.user.id,
      remainingAmount: req.body.amount
    });

    // Update customer's totalCredit
    customer.totalCredit += req.body.amount;
    await customer.save();

    res.status(201).json({
      status: 'success',
      data: {
        loan: newLoan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all loans for the logged-in user
const getAllLoans = async (req, res) => {
  try {
    let query = { user: req.user.id };
    
    // Filter by status if provided
    if (req.query.status && ['pending', 'paid', 'overdue'].includes(req.query.status)) {
      query.status = req.query.status;
    }
    
    // Filter by customer if provided
    if (req.query.customer) {
      query.customer = req.query.customer;
    }

    const loans = await Loan.find(query)
      .populate({
        path: 'customer',
        select: 'name phone'
      });
    
    // Update status of each loan based on due date
    for (let loan of loans) {
      const originalStatus = loan.status;
      loan.updateStatus();
      if (originalStatus !== loan.status) {
        await loan.save();
      }
    }

    res.status(200).json({
      status: 'success',
      results: loans.length,
      data: {
        loans
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single loan
const getLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate({
      path: 'customer',
      select: 'name phone'
    });

    if (!loan) {
      return res.status(404).json({
        status: 'fail',
        message: 'No loan found with that ID'
      });
    }

    // Update status based on due date
    const originalStatus = loan.status;
    loan.updateStatus();
    if (originalStatus !== loan.status) {
      await loan.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        loan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Record a repayment
const recordRepayment = async (req, res) => {
  try {
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid repayment amount'
      });
    }

    const loan = await Loan.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!loan) {
      return res.status(404).json({
        status: 'fail',
        message: 'No loan found with that ID'
      });
    }

    // Add repayment
    loan.repayments.push({
      amount,
      date: Date.now(),
      notes: notes || ''
    });

    // Update remaining amount
    loan.remainingAmount = Math.max(0, loan.remainingAmount - amount);
    
    // Update status
    loan.updateStatus();
    
    await loan.save();

    // Update customer's totalRepaid
    const customer = await Customer.findById(loan.customer);
    customer.totalRepaid += amount;
    await customer.save();

    res.status(200).json({
      status: 'success',
      data: {
        loan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get summary of loans
const getSummary = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id });
    
    let totalLoaned = 0;
    let totalCollected = 0;
    let overdueAmount = 0;
    let repaymentTimes = [];

    loans.forEach(loan => {
      totalLoaned += loan.amount;
      
      // Calculate total collected from repayments
      const collected = loan.repayments.reduce((sum, rep) => sum + rep.amount, 0);
      totalCollected += collected;
      
      // Calculate overdue amount
      loan.updateStatus();
      if (loan.status === 'overdue') {
        overdueAmount += loan.remainingAmount;
      }
      
      // Calculate repayment time for fully paid loans
      if (loan.status === 'paid' && loan.repayments.length > 0) {
        const loanDate = moment(loan.createdAt);
        const lastRepaymentDate = moment(loan.repayments[loan.repayments.length - 1].date);
        const days = lastRepaymentDate.diff(loanDate, 'days');
        repaymentTimes.push(days);
      }
    });
    
    // Calculate average repayment time
    const avgRepaymentTime = repaymentTimes.length > 0 
      ? Math.round(repaymentTimes.reduce((sum, time) => sum + time, 0) / repaymentTimes.length) 
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalLoaned,
        totalCollected,
        overdueAmount,
        avgRepaymentTime,
        totalPending: totalLoaned - totalCollected
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get overdue loans
const getOverdueLoans = async (req, res) => {
  try {
    const loans = await Loan.find({
      user: req.user.id,
      remainingAmount: { $gt: 0 }
    }).populate({
      path: 'customer',
      select: 'name phone'
    });
    
    // Filter loans that are overdue
    const overdueLoans = loans.filter(loan => {
      loan.updateStatus();
      return loan.status === 'overdue';
    });
    
    // Save any status changes
    for (const loan of overdueLoans) {
      if (loan.isModified()) {
        await loan.save();
      }
    }

    res.status(200).json({
      status: 'success',
      results: overdueLoans.length,
      data: {
        overdueLoans
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoan,
  recordRepayment,
  getSummary,
  getOverdueLoans
};