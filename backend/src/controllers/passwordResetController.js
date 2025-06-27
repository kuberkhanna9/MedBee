const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');

// @desc    Request password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'If a user with this email exists, a password reset link will be sent'
      });
    }

    // Generate reset token
    const token = PasswordReset.generateToken();

    // Save reset token
    await PasswordReset.create({
      user: user._id,
      token
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
    });

    res.status(200).json({
      message: 'If a user with this email exists, a password reset link will be sent'
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find valid reset token
    const resetToken = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: Date.now() }
    }).populate('user');

    if (!resetToken) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      });
    }

    // Update user's password
    const user = resetToken.user;
    user.password = password;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    // Send confirmation email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been successfully reset. If you did not perform this action, please contact support immediately.'
    });

    res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    next(error);
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword
}; 