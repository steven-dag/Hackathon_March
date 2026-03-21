"""
Email sender for .birdie – sends plan PDF to advisor (Sarah) via Gmail SMTP.
Configure GMAIL_USER and GMAIL_APP_PASSWORD in .env
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime


def send_plan_email(
    company_name: str,
    company_branche: str,
    recipient_email: str,
    pdf_bytes: bytes,
    drive_url: str = "",
) -> bool:
    """
    Send plan PDF to the advisor email.
    Returns True on success, False on failure (so the API doesn't crash if email fails).
    """
    gmail_user = os.getenv("GMAIL_USER")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_password:
        print("[email] GMAIL_USER / GMAIL_APP_PASSWORD not set – skipping email.")
        return False

    now = datetime.now().strftime("%d.%m.%Y")
    subject = f".birdie | Neuer Digitalplan: {company_name} ({now})"

    drive_link_html = (
        f'<p><a href="{drive_url}" style="display:inline-block;background:#0a0a0a;color:#4ADE80;'
        f'padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">'
        f"In Google Drive öffnen</a></p>"
    ) if drive_url else ""

    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #111;">
      <div style="background:#0a0a0a; padding:20px 24px; border-radius:8px 8px 0 0;">
        <span style="color:#4ADE80; font-size:22px; font-weight:800;">.birdie</span>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
        <h2 style="margin-top:0;">Neuer Digitalplan eingegangen</h2>
        <p>Ein Interessent hat den .birdie-Flow abgeschlossen und einen Digitalplan generiert.</p>
        <table style="border-collapse:collapse; width:100%; font-size:14px;">
          <tr>
            <td style="padding:8px 12px; font-weight:600; background:#f9fafb; border:1px solid #e5e7eb;">Unternehmen</td>
            <td style="padding:8px 12px; border:1px solid #e5e7eb;">{company_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; font-weight:600; background:#f9fafb; border:1px solid #e5e7eb;">Branche</td>
            <td style="padding:8px 12px; border:1px solid #e5e7eb;">{company_branche}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; font-weight:600; background:#f9fafb; border:1px solid #e5e7eb;">Erstellt am</td>
            <td style="padding:8px 12px; border:1px solid #e5e7eb;">{now}</td>
          </tr>
        </table>
        <p style="margin-top:20px; color:#6b7280; font-size:13px;">
          Der vollständige Digitalplan inkl. Firmendaten, Monatsplanung und Kostenaufstellung
          ist als PDF angehängt.
        </p>
        {drive_link_html}
        <p style="color:#6b7280; font-size:13px;">— .birdie</p>
      </div>
    </div>
    """

    try:
        msg = MIMEMultipart("mixed")
        msg["From"]    = gmail_user
        msg["To"]      = recipient_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body_html, "html"))

        # Attach PDF
        pdf_part = MIMEBase("application", "octet-stream")
        pdf_part.set_payload(pdf_bytes)
        encoders.encode_base64(pdf_part)
        filename = f"birdie_digitalplan_{company_name.lower().replace(' ', '_')}.pdf"
        pdf_part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
        msg.attach(pdf_part)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, recipient_email, msg.as_string())

        print(f"[email] Plan sent to {recipient_email} for {company_name}")
        return True

    except Exception as e:
        print(f"[email] Failed to send email: {e}")
        return False
