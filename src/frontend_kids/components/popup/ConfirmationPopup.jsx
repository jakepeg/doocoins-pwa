import React from 'react'
import styles from './confirmation_popup.module.css'

const ConfirmationPopup = (props) => {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    //* Add a short delay to allow the component to be mounted before applying the active class
    const timeout = setTimeout(() => {
      setActive(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    //* Close the popup on Escape
    const handleEscapeKeyPress = (event) => {
      if (event.key === 'Escape') {
        props.handleClosePopup()
      }
    };

    document.addEventListener('keydown', handleEscapeKeyPress);

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress);
    };
  }, []);

  return (
    <div className={`${styles.popup_wrapper} ${active ? styles.active : ''}`}>
      <div className={styles.popup}>
        {props.children}
      </div>
    </div>
  );
}

export default ConfirmationPopup