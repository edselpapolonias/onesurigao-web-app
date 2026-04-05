# tests/test_security.py
# Run with: python manage.py test tests.test_security

from django.test import TestCase
from django.contrib.auth.hashers import make_password, check_password, is_password_usable
from rest_framework.test import APIClient


def _admin_headers(admin_id):
    return {"HTTP_X_ROLE": "admin", "HTTP_X_USER_ID": str(admin_id)}


def _superadmin_headers(sa_id):
    return {"HTTP_X_ROLE": "superadmin", "HTTP_X_USER_ID": str(sa_id)}


def _publicuser_headers(user_id):
    return {"HTTP_X_ROLE": "publicuser", "HTTP_X_USER_ID": str(user_id)}


class PasswordHashingTest(TestCase):
    def test_admin_password_is_hashed_on_create(self):
        from adminpanel.models import Admin
        a = Admin.objects.create(
            officeName="Test Office", username="tester", email="t@t.com",
            contactNumber="123"
        )
        a.set_password("plaintext123")
        a.save()
        a.refresh_from_db()
        self.assertTrue(is_password_usable(a.password))
        self.assertNotEqual(a.password, "plaintext123")
        self.assertTrue(a.check_password("plaintext123"))
        self.assertFalse(a.check_password("wrong"))

    def test_superadmin_password_is_hashed(self):
        from superpanel.models import SuperAdmin
        sa = SuperAdmin.objects.create(
            superAdminName="SA", username="sa_test",
            email="sa@t.com", contactNumber="456"
        )
        sa.set_password("secret!")
        sa.save()
        sa.refresh_from_db()
        self.assertTrue(is_password_usable(sa.password))
        self.assertTrue(sa.check_password("secret!"))

    def test_publicuser_password_is_hashed(self):
        from publicpanel.models import PublicUser
        u = PublicUser.objects.create(
            name="Juan", lastName="Cruz", username="juan",
            email="juan@t.com"
        )
        u.set_password("juanpass")
        u.save()
        u.refresh_from_db()
        self.assertTrue(is_password_usable(u.password))
        self.assertTrue(u.check_password("juanpass"))


class AdminLoginTest(TestCase):
    def setUp(self):
        from adminpanel.models import Admin
        self.admin = Admin.objects.create(
            officeName="City Health", username="admin1", email="a@t.com", contactNumber="0"
        )
        self.admin.set_password("correct_pw")
        self.admin.save()

    def test_login_success(self):
        c = APIClient()
        r = c.post("/api/login/", {"username": "admin1", "password": "correct_pw"})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data["success"])
        self.assertNotIn("password", r.data)

    def test_login_wrong_password(self):
        c = APIClient()
        r = c.post("/api/login/", {"username": "admin1", "password": "wrong"})
        self.assertEqual(r.status_code, 401)
        self.assertFalse(r.data["success"])

    def test_login_nonexistent_user(self):
        c = APIClient()
        r = c.post("/api/login/", {"username": "nobody", "password": "pw"})
        self.assertEqual(r.status_code, 401)

    def test_password_not_in_api_response(self):
        """Admin list/detail endpoint must never return password field."""
        from adminpanel.models import Admin
        c = APIClient()
        r = c.get(f"/api/admins/{self.admin.adminID}/",
                  **_admin_headers(self.admin.adminID))
        self.assertEqual(r.status_code, 200)
        self.assertNotIn("password", r.data)


