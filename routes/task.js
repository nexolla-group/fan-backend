const {
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getSingleContribution,
} = require("../controllers/task");

const router = require("express").Router();

router.route("/").get(getContribution).post(createContribution);
router
  .route("/:taskId")
  .put(updateContribution)
  .delete(deleteContribution)
  .get(getSingleContribution);
module.exports = router;
