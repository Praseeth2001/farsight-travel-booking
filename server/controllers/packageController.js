const Package = require('../models/Package');
const Category = require('../models/Category');

// ---------- PUBLIC ----------

// GET /api/packages?category=slug&page=1&limit=12&sort=price&search=goa
// Public listing only ever shows published packages, regardless of any status query param sent.
exports.getPackages = async (req, res) => {
  try {
    const { category, page = 1, limit = 12, sort = '-createdAt', search } = req.query;

    const filter = { status: 'published' };
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .populate('category', 'name slug')
        .populate('owner', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Package.countDocuments(filter),
    ]);

    res.json({
      data: packages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/packages/featured — published + featured only
exports.getFeaturedPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isFeatured: true, status: 'published' })
      .populate('category', 'name slug')
      .limit(10);
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/packages/:id
// Published packages are visible to everyone. Non-published packages are only
// visible to the owner who created them or an admin (uses optionalAuth upstream).
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('owner', 'name email');
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    const isOwner = req.user && pkg.owner._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (pkg.status !== 'published' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- OWNER ----------

// GET /api/packages/mine — owner's own packages, any status
exports.getMyPackages = async (req, res) => {
  try {
    const packages = await Package.find({ owner: req.user.id })
      .populate('category', 'name slug')
      .sort('-updatedAt');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/packages — creates a package owned by the logged-in owner, starts as draft
exports.createPackage = async (req, res) => {
  try {
    const payload = { ...req.body, owner: req.user.id, status: 'draft' };

    // slug must be unique; derive one from title if not provided
    if (!payload.slug && payload.title) {
      payload.slug = payload.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const pkg = await Package.create(payload);
    res.status(201).json(pkg);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A package with a similar title already exists. Try a different title.' });
    }
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/packages/:id — owner can only edit their own package
// Editing a published or rejected package resets it to draft, since it needs re-review.
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    if (pkg.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own packages.' });
    }

    // Prevent an owner from directly setting status/owner via the request body
    const { status, owner, ...safeUpdates } = req.body;
    Object.assign(pkg, safeUpdates);

    if (['published', 'rejected'].includes(pkg.status)) {
      pkg.status = 'draft';
      pkg.rejectionReason = undefined;
    }

    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/packages/:id — owner can only delete their own package
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    if (pkg.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own packages.' });
    }

    await pkg.deleteOne();
    res.json({ message: 'Package deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/packages/:id/submit — draft -> pending, sends it to the admin approval queue
exports.submitForReview = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    if (pkg.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only submit your own packages.' });
    }
    if (pkg.status !== 'draft') {
      return res.status(400).json({ message: `Only draft packages can be submitted for review (current status: ${pkg.status}).` });
    }

    pkg.status = 'pending';
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
