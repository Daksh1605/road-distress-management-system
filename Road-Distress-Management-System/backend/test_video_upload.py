"""
Automated Verification Script: test_video_upload.py
Verifies Video Upload Module endpoints: POST /upload, GET /, GET /{id}, DELETE /{id}.
"""

import sys
import os
import urllib.request
import json
import logging
import uuid

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000/api/v1/videos"


def encode_multipart_formdata(fields: dict, files: list) -> tuple[dict, bytes]:
    """
    Encodes fields and files into multipart/form-data byte string for urllib upload.
    """
    boundary = b"----MultipartFormBoundaryUrllibClient"
    lines = []
    
    # Add form fields
    for key, val in fields.items():
        if val is not None:
            lines.append(b"--" + boundary)
            lines.append(f'Content-Disposition: form-data; name="{key}"'.encode("utf-8"))
            lines.append(b"")
            lines.append(str(val).encode("utf-8"))
            
    # Add files
    for key, filename, file_data, content_type in files:
        lines.append(b"--" + boundary)
        lines.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"'.encode("utf-8"))
        lines.append(f"Content-Type: {content_type}".encode("utf-8"))
        lines.append(b"")
        lines.append(file_data)
        
    lines.append(b"--" + boundary + b"--")
    lines.append(b"")
    body = b"\r\n".join(lines)
    
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary.decode('utf-8')}",
        "Content-Length": str(len(body))
    }
    return headers, body


def http_request(path: str, method: str = "GET", data: bytes = None, headers: dict = None) -> tuple[int, dict]:
    """
    Executes raw HTTP request with response handling.
    """
    url = f"{BASE_URL}{path}"
    if headers is None:
        headers = {}
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body_bytes = resp.read()
            body_str = body_bytes.decode("utf-8")
            return resp.status, json.loads(body_str) if body_str else {}
    except urllib.error.HTTPError as e:
        body_bytes = e.read()
        body_str = body_bytes.decode("utf-8")
        try:
            res_body = json.loads(body_str)
        except Exception:
            res_body = {"detail": body_str}
        return e.code, res_body
    except Exception as e:
        return 500, {"detail": str(e)}


