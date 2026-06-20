"""
Automated Verification Script: test_user_crud.py
Verifies complete User CRUD, input validations, security constraints, and regression of existing API endpoints.
"""

import sys
import urllib.request
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"


def http_request(path: str, method: str = "GET", data: dict = None) -> tuple[int, dict]:
    url = f"{BASE_URL}{path}"
    headers = {}
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(
        url, data=encoded_data, headers=headers, method=method
    )
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
    results = {
        "passed": 0,
        "failed": 0,
        "details": []
    }

    def record_test(name: str, passed: bool, error_msg: str = ""):
        if passed:
            results["passed"] += 1
            results["details"].append(f"PASS: {name}")
            logger.info(f"PASS: {name}")
        else:
            results["failed"] += 1
            results["details"].append(f"FAIL: {name} - {error_msg}")
            logger.error(f"FAIL: {name} - {error_msg}")

    logger.info("=== STARTING BACKEND HEALTH & INTEGRATION AUDIT ===")

    # ----------------------------------------------------
    # PHASE 1 & 6: HEALTH & REGRESSION TESTS
    # ----------------------------------------------------
    
    # 1. GET /health
    try:
        status, body = http_request("/health")
        passed = (status == 200 and body.get("status") == "healthy")
        record_test("GET /health status and tables check", passed, f"Status {status}, Body {body}")
    except Exception as e:
        record_test("GET /health status and tables check", False, str(e))

    # 2. GET /api/v1/health
    try:
        status, body = http_request("/api/v1/health")
        passed = (status == 200 and body.get("status") == "ok")
        record_test("GET /api/v1/health basic check", passed, f"Status {status}, Body {body}")
    except Exception as e:
        record_test("GET /api/v1/health basic check", False, str(e))

    # 3. GET /api/v1/distress/
    try:
        status, body = http_request("/api/v1/distress/")
        passed = (status == 200 and isinstance(body, list))
        record_test("GET /api/v1/distress/ regression", passed, f"Status {status}")
    except Exception as e:
        record_test("GET /api/v1/distress/ regression", False, str(e))

    # 4. GET /api/v1/gis/markers
    try:
        status, body = http_request("/api/v1/gis/markers")
        passed = (status == 200 and isinstance(body, list))
        record_test("GET /api/v1/gis/markers regression", passed, f"Status {status}")
    except Exception as e:
        record_test("GET /api/v1/gis/markers regression", False, str(e))

    # 5. GET /api/v1/reports/generate (restored placeholder)
    try:
        status, body = http_request("/api/v1/reports/generate")
        passed = (status == 200 and body.get("message") == "Generate report stub")
        record_test("GET /api/v1/reports/generate static route fix check", passed, f"Status {status}, Body {body}")
    except Exception as e:
        record_test("GET /api/v1/reports/generate static route fix check", False, str(e))

    # 6. POST /api/v1/upload/video
    try:
        status, body = http_request("/api/v1/upload/video", method="POST", data={"file_name": "qa_surveillance.mp4"})
        passed = (status == 201 and body.get("file_name") == "qa_surveillance.mp4")
        record_test("POST /api/v1/upload/video regression", passed, f"Status {status}")
    except Exception as e:
        record_test("POST /api/v1/upload/video regression", False, str(e))

    # 7. POST /api/v1/auth/login
    try:
        login_payload = {
            "email": "admin@roaddistress.org",
            "password": "AdminSecurePassword123!"
        }
        status, body = http_request("/api/v1/auth/login", method="POST", data=login_payload)
        passed = (status == 200 and body.get("email") == "admin@roaddistress.org")
        record_test("POST /api/v1/auth/login credentials validation", passed, f"Status {status}, Body {body}")
    except Exception as e:
        record_test("POST /api/v1/auth/login credentials validation", False, str(e))

    # ----------------------------------------------------
    # PHASE 2 & 4 & 5: USER CRUD, VALIDATION & SECURITY
    # ----------------------------------------------------
    
    test_email = "qa_inspector_007@roaddistress.org"
    test_pwd = "InspectorPass123!"
    user_id = None

    # 8. Create User: Valid payload
    try:
        payload = {
            "email": test_email,
            "full_name": "QA Inspector User",
            "password": test_pwd,
            "role": "inspector"
        }
        status, body = http_request("/api/v1/users/", method="POST", data=payload)
        passed = (status == 201 and body.get("email") == test_email)
        user_id = body.get("id")
        # Security validation: Verify hashed_password and password are not returned
        security_ok = "password" not in body and "hashed_password" not in body
        record_test("POST /api/v1/users/ (valid creation & password hide check)", passed and security_ok, f"Status {status}, Security OK: {security_ok}")
    except Exception as e:
        record_test("POST /api/v1/users/ (valid creation)", False, str(e))

    # 9. Create User: Missing required password field
    try:
        payload = {
            "email": "missing_pwd@roaddistress.org",
            "full_name": "Missing Pwd Inspector",
            "role": "inspector"
        }
        status, body = http_request("/api/v1/users/", method="POST", data=payload)
        # Missing fields should return 422 Unprocessable Entity
        passed = (status == 422)
        record_test("POST /api/v1/users/ (missing fields check)", passed, f"Status {status}")
    except Exception as e:
        record_test("POST /api/v1/users/ (missing fields check)", False, str(e))

    # 10. Create User: Invalid email format check
    try:
        payload = {
            "email": "invalid-email-format",
            "full_name": "Invalid Email Inspector",
            "password": test_pwd,
            "role": "inspector"
        }
        status, body = http_request("/api/v1/users/", method="POST", data=payload)
        # Should return 422 Unprocessable Entity for invalid regex pattern email
        passed = (status == 422)
        record_test("POST /api/v1/users/ (invalid email pattern check)", passed, f"Status {status}, Body {body}")
    except Exception as e:
        record_test("POST /api/v1/users/ (invalid email pattern check)", False, str(e))

    # 11. Create User: Duplicate Email check
    try:
        payload = {
            "email": test_email,
            "full_name": "Duplicate Inspector",
            "password": test_pwd,
            "role": "inspector"
        }
        status, body = http_request("/api/v1/users/", method="POST", data=payload)
        # Duplicate should return 400 Bad Request
        passed = (status == 400 and "already exists" in body.get("detail", "").lower())
        record_test("POST /api/v1/users/ (duplicate email check)", passed, f"Status {status}, Detail: {body}")
    except Exception as e:
        record_test("POST /api/v1/users/ (duplicate email check)", False, str(e))

    # 12. Get User: Valid ID
    if user_id:
        try:
            status, body = http_request(f"/api/v1/users/{user_id}")
            passed = (status == 200 and body.get("email") == test_email)
            # Security verification
            security_ok = "password" not in body and "hashed_password" not in body
            record_test("GET /api/v1/users/{id} (valid ID & security check)", passed and security_ok, f"Status {status}")
        except Exception as e:
            record_test("GET /api/v1/users/{id} (valid ID)", False, str(e))
    else:
        record_test("GET /api/v1/users/{id} (valid ID)", False, "Skipped: user_id is None")

    # 13. Get User: Invalid ID format (non-integer)
    try:
        status, body = http_request("/api/v1/users/not-an-int")
        # Path parameter int check validation error should be 422
        passed = (status == 422)
        record_test("GET /api/v1/users/{id} (invalid ID format)", passed, f"Status {status}")
    except Exception as e:
        record_test("GET /api/v1/users/{id} (invalid ID format)", False, str(e))

    # 14. Get User: Non-existing ID
    try:
        status, body = http_request("/api/v1/users/999999")
        passed = (status == 404)
        record_test("GET /api/v1/users/{id} (non-existing ID)", passed, f"Status {status}")
    except Exception as e:
        record_test("GET /api/v1/users/{id} (non-existing ID)", False, str(e))

    # 15. Get All Users (populated database listing)
    try:
        status, body = http_request("/api/v1/users/")
        passed = (status == 200 and isinstance(body, list) and len(body) >= 2)
        record_test("GET /api/v1/users/ (listing users)", passed, f"Status {status}, Length {len(body) if isinstance(body, list) else 0}")
    except Exception as e:
        record_test("GET /api/v1/users/ (listing users)", False, str(e))

    # 16. Update User: Valid update
    if user_id:
        try:
            update_data = {
                "full_name": "QA Inspector Updated",
                "role": "admin"
            }
            status, body = http_request(f"/api/v1/users/{user_id}", method="PUT", data=update_data)
            passed = (status == 200 and body.get("full_name") == "QA Inspector Updated" and body.get("role") == "admin")
            record_test("PUT /api/v1/users/{id} (valid update)", passed, f"Status {status}, Body {body}")
        except Exception as e:
            record_test("PUT /api/v1/users/{id} (valid update)", False, str(e))
    else:
        record_test("PUT /api/v1/users/{id} (valid update)", False, "Skipped: user_id is None")

    # 17. Update User: Invalid email format in update
    if user_id:
        try:
            update_data = {
                "email": "invalid-email-regex"
            }
            status, body = http_request(f"/api/v1/users/{user_id}", method="PUT", data=update_data)
            # Should fail validation on pattern check (422)
            passed = (status == 422)
            record_test("PUT /api/v1/users/{id} (invalid email format update)", passed, f"Status {status}")
        except Exception as e:
            record_test("PUT /api/v1/users/{id} (invalid email format update)", False, str(e))
    else:
        record_test("PUT /api/v1/users/{id} (invalid email format update)", False, "Skipped: user_id is None")

    # 18. Update User: Non-existing user
    try:
        update_data = {"full_name": "No User"}
        status, body = http_request("/api/v1/users/999999", method="PUT", data=update_data)
        passed = (status == 404)
        record_test("PUT /api/v1/users/{id} (non-existing user update)", passed, f"Status {status}")
    except Exception as e:
        record_test("PUT /api/v1/users/{id} (non-existing user update)", False, str(e))

    # 19. Delete User: Existing user
    if user_id:
        try:
            status, body = http_request(f"/api/v1/users/{user_id}", method="DELETE")
            passed = (status == 200)
            record_test("DELETE /api/v1/users/{id} (delete user check)", passed, f"Status {status}")
        except Exception as e:
            record_test("DELETE /api/v1/users/{id} (delete user check)", False, str(e))
    else:
        record_test("DELETE /api/v1/users/{id} (delete user check)", False, "Skipped: user_id is None")

    # 20. Delete User: Already deleted user
    if user_id:
        try:
            status, body = http_request(f"/api/v1/users/{user_id}", method="DELETE")
            # Deleting again should return 404
            passed = (status == 404)
            record_test("DELETE /api/v1/users/{id} (already deleted check)", passed, f"Status {status}")
        except Exception as e:
            record_test("DELETE /api/v1/users/{id} (already deleted check)", False, str(e))
    else:
        record_test("DELETE /api/v1/users/{id} (already deleted check)", False, "Skipped: user_id is None")

    logger.info("=== AUDIT AND VERIFICATION SCENARIOS COMPLETED ===")
    return results


if __name__ == "__main__":
    res = run_tests()
    total = res["passed"] + res["failed"]
    score = int((res["passed"] / total) * 100) if total > 0 else 0
    print(f"\nFinal Audit Score: {score}/100")
    print(f"Total Tests Executed: {total}")
    print(f"Passed: {res['passed']}")
    print(f"Failed: {res['failed']}")
    
    if res["failed"] > 0:
        sys.exit(1)
    sys.exit(0)
