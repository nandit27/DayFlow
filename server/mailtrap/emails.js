import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import logger from "../utils/logger.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Email Verification OTP",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    logger.info("Email sent successfully", response);
  } catch (error) {
    logger.error(`Error sending verification email: ${error.message}`);
  }
};

export const sendResetPasswordEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    logger.info("Password reset email sent successfully", response);
  } catch (error) {
    logger.error(`Error sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Success",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    logger.info("Password reset success email sent successfully", response);
  } catch (error) {
    logger.error(
      `Error sending password reset success email: ${error.message}`
    );
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "fa3bba04-ded6-44ac-8e5f-83f14a4391da",
      template_variables: {
        company_info_name: "Spreezy E-Commerce",
        name: name,
      },
    });

    logger.info("Welcome email sent successfully", response);
  } catch (error) {
    logger.error(`Error sending welcome email: ${error.message}`);
  }
};
