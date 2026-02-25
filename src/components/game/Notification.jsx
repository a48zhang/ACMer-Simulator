import { useEffect, useState } from 'react';

function Notification({ message, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${isExiting ? 'exit' : ''}`}>
      {message}
    </div>
  );
}

export default Notification;
