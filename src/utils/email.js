import emailjs from '@emailjs/browser';

// To use real emails, the user needs to provide these from their EmailJS account:
// Service ID, Template ID, and Public Key
const SERVICE_ID = "YOUR_SERVICE_ID"; 
const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

export const sendBookingEmail = async (user, booking) => {
  console.log(`[Email Simulator] Attempting to send confirmation to ${user.email}...`);
  
  const templateParams = {
    to_name: user.name,
    to_email: user.email,
    event_name: booking.eventName,
    bill_id: booking.billId,
    amount: booking.totalAmount,
    seats: booking.selectedSeats ? booking.selectedSeats.join(', ') : 'N/A'
  };

  if (SERVICE_ID === "YOUR_SERVICE_ID") {
    console.warn("EmailJS keys not configured. Email simulated in console.");
    return Promise.resolve({ status: 'simulated' });
  }

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Email sent successfully!', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const sendCancellationEmail = async (email, name, eventName, reason = "Unspecified technical issues") => {
    console.log(`[Email Simulator] Sending cancellation alert to ${email}... Reason: ${reason}`);
    
    if (SERVICE_ID === "YOUR_SERVICE_ID") {
        return Promise.resolve({ status: 'simulated' });
    }

    try {
        const response = await emailjs.send(SERVICE_ID, "CANCEL_TEMPLATE_ID", {
            to_name: name,
            to_email: email,
            event_name: eventName,
            cancellation_reason: reason
        }, PUBLIC_KEY);
        return response;
    } catch (e) {
        console.error(e);
    }
}

export const sendRefundEmail = async (email, name, amount, billId) => {
    console.log(`[Email Simulator] Sending refund notification of INR ${amount} for Bill ID ${billId} to ${email}...`);
    
    if (SERVICE_ID === "YOUR_SERVICE_ID") {
        return Promise.resolve({ status: 'simulated' });
    }

    try {
        const response = await emailjs.send(SERVICE_ID, "REFUND_TEMPLATE_ID", {
            to_name: name,
            to_email: email,
            amount: amount,
            bill_id: billId
        }, PUBLIC_KEY);
        return response;
    } catch (e) {
        console.error(e);
    }
}
