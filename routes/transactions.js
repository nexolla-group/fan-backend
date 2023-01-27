const {
  getTransaction,
  createTransaction,
  getTransactionsPerTask,
  createCallback,
  displayCallback,
  withdraw,
} = require("../controllers/transaction");

const router = require("express").Router();

router.route("/").get(getTransaction).post(createTransaction);
router.route("/task/:taskId").get(getTransactionsPerTask);
router.route("/callback/payment/:transactionId").post(createCallback);
router.route("/callback").get(displayCallback);
router.route("/withdraw").put(withdraw);

module.exports = router;
