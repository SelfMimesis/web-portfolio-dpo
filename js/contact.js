export function initContact() {
  const button = document.querySelector('.contact-copy');
  const feedback = document.querySelector('.contact-feedback');
  if (!button || !navigator.clipboard?.writeText) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('diegoperezobrero@gmail.com');
      feedback.textContent = 'Email copied.';
    } catch {
      feedback.textContent = 'Select the email address above to copy it, or open it to send a message.';
    }
  });
}
