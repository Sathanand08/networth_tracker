const express = require('express');
const router = express.Router();

router.post('/repayment', (req, res) => {

  console.log('Received webhook:', req.body);
  
  res.status(200).json({ received: true });
});

module.exports = router;