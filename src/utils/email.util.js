import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export const sendLimitExceededEmail = async(recipientEmail, name, dailyLimit, todayTotalSpent) => {
    const mailOptions = {
        from: `Money Tracker Alert <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: '[ALERT] Daily Spending Limit Exceeded!',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #d9534f;">Daily Spending Limit Alert</h2>
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>Your Money Tracker system has detected that your spending has exceeded the daily limit you set.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Daily Limit:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; color: #337ab7;">${dailyLimit.toLocaleString('en-US')} VNĐ</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Today's Total Spent:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; color: #d9534f; font-weight: bold;">${todayTotalSpent.toLocaleString('en-US')} VNĐ</td>
                    </tr>
                </table>

                <p style="margin-top: 20px;">Please reconsider your expenses to manage your finances more effectively!</p>
                
                <p>Sincerely,<br>Money Tracker System.</p>
            </div>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Utility] Alert email sent successfully to: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error("[Email Utility] Error sending alert email:", error);
        return { success: false, error: error.message }; 
    }
};