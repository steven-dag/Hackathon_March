"""
Google Drive uploader for .birdie digital plans.
Uses OAuth2 "installed" app credentials (google_client_secret.json).

First run: opens browser for one-time authorization → saves token.json
Subsequent runs: uses cached token.json (auto-refreshes when expired)

Setup:
1. google_client_secret.json must be in the backend/ folder (already done)
2. First time: run `python utils/drive_uploader.py` from backend/ → browser opens → authorize
3. token.json gets saved → all future uploads work automatically
"""

import os
import io
import json
import datetime

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ["https://www.googleapis.com/auth/drive.file"]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRET_FILE = os.path.join(BASE_DIR, "..", "google_client_secret.json")
TOKEN_FILE = os.path.join(BASE_DIR, "..", "token.json")


def _get_drive_service():
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0, timeout_seconds=120)

        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    return build("drive", "v3", credentials=creds)


def _get_or_create_folder(service, folder_name: str, parent_id: str | None = None) -> str:
    """Return folder ID — create it if it doesn't exist yet."""
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get("files", [])
    if files:
        return files[0]["id"]

    meta = {"name": folder_name, "mimeType": "application/vnd.google-apps.folder"}
    if parent_id:
        meta["parents"] = [parent_id]
    folder = service.files().create(body=meta, fields="id").execute()
    return folder["id"]


def upload_plan_to_drive(
    pdf_bytes: bytes,
    company_name: str,
    filename: str | None = None,
) -> str:
    """
    Upload a PDF to 'Kunden Gespräche/<company_name>/' in Google Drive.
    Returns the file's web view URL.
    """
    configured_folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

    service = _get_drive_service()

    if configured_folder_id:
        root_folder_id = configured_folder_id
    else:
        root_folder_id = _get_or_create_folder(service, "Kunden Gespräche")

    company_folder_id = _get_or_create_folder(service, company_name, parent_id=root_folder_id)

    if not filename:
        date_str = datetime.date.today().strftime("%Y-%m-%d")
        safe_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in company_name)
        filename = f"Digitalplan_{safe_name}_{date_str}.pdf"

    file_meta = {"name": filename, "parents": [company_folder_id]}
    media = MediaIoBaseUpload(io.BytesIO(pdf_bytes), mimetype="application/pdf", resumable=False)
    uploaded = service.files().create(body=file_meta, media_body=media, fields="id, webViewLink").execute()

    print(f"[drive] Uploaded '{filename}' → {uploaded.get('webViewLink')}")
    return uploaded.get("webViewLink", "")


if __name__ == "__main__":
    # Run this once to authorize: python utils/drive_uploader.py
    print("Authorizing Google Drive access...")
    service = _get_drive_service()
    print("Authorization successful! token.json saved.")
    about = service.about().get(fields="user").execute()
    print(f"Logged in as: {about['user']['emailAddress']}")
