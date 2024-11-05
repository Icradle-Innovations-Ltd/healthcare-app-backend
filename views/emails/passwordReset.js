const crypto = require('crypto');
const { User } = require('../models');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

class PasswordReset {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async createResetToken(email) {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            throw new Error('User not found');
        }

        const resetToken = this.generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour validity

        await user.update({
            resetToken,
            resetTokenExpiry
        });

        return resetToken;
    }

    async sendResetEmail(email, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this reset, please ignore this email.</p>
            `
        };

        await this.transporter.sendMail(mailOptions);
    }

    async verifyResetToken(token) {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        return user;
    }

    async resetPassword(token, newPassword) {
        const user = await this.verifyResetToken(token);
        
        await user.update({
            password: newPassword,
            resetToken: null,
            resetTokenExpiry: null
        });

        // Send confirmation email
        await this.sendPasswordChangeConfirmation(user.email);

        return true;
    }

    async sendPasswordChangeConfirmation(email) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <h2>Password Changed</h2>
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            `
        };

        await this.transporter.sendMail(mailOptions);
    }

    async cleanupExpiredTokens() {
        await User.update(
            {
                resetToken: null,
                resetTokenExpiry: null
            },
            {
                where: {
                    resetTokenExpiry: {
                        [Op.lt]: new Date()
                    }
                }
            }
        );
    }
}

module.exports = new PasswordReset();
