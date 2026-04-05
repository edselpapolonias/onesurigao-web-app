"""
Django settings for onesurigao project.
Security-hardened — uses environment variables for all secrets.
Development fallbacks are provided so the app still runs locally without a .env file.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_env_file(env_path: Path) -> None:
    """Load simple KEY=VALUE pairs from a local .env file into os.environ."""
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load_env_file(BASE_DIR / ".env")

# ─────────────────────────────────────────────────────────────────────────────
# SECURITY — all secrets come from the environment in production
# In development the fallback values keep things working out of the box.
# ─────────────────────────────────────────────────────────────────────────────

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    # Fallback used ONLY in local development — never deploy this value.
    "django-insecure-d$g&r(&u8=$po4q17w#^y6_94@4b@4ucf5$_j8sljmjl)&1y^w",
)

# Set DJANGO_DEBUG=False in production
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() == "true"

# Comma-separated list, e.g. DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
_raw_hosts = os.environ.get("DJANGO_ALLOWED_HOSTS", "")
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(",") if h.strip()] or (
    ["*"] if DEBUG else ["127.0.0.1", "localhost"]
)

# ─────────────────────────────────────────────────────────────────────────────
# APPLICATIONS
# ─────────────────────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "rest_framework",
    "corsheaders",
    "adminpanel",
    "publicpanel",
    "superpanel",
    "shared",                           # ← new: shared permissions module
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# ─────────────────────────────────────────────────────────────────────────────
# MIDDLEWARE — corsheaders must stay first
# ─────────────────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF    = "onesurigao.urls"
WSGI_APPLICATION = "onesurigao.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS":    [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE — credentials from environment; fallback to your current dev values
# ─────────────────────────────────────────────────────────────────────────────

DATABASES = {
    "default": {
        "ENGINE":   "django.db.backends.postgresql",
        "NAME":     os.environ.get("DB_NAME",     "onesurigao_db"),
        "USER":     os.environ.get("DB_USER",     "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "root"),
        "HOST":     os.environ.get("DB_HOST",     "localhost"),
        "PORT":     os.environ.get("DB_PORT",     "5432"),
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# PASSWORD HASHING — Django's default PBKDF2+SHA256 is used by our custom
# set_password / check_password helpers on Admin, SuperAdmin, PublicUser.
# ─────────────────────────────────────────────────────────────────────────────

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─────────────────────────────────────────────────────────────────────────────
# CORS
# In development we allow all origins for ease of use.
# In production set CORS_ALLOW_ALL_ORIGINS=False and provide the real origins.
# ─────────────────────────────────────────────────────────────────────────────

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    _raw_cors = os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _raw_cors.split(",") if o.strip()]

# ─────────────────────────────────────────────────────────────────────────────
# DJANGO REST FRAMEWORK
# ─────────────────────────────────────────────────────────────────────────────

REST_FRAMEWORK = {
    # Our views set permissions explicitly; this is a safe open default
    # because every protected view declares its own permission_classes.
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    # No session / token auth wired here — we use custom X-Role / X-User-ID headers.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}

# ─────────────────────────────────────────────────────────────────────────────
# MEDIA & STATIC
# ─────────────────────────────────────────────────────────────────────────────

MEDIA_URL  = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STATIC_URL  = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"  # used by collectstatic in production

# ─────────────────────────────────────────────────────────────────────────────
# INTERNATIONALISATION
# ─────────────────────────────────────────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE     = "Asia/Manila"
USE_I18N      = True
USE_TZ        = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─────────────────────────────────────────────────────────────────────────────
# SECURITY HEADERS — only meaningful when DEBUG=False / behind HTTPS
# ─────────────────────────────────────────────────────────────────────────────

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER   = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS              = "DENY"
    # Uncomment these once you have HTTPS in place:
    # SECURE_SSL_REDIRECT                  = True
    # SESSION_COOKIE_SECURE                = True
    # CSRF_COOKIE_SECURE                   = True
    # SECURE_HSTS_SECONDS                  = 31536000
    # SECURE_HSTS_INCLUDE_SUBDOMAINS       = True
