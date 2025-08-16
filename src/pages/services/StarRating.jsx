import { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, interactive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={`star ${value <= displayRating ? 'filled' : 'empty'}`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
        >
          {value <= displayRating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;