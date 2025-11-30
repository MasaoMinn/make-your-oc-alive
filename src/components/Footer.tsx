import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 py-6" style={{ backgroundColor: '#dccacaff' }}>
      <div className="container mx-auto px-4 text-center pt-10 mt-10" >
        <p style={{ color: 'blue', fontSize: '20px' }}>上传的设定不会被用于其他用途</p>
      </div>
    </footer>
  );
};

export default Footer;