import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_email_otp(
    recipient_email: str,
    otp: str,
) -> None:
    """Send an email verification OTP using Gmail SMTP."""

    message = EmailMessage()

    message["Subject"] = "AgriNerve Email Verification OTP"
    message["From"] = settings.smtp_from
    message["To"] = recipient_email

    message.set_content(
        f"""Hello,

Your AgriNerve email verification OTP is:

{otp}

This OTP is valid for 10 minutes.

Do not share this OTP with anyone.

If you did not request this OTP, you can safely ignore this email.

Regards,
AgriNerve Team
"""
    )

    with smtplib.SMTP(
        settings.smtp_host,
        settings.smtp_port,
    ) as server:
        server.starttls()

        server.login(
            settings.smtp_username,
            settings.smtp_password,
        )

        server.send_message(message)
