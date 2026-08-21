const express = require('express');
const router = express.Router();
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');
const {
  getPackages,
  getFeaturedPackages,
  getPackageById,
  getMyPackages,
  createPackage,
  updatePackage,
  deletePackage,
  submitForReview,
} = require('../controllers/packageController');

// Public routes (optionalAuth so an owner/admin viewing their own draft via PDP still works)
router.get('/featured', getFeaturedPackages);
router.get('/mine', protect, restrictTo('owner'), getMyPackages); // must come before /:id
router.get('/', getPackages);
router.get('/:id', optionalAuth, getPackageById);

// Owner-only routes
router.post('/', protect, restrictTo('owner'), createPackage);
router.patch('/:id', protect, restrictTo('owner'), updatePackage);
router.delete('/:id', protect, restrictTo('owner'), deletePackage);
router.patch('/:id/submit', protect, restrictTo('owner'), submitForReview);

module.exports = router;
