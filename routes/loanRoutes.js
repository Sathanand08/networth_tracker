const express = require('express');
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

router.get('/summary', loanController.getSummary);
router.get('/overdue', loanController.getOverdueLoans);
router
  .route('/')
  .get(loanController.getAllLoans)
  .post(loanController.createLoan);

router.route('/:id').get(loanController.getLoan);
router.route('/:id/repayment').post(loanController.recordRepayment);


module.exports = router;