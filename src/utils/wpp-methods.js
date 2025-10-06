export const sendMessage = ({ phone, message = '' }) => {
  try {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}${message ? `&text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error sending message', error);
    return false;
  }
};
