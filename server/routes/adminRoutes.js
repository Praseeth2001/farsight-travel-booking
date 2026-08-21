const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getPendingPackages,
  approvePackage,
  rejectPackage,
  getUsers,
  getAllPackages,
} = require('../controllers/adminController');

router.use(protect, restrictTo('admin')); // every route below requires an admin

router.get('/packages/pending', getPendingPackages);
router.get('/packages', getAllPackages);
router.patch('/packages/:id/approve', approvePackage);
router.patch('/packages/:id/reject', rejectPackage);
router.get('/users', getUsers);

module.exports = router;
