const express = require('express');
const router = express.Router();
const { getPackages, getFeaturedPackages, getPackageById } = require('../controllers/packageController');

router.get('/featured', getFeaturedPackages); // must come before /:id
router.get('/', getPackages);
router.get('/:id', getPackageById);

module.exports = router;