class UnauthorizedAccessTest(TestCase):
    def test_announcement_create_requires_auth(self):
        c = APIClient()
        r = c.post("/api/announcements/", {"title": "Test", "content": "Body"})
        self.assertEqual(r.status_code, 403)

    def test_event_approve_requires_superadmin(self):
        from adminpanel.models import Admin, Event
        from django.utils import timezone
        a = Admin.objects.create(officeName="O", username="ao", email="ao@t.com", contactNumber="0")
        a.set_password("pw"); a.save()
        e = Event.objects.create(admin=a, title="Fest", description="", eventDate=timezone.now(), location="Here")
        c = APIClient()
        # Try with admin role (should fail)
        r = c.patch(f"/superadmin/events/{e.eventID}/approve/",
                    {"superAdminID": 999}, **_admin_headers(a.adminID))
        self.assertEqual(r.status_code, 403)

    def test_report_approve_requires_superadmin(self):
        from publicpanel.models import PublicUser, Report
        u = PublicUser.objects.create(username="u1", email="u1@t.com", name="U", lastName="One")
        u.set_password("pw"); u.save()
        rep = Report.objects.create(publicUser=u, location="Loc", barangay="Bar",
                                    report="Something", description="desc")
        c = APIClient()
        r = c.patch(f"/public/reports/{rep.reportID}/approve/",
                    {"assignedTo_id": 1}, **_publicuser_headers(u.publicUserID),
                    content_type="application/json")
        self.assertEqual(r.status_code, 403)

    def test_unauthenticated_report_list_returns_empty(self):
        c = APIClient()
        r = c.get("/public/reports/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 0)  # No auth = no reports


class ReportOwnershipTest(TestCase):
    def setUp(self):
        from publicpanel.models import PublicUser, Report
        self.u1 = PublicUser.objects.create(username="u1", email="u1@t.com", name="A", lastName="B")
        self.u1.set_password("pw"); self.u1.save()
        self.u2 = PublicUser.objects.create(username="u2", email="u2@t.com", name="C", lastName="D")
        self.u2.set_password("pw"); self.u2.save()
        self.rep = Report.objects.create(
            publicUser=self.u1, location="L", barangay="B",
            report="Issue", description="desc"
        )

    def test_owner_can_see_own_report(self):
        c = APIClient()
        r = c.get("/public/reports/", **_publicuser_headers(self.u1.publicUserID))
        self.assertEqual(r.status_code, 200)
        ids = [x["reportID"] for x in r.data]
        self.assertIn(self.rep.reportID, ids)

    def test_other_user_cannot_see_report(self):
        c = APIClient()
        r = c.get("/public/reports/", **_publicuser_headers(self.u2.publicUserID))
        self.assertEqual(r.status_code, 200)
        ids = [x["reportID"] for x in r.data]
        self.assertNotIn(self.rep.reportID, ids)


class RoleBasedAccessTest(TestCase):
    def setUp(self):
        from adminpanel.models import Admin
        from superpanel.models import SuperAdmin
        self.admin = Admin.objects.create(officeName="O", username="adm", email="adm@t.com", contactNumber="0")
        self.admin.set_password("pw"); self.admin.save()
        self.sa = SuperAdmin.objects.create(superAdminName="SA", username="sa", email="sa@t.com", contactNumber="0")
        self.sa.set_password("pw"); self.sa.save()

    def test_superadmin_can_read_all_reports(self):
        from publicpanel.models import PublicUser, Report
        u = PublicUser.objects.create(username="pu", email="pu@t.com", name="P", lastName="U")
        u.set_password("pw"); u.save()
        Report.objects.create(publicUser=u, location="L", barangay="B", report="R", description="D")
        c = APIClient()
        r = c.get("/public/reports/", **_superadmin_headers(self.sa.superAdminID))
        self.assertEqual(r.status_code, 200)
        self.assertGreater(len(r.data), 0)

    def test_admin_cannot_access_superadmin_events_endpoint(self):
        from adminpanel.models import Event
        from django.utils import timezone
        e = Event.objects.create(admin=self.admin, title="E", description="", eventDate=timezone.now(), location="L")
        c = APIClient()
        # Admin tries to approve event (superadmin-only endpoint)
        r = c.patch(f"/superadmin/events/{e.eventID}/approve/",
                    content_type="application/json",
                    data={}, **_admin_headers(self.admin.adminID))
        self.assertEqual(r.status_code, 403)