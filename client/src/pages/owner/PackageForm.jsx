import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../services/api';
import './OwnerPages.css';

const emptyForm = {
  title: '',
  shortDescription: '',
  description: '',
  images: '',
  price: '',
  discountPrice: '',
  duration: '',
  location: '',
  category: '',
  inclusions: '',
  exclusions: '',
  availableSeats: 20,
};

export default function PackageForm() {
  const { id } = useParams(); // present when editing
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [itinerary, setItinerary] = useState([{ day: 1, title: '', description: '' }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    api.getPackageById(id).then((pkg) => {
      setForm({
        title: pkg.title || '',
        shortDescription: pkg.shortDescription || '',
        description: pkg.description || '',
        images: (pkg.images || []).join(', '),
        price: pkg.price ?? '',
        discountPrice: pkg.discountPrice ?? '',
        duration: pkg.duration || '',
        location: pkg.location || '',
        category: pkg.category?._id || '',
        inclusions: (pkg.inclusions || []).join(', '),
        exclusions: (pkg.exclusions || []).join(', '),
        availableSeats: pkg.availableSeats ?? 20,
      });
      setItinerary(pkg.itinerary?.length ? pkg.itinerary : [{ day: 1, title: '', description: '' }]);
      setLoading(false);
    });
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const updateItineraryDay = (index, field, value) => {
    const next = [...itinerary];
    next[index] = { ...next[index], [field]: value };
    setItinerary(next);
  };

  const addItineraryDay = () => {
    setItinerary([...itinerary, { day: itinerary.length + 1, title: '', description: '' }]);
  };

  const removeItineraryDay = (index) => {
    setItinerary(itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      duration: form.duration,
      location: form.location,
      category: form.category,
      inclusions: form.inclusions.split(',').map((s) => s.trim()).filter(Boolean),
      exclusions: form.exclusions.split(',').map((s) => s.trim()).filter(Boolean),
      availableSeats: Number(form.availableSeats),
      itinerary: itinerary.filter((d) => d.title.trim()),
    };

    try {
      if (isEditing) {
        await api.updatePackage(id, payload);
      } else {
        await api.createPackage(payload);
      }
      navigate('/owner/packages');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save package.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section__title" style={{ marginBottom: 24 }}>
        {isEditing ? 'Edit Package' : 'Add New Package'}
      </h1>

      {error && <p className="owner-error">{error}</p>}
      {isEditing && (
        <p className="eyebrow" style={{ marginBottom: 16 }}>
          Saving changes to a published or rejected package will move it back to Draft for re-review.
        </p>
      )}

      <form onSubmit={handleSubmit} className="package-form">
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Short Description
          <input name="shortDescription" value={form.shortDescription} onChange={handleChange} maxLength={140} />
        </label>

        <label>
          Full Description
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>

        <label>
          Image URLs (comma-separated)
          <input name="images" value={form.images} onChange={handleChange} placeholder="https://..., https://..." />
        </label>

        <div className="package-form-row">
          <label>
            Price (₹)
            <input type="number" name="price" value={form.price} onChange={handleChange} required min={0} />
          </label>
          <label>
            Discount Price (₹, optional)
            <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} min={0} />
          </label>
        </div>

        <div className="package-form-row">
          <label>
            Duration
            <input name="duration" value={form.duration} onChange={handleChange} placeholder="4 Days / 3 Nights" required />
          </label>
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} required />
          </label>
        </div>

        <div className="package-form-row">
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label>
            Available Seats
            <input type="number" name="availableSeats" value={form.availableSeats} onChange={handleChange} min={1} />
          </label>
        </div>

        <label>
          Inclusions (comma-separated)
          <input name="inclusions" value={form.inclusions} onChange={handleChange} placeholder="Hotel stay, Breakfast, Airport transfers" />
        </label>

        <label>
          Exclusions (comma-separated)
          <input name="exclusions" value={form.exclusions} onChange={handleChange} placeholder="Flights, Personal expenses" />
        </label>

        <div>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Itinerary</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {itinerary.map((day, i) => (
              <div className="package-form-itinerary-day" key={i}>
                <input value={`Day ${day.day}`} disabled />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    placeholder="Day title"
                    value={day.title}
                    onChange={(e) => updateItineraryDay(i, 'title', e.target.value)}
                  />
                  <textarea
                    placeholder="Day description"
                    value={day.description}
                    onChange={(e) => updateItineraryDay(i, 'description', e.target.value)}
                    style={{ minHeight: 50 }}
                  />
                </div>
                {itinerary.length > 1 && (
                  <button type="button" className="package-form-remove" onClick={() => removeItineraryDay(i)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="package-form-add" onClick={addItineraryDay} style={{ marginTop: 12 }}>
            + Add Day
          </button>
        </div>

        <button type="submit" className="package-form-submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Package (Draft)'}
        </button>
      </form>
    </div>
  );
}
