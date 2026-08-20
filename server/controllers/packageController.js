const Package = require('../models/Package');

// GET /api/packages?category=slug&page=1&limit=12&sort=price
exports.getPackages = async (req, res) => {
  try {
    const { category, page = 1, limit = 12, sort = '-createdAt', search } = req.query;

    const filter = {};
    if (category) {
      const Category = require('../models/Category');
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [packages, total] = await Promise.all([
      Package.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(Number(limit)),
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

// GET /api/packages/featured
exports.getFeaturedPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isFeatured: true }).populate('category', 'name slug').limit(10);
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/packages/:id
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('category', 'name slug');
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
