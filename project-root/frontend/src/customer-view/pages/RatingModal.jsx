import React, { useState } from 'react';
import { API_CONFIG } from '../../config/api';

/**
 * RatingModal
 * ──────────
 * Props:
 *   order       – the delivered order object
 *   token       – auth token string
 *   onClose()   – called when modal should close (no action)
 *   onSubmit()  – called after a successful rating save (triggers parent refresh)
 */
const RatingModal = ({ order, token, onClose, onSubmit }) => {
  const [hoveredStar, setHoveredStar]   = useState(0);
  const [selectedStar, setSelectedStar] = useState(order.rating?.stars || 0);
  const [comment, setComment]           = useState(order.rating?.comment || '');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const API_URL = API_CONFIG.API_URL;

  const starLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

  const handleSubmit = async () => {
    if (selectedStar === 0) { setError('Please select a star rating.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders/${order._id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stars: selectedStar, comment: comment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmit();
      } else {
        setError(data.message || 'Failed to submit rating. Please try again.');
      }
    } catch (err) {
      console.error('Rating submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyRated = !!order.rating?.stars;
  const activeStar   = hoveredStar || selectedStar;

  return (
    <div className="modal-overlay" onClick={() => !submitting && onClose()}>
      <div className="modal rating-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h3>{alreadyRated ? '⭐ Your Rating' : '⭐ Rate Your Order'}</h3>
          <button className="close-btn" onClick={onClose} disabled={submitting}>✕</button>
        </div>

        <div className="modal-body">
          {/* Order summary */}
          <div className="rating-order-summary">
            <span className="rating-order-number">{order.orderNumber}</span>
            <span className="rating-order-items">
              {order.orderItems.slice(0, 2).map(i => i.name).join(', ')}
              {order.orderItems.length > 2 && ` +${order.orderItems.length - 2} more`}
            </span>
          </div>

          {/* Stars */}
          <div className="rating-stars-section">
            <p className="rating-prompt">
              {alreadyRated ? 'You rated this order:' : 'How was your experience?'}
            </p>
            <div
              className="rating-stars"
              onMouseLeave={() => !alreadyRated && setHoveredStar(0)}
            >
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star-btn ${star <= activeStar ? 'filled' : ''}`}
                  onMouseEnter={() => !alreadyRated && setHoveredStar(star)}
                  onClick={() => !alreadyRated && setSelectedStar(star)}
                  disabled={alreadyRated || submitting}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            {activeStar > 0 && (
              <p className="rating-star-label">{starLabels[activeStar]}</p>
            )}
          </div>

          {/* Comment */}
          {!alreadyRated && (
            <div className="rating-comment-section">
              <label htmlFor="rating-comment">Add a comment <span className="optional-label">(optional)</span></label>
              <textarea
                id="rating-comment"
                className="rating-comment-input"
                placeholder="Tell us what you loved or what we can improve..."
                rows="3"
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={submitting}
                maxLength={500}
              />
              <small className="char-count">{comment.length}/500</small>
            </div>
          )}

          {/* Existing comment display (already rated) */}
          {alreadyRated && order.rating?.comment && (
            <div className="rating-existing-comment">
              <p className="existing-comment-label">Your comment:</p>
              <p className="existing-comment-text">"{order.rating.comment}"</p>
            </div>
          )}

          {/* Already rated note */}
          {alreadyRated && (
            <p className="already-rated-note">
              Rated on {new Date(order.rating.ratedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}

          {error && <p className="rating-error">⚠️ {error}</p>}

          {/* Actions */}
          {!alreadyRated && (
            <div className="rating-actions">
              <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                Maybe Later
              </button>
              <button
                className="btn-submit-rating"
                onClick={handleSubmit}
                disabled={submitting || selectedStar === 0}
              >
                {submitting ? '⏳ Submitting...' : '⭐ Submit Rating'}
              </button>
            </div>
          )}

          {alreadyRated && (
            <div className="rating-actions">
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;