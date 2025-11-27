// Email notification service
// Currently using console logging - integrate with SendGrid, Resend, or your email provider

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Integrate with email provider (SendGrid, Resend, Brevo, etc.)
    // For now, just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Email] To: ${options.to}`);
      console.log(`[Email] Subject: ${options.subject}`);
      console.log(`[Email] Body:\n${options.html}`);
    }
    
    // In production, you would send via an email provider:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(options);
    
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function sendOrderConfirmation(email: string, orderId: string, totalAmount: string) {
  return sendEmail({
    to: email,
    subject: "Order Confirmation - MTA Shop",
    html: `
      <h2>Order Confirmed!</h2>
      <p>Your order has been received and is being processed.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Total Amount:</strong> $${totalAmount}</p>
      <p>You will receive your items after payment confirmation.</p>
      <p><a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/my-orders` : '#'}">View Your Orders</a></p>
    `,
  });
}

export async function sendPickupReminder(email: string, orderId: string) {
  return sendEmail({
    to: email,
    subject: "Your Order is Ready for Pickup - MTA Shop",
    html: `
      <h2>Order Ready!</h2>
      <p>Your order is now ready for pickup in-game.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p>Visit the MTA server to collect your items!</p>
      <p><a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/my-orders` : '#'}">View Your Orders</a></p>
    `,
  });
}

export async function sendDeliveryNotification(email: string, orderId: string, success: boolean, error?: string) {
  return sendEmail({
    to: email,
    subject: `Order Delivery ${success ? "Successful" : "Failed"} - MTA Shop`,
    html: `
      <h2>Order Delivery ${success ? "Successful!" : "Issue"}</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      ${success 
        ? `<p>Your items have been successfully delivered in-game!</p>` 
        : `<p>There was an issue delivering your order: ${error || "Unknown error"}</p><p>Our team has been notified and will assist you shortly.</p>`
      }
      <p><a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/support` : '#'}">Contact Support</a></p>
    `,
  });
}
