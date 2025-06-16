import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <footer style={footerStyle} >
      <p>&copy; {currentYear} <a href="https://nadjib-chacha.vercel.app/" className='text-white'>MED DEV</a>. All rights reserved.</p>
    </footer>
  );
};

// Inline styles for basic footer styling
const footerStyle = {
  textAlign: 'center',
  padding: '1rem',
  color: '#ccc',
  width: '100%',
};

export default Footer