def run_tests() -> dict:
    results = {"passed": 0, "failed": 0, "details": []}

    def record_test(name: str, passed: bool, error_msg: str = ""):
        if passed:
            results["passed"] += 1
            results["details"].append(f"PASS: {name}")
            logger.info(f"PASS: {name}")
        else:
            results["failed"] += 1
            results["details"].append(f"FAIL: {name} - {error_msg}")
            logger.error(f"FAIL: {name} - {error_msg}")

    logger.info("=== STARTING VIDEO UPLOAD MODULE END-TO-END AUDIT ===")

    # Fetch active user IDs to prevent ForeignKeyViolation errors
    uploader_id_1 = None
    uploader_id_2 = None
    try:
        users_req = urllib.request.Request("http://localhost:8000/api/v1/users/", method="GET")
        with urllib.request.urlopen(users_req) as u_resp:
            users_list = json.loads(u_resp.read().decode("utf-8"))
            if len(users_list) >= 2:
                uploader_id_1 = users_list[0].get("id")
                uploader_id_2 = users_list[1].get("id")
                logger.info(f"Found active users for testing: ID {uploader_id_1}, ID {uploader_id_2}")
            elif len(users_list) >= 1:
                uploader_id_1 = users_list[0].get("id")
                uploader_id_2 = uploader_id_1
                logger.info(f"Found single active user for testing: ID {uploader_id_1}")
    except Exception as e:
        logger.error(f"Failed to fetch active users: {e}")

    # 1. Test supported formats uploads (MP4, AVI, MOV)
    video_id = None
    saved_filepath = None
    try:
        # Upload valid MP4 video
        mp4_content = b"FakeMP4Header_AndData_RepresentativeOfVideo_010101"
        headers, body = encode_multipart_formdata(
            fields={"uploader_id": uploader_id_1} if uploader_id_1 else {},
            files=[("file", "test_surveillance_corridor.mp4", mp4_content, "video/mp4")]
        )
        
        status, resp = http_request("/upload", method="POST", data=body, headers=headers)
        passed = (
            status == 201 and 
            resp.get("filename") == "test_surveillance_corridor.mp4" and 
            resp.get("processing_status") == "pending" and
            resp.get("filepath") is not None
        )
        video_id = resp.get("id")
        saved_filepath = resp.get("filepath")
        
        record_test("POST /upload - Valid MP4 File Upload", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("POST /upload - Valid MP4 File Upload", False, str(e))

    try:
        # Upload valid AVI video
        avi_content = b"RIFF_AVI_Header_RepresentativeOfVideo_020202"
        headers, body = encode_multipart_formdata(
            fields={"uploader_id": uploader_id_2} if uploader_id_2 else {},
            files=[("file", "ghats_highway_scan.AVI", avi_content, "video/x-msvideo")]
        )
        
        status, resp = http_request("/upload", method="POST", data=body, headers=headers)
        passed = (status == 201 and resp.get("filename") == "ghats_highway_scan.AVI")
        record_test("POST /upload - Valid AVI File Upload (Case-Insensitive Ext)", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("POST /upload - Valid AVI File Upload", False, str(e))

    try:
        # Upload valid MOV video
        mov_content = b"QT_MOV_Header_RepresentativeOfVideo_030303"
        headers, body = encode_multipart_formdata(
            fields={},
            files=[("file", "urban_junction_loop.mov", mov_content, "video/quicktime")]
        )
        
        status, resp = http_request("/upload", method="POST", data=body, headers=headers)
        # Check uploader_id is None since it was omitted
        passed = (status == 201 and resp.get("filename") == "urban_junction_loop.mov" and resp.get("uploader_id") is None)
        record_test("POST /upload - Valid MOV File Upload (Omitted Uploader)", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("POST /upload - Valid MOV File Upload", False, str(e))

    # 2. Test format validation failure (e.g. TEXT file)
    try:
        txt_content = b"This is a text file content and should be rejected."
        headers, body = encode_multipart_formdata(
            fields={},
            files=[("file", "malicious_script.txt", txt_content, "text/plain")]
        )
        
        status, resp = http_request("/upload", method="POST", data=body, headers=headers)
        passed = (status == 400 and "invalid video format" in resp.get("detail", "").lower())
        record_test("POST /upload - Invalid Extension Format Rejection (.txt)", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("POST /upload - Invalid Extension Format Rejection (.txt)", False, str(e))

    # 3. Test file size limit validation (file > 100MB)
    try:
        # Create a file of 100.1MB (101 * 1024 * 1024 bytes) of zeros to trigger size limit
        logger.info("Generating a 101MB dummy payload for size check (takes a moment)...")
        oversized_content = b"\x00" * (101 * 1024 * 1024)
        
        headers, body = encode_multipart_formdata(
            fields={},
            files=[("file", "huge_highway_feed.mp4", oversized_content, "video/mp4")]
        )
        
        logger.info("Uploading 101MB dummy payload (verifying 413 error)...")
        status, resp = http_request("/upload", method="POST", data=body, headers=headers)
        passed = (status == 413 and "exceeds maximum size limit" in resp.get("detail", "").lower())
        record_test("POST /upload - Size Limit Validation (Reject > 100MB File)", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("POST /upload - Size Limit Validation", False, str(e))

    # 4. Test GET / (list video logs metadata)
    try:
        status, resp = http_request("/")
        passed = (status == 200 and isinstance(resp, list) and len(resp) >= 3)
        record_test("GET / - List Uploaded Videos Metadata Logs", passed, f"Status {status}, Count: {len(resp) if isinstance(resp, list) else 0}")
    except Exception as e:
        record_test("GET / - List Uploaded Videos Metadata Logs", False, str(e))

    # 5. Test GET /{id} (fetch metadata details)
    if video_id:
        try:
            status, resp = http_request(f"/{video_id}")
            passed = (
                status == 200 and 
                resp.get("id") == video_id and 
                resp.get("filename") == "test_surveillance_corridor.mp4"
            )
            record_test("GET /{id} - Fetch Specific Video Metadata Details", passed, f"Status {status}, Response {resp}")
        except Exception as e:
            record_test("GET /{id} - Fetch Specific Video Metadata Details", False, str(e))
    else:
        record_test("GET /{id} - Fetch Specific Video Metadata Details", False, "Skipped: no uploaded video_id available")

    # 6. Test GET /{id} non-existent
    try:
        status, resp = http_request("/999999")
        passed = (status == 404 and "not found" in resp.get("detail", "").lower())
        record_test("GET /{id} - Fetch Non-existent ID Returns 404", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("GET /{id} - Fetch Non-existent ID", False, str(e))

    # 7. Test physical file presence on disk
    if saved_filepath:
        try:
            # Check physical file relative path
            # Resolve relative path using backend folder prefix
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            full_physical_path = os.path.join(backend_dir, saved_filepath)
            
            passed = os.path.exists(full_physical_path) and os.path.isfile(full_physical_path)
            record_test("Storage - Check Physical File Saved in uploads/videos/", passed, f"File path: {full_physical_path}")
        except Exception as e:
            record_test("Storage - Check Physical File Saved", False, str(e))
    else:
        record_test("Storage - Check Physical File Saved", False, "Skipped: no saved_filepath available")

    # 8. Test DELETE /{id} (cleans up DB log and removes physical file from disk)
    if video_id and saved_filepath:
        try:
            # Delete video metadata
            status, resp = http_request(f"/{video_id}", method="DELETE")
            passed_db = (status == 200 and resp.get("id") == video_id)
            
            # Confirm physical file is deleted
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            full_physical_path = os.path.join(backend_dir, saved_filepath)
            passed_file = not os.path.exists(full_physical_path)
            
            record_test("DELETE /{id} - Clean Deletion of Metadata & Disk File", passed_db and passed_file, f"DB Status: {passed_db}, Disk File Removed: {passed_file}")
        except Exception as e:
            record_test("DELETE /{id} - Clean Deletion of Metadata & Disk File", False, str(e))
    else:
        record_test("DELETE /{id} - Clean Deletion of Metadata & Disk File", False, "Skipped: video_id or saved_filepath missing")

    # 9. Test DELETE /{id} non-existent
    try:
        status, resp = http_request("/999999", method="DELETE")
        passed = (status == 404 and "not found" in resp.get("detail", "").lower())
        record_test("DELETE /{id} - Delete Non-existent ID Returns 404", passed, f"Status {status}, Response {resp}")
    except Exception as e:
        record_test("DELETE /{id} - Delete Non-existent ID", False, str(e))

    logger.info("=== VIDEO UPLOAD MODULE END-TO-END AUDIT COMPLETED ===")
    return results


if __name__ == "__main__":
    res = run_tests()
    total = res["passed"] + res["failed"]
    score = int((res["passed"] / total) * 100) if total > 0 else 0
    print(f"\nVideo Upload Validation Score: {score}/100")
    print(f"Total Tests Executed: {total}")
    print(f"Passed: {res['passed']}")
    print(f"Failed: {res['failed']}")
    
    if res["failed"] > 0:
        sys.exit(1)
    sys.exit(0)
