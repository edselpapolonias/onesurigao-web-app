# management/commands/hash_existing_passwords.py
# Run ONCE after deploying to hash all plaintext passwords already in the database.
# python manage.py hash_existing_passwords

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password, is_password_usable


class Command(BaseCommand):
    help = "Hash all plaintext passwords in Admin, SuperAdmin, and PublicUser tables."

    def handle(self, *args, **options):
        from adminpanel.models import Admin
        from superpanel.models import SuperAdmin
        from publicpanel.models import PublicUser

        count = 0
        for Model, id_field in [
            (Admin, "adminID"),
            (SuperAdmin, "superAdminID"),
            (PublicUser, "publicUserID"),
        ]:
            for obj in Model.objects.all():
                if not is_password_usable(obj.password):
                    # Already hashed — skip.
                    continue
                # Treat the current value as plaintext and hash it.
                obj.password = make_password(obj.password)
                obj.save(update_fields=["password"])
                count += 1
                self.stdout.write(f"  Hashed {Model.__name__} #{getattr(obj, id_field)}")

        self.stdout.write(self.style.SUCCESS(f"Done. {count} password(s) hashed."))