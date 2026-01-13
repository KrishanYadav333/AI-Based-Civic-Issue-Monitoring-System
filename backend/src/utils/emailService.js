const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    logger.error('Email service connection failed', { error: error.message });
  } else {
    logger.info('Email service is ready');
  }
});

// Email templates
const templates = {
  issueAssigned: (engineer, issue) => ({
    subject: `New Issue Assigned #${issue.id}`,
    html: `
      <h2>New Issue Assigned</h2>
      <p>Hello ${engineer.name},</p>
      <p>A new civic issue has been assigned to you:</p>
      <ul>
        <li><strong>Issue ID:</strong> #${issue.id}</li>
        <li><strong>Type:</strong> ${issue.type.replace('_', ' ')}</li>
        <li><strong>Priority:</strong> ${issue.priority}</li>
        <li><strong>Location:</strong> ${issue.latitude}, ${issue.longitude}</li>
        <li><strong>Ward:</strong> ${issue.ward_name || issue.ward_id}</li>
      </ul>
      <p>Please log in to your dashboard to view details and resolve this issue.</p>
      <p>Best regards,<br>VMC Civic Monitoring System</p>
    `
  }),

  issueResolved: (issue) => ({
    subject: `Issue Resolved #${issue.id}`,
    html: `
      <h2>Issue Resolved</h2>
      <p>The following civic issue has been successfully resolved:</p>
      <ul>
        <li><strong>Issue ID:</strong> #${issue.id}</li>
        <li><strong>Type:</strong> ${issue.type.replace('_', ' ')}</li>
        <li><strong>Resolved By:</strong> ${issue.engineer_name}</li>
        <li><strong>Resolution Time:</strong> ${issue.resolved_at}</li>
      </ul>
      <p>Thank you for your prompt action.</p>
      <p>Best regards,<br>VMC Civic Monitoring System</p>
    `
  }),

  highPriorityAlert: (issue) => ({
    subject: `HIGH PRIORITY: New Civic Issue #${issue.id}`,
    html: `
      <h2 style="color: #ef4444;">High Priority Alert</h2>
      <p>A high-priority civic issue has been reported:</p>
      <ul>
        <li><strong>Issue ID:</strong> #${issue.id}</li>
        <li><strong>Type:</strong> ${issue.type.replace('_', ' ')}</li>
        <li><strong>Location:</strong> ${issue.latitude}, ${issue.longitude}</li>
        <li><strong>Ward:</strong> ${issue.ward_name || issue.ward_id}</li>
        <li><strong>Reported:</strong> ${issue.created_at}</li>
      </ul>
      <p><strong>Immediate attention required.</strong></p>
      <p>Best regards,<br>VMC Civic Monitoring System</p>
    `
  }),

  dailyReport: (stats) => ({
    subject: `Daily Report - ${new Date().toLocaleDateString()}`,
    html: `
      <h2>Daily Civic Issues Report</h2>
      <p>Summary for ${new Date().toLocaleDateString()}:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Metric</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">Count</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">New Issues</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${stats.newIssues}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Resolved Issues</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${stats.resolvedIssues}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Pending Issues</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${stats.pendingIssues}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">High Priority</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${stats.highPriority}</td>
        </tr>
      </table>
      <p>Best regards,<br>VMC Civic Monitoring System</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = templates[template](data);
    
    const info = await transporter.sendMail({
      from: `"VMC Civic Monitor" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });

    logger.info('Email sent successfully', { 
      messageId: info.messageId,
      to,
      template
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending failed', { 
      error: error.message,
      to,
      template
    });
    return { success: false, error: error.message };
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, template, data) => {
  const results = await Promise.allSettled(
    recipients.map(recipient => sendEmail(recipient, template, data))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  logger.info('Bulk email sent', { successful, failed, template });

  return { successful, failed, total: recipients.length };
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  templates
};
