export const sendEmail = ({
  email,
  message = '',
}: {
  email: string;
  message?: string;
}) => {
  const emailUrl = `mailto:${email}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
  window.open(emailUrl, '_blank');
  return true;
};
