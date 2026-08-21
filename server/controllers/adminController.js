const Package = require('../models/Package');
const User = require('../models/User');

// GET /api/admin/packages/pending — approval queue
exports.getPendingPackages = async (req, res) => {
  try {
    const packages = await Package.find({ status: 'pending' })
      .populate('category', 'name slug')
      .populate('owner', 'name email')
      .sort('createdAt');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/packages/:id/approve — pending -> published
exports.approvePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    if (pkg.status !== 'pending') {
      return res.status(400).json({ message: `Only pending packages can be approved (current status: ${pkg.status}).` });
    }

    pkg.status = 'published';
    pkg.rejectionReason = undefined;
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/packages/:id/reject  { reason }
exports.rejectPackage = async (req, res) => {
  try {
    const { reason } = req.body;
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    if (pkg.status !== 'pending') {
      return res.status(400).json({ message: `Only pending packages can be rejected (current status: ${pkg.status}).` });
    }

    pkg.status = 'rejected';
    pkg.rejectionReason = reason || 'Does not meet listing guidelines.';
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/packages — all packages, any status, for admin oversight
exports.getAllPackages = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const packages = await Package.find(filter)
      .populate('category', 'name slug')
      .populate('owner', 'name email')
      .sort('-createdAt');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
