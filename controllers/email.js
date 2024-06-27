const nodemailer = require("nodemailer");
const User = require("../models/user");
const SupportTicket = require("../models/supportTicket");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: "jamie.botsford64@ethereal.email",
    pass: "dEVUmZJt6zPjH5z7Hh",
  },
});

exports.createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const ticketId = generateTicketId();

    const supportTicket = await SupportTicket.create({
      user: userId,
      subject,
      description,
      ticketId,
    });

    const ticketDetails = `
            Ticket ID: ${supportTicket.ticketId},
            Subject: ${supportTicket.subject},
            Description: ${supportTicket.description}`;

    transporter.sendMail({
      from: process.env.NOREPLY_EMAIL,
      to: user.email,
      subject: "Support Ticket Created",
      text: `
                Dear ${user.name},
                Your support ticket has been created successfully.
                
                ${ticketDetails}
                
                We will work on resolving your issue as soon as possible.
                
                Best regards,
                Support Team`,
    });

    transporter.sendMail({
      from: process.env.NOREPLY_EMAIL,
      to: process.env.SUPPORT_EMAIL,
      subject: "New Support Ticker",
      text: `
        A new support ticket has been created.
        
        User: ${user.name}, (${user.email}),

        ${ticketDetails}...
        
        Please take necessary actions.`,
    });

    return res.status(200).json({
      statuscode: 200,
      message: "Support Ticket created successfully",
      ticketId: supportTicket.ticketId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
};
function generateTicketId() {
  return `TICKET-${Date.now()}`;
}
