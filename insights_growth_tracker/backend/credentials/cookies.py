from dotenv import load_dotenv
import os

load_dotenv()

def return_cookies():
    return [
        # Critical Authentication
        {"name": "li_at", "value": os.getenv("LI_AT"), "domain": ".www.linkedin.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "None"},
        
        # Session IDs
        {"name": "JSESSIONID", "value": os.getenv("JSESSIONID_IN"), "domain": ".in.linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "JSESSIONID", "value": os.getenv("JSESSIONID_WWW"), "domain": ".www.linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        
        # Browser cookies
        {"name": "bcookie", "value": os.getenv("BCOOKIE"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "bscookie", "value": os.getenv("BSCOOKIE_IN"), "domain": ".in.linkedin.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "None"},
        {"name": "bscookie", "value": os.getenv("BSCOOKIE_WWW"), "domain": ".www.linkedin.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "None"},
        
        # Data center routing
        {"name": "lidc", "value": os.getenv("LIDC"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        
        # Language and preferences
        {"name": "lang", "value": os.getenv("LANG"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "timezone", "value": os.getenv("TIMEZONE"), "domain": ".www.linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "li_theme", "value": os.getenv("LI_THEME"), "domain": ".www.linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "li_theme_set", "value": os.getenv("LI_THEME_SET"), "domain": ".www.linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        
        # Tracking and analytics
        {"name": "li_sugr", "value": os.getenv("LI_SUGR"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "_guid", "value": os.getenv("GUID"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "liap", "value": os.getenv("LIAP"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "dfpfpt", "value": os.getenv("DFPFPT"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "None"},
        {"name": "fptctx2", "value": os.getenv("FPTCTX2"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "None"},
        
        # User matching and analytics history
        {"name": "UserMatchHistory", "value": os.getenv("USER_MATCH_HISTORY"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "AnalyticsSyncHistory", "value": os.getenv("ANALYTICS_SYNC_HISTORY"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        
        # LinkedIn marketing/ads
        {"name": "lms_ads", "value": os.getenv("LMS_ADS"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        {"name": "lms_analytics", "value": os.getenv("LMS_ANALYTICS"), "domain": ".linkedin.com", "path": "/", "secure": True, "httpOnly": False, "sameSite": "None"},
        
        # Adobe Analytics
        {"name": os.getenv("AMCV"), "value": os.getenv("AMCV_VALUE"), "domain": ".linkedin.com", "path": "/", "secure": False, "httpOnly": False, "sameSite": "Lax"},
        {"name": os.getenv("AMCVS"), "value": os.getenv("AMCVS_VALUE"), "domain": ".linkedin.com", "path": "/", "secure": False, "httpOnly": False, "sameSite": "Lax"},
        
        # AAM UUID
        {"name": "aam_uuid", "value": os.getenv("AAM_UUID"), "domain": ".linkedin.com", "path": "/", "secure": False, "httpOnly": False, "sameSite": "Lax"},
        {"name": "aam_uuid", "value": os.getenv("AAM_UUID"), "domain": ".in.linkedin.com", "path": "/", "secure": False, "httpOnly": False, "sameSite": "Lax"},
        
        # Google Analytics
        {"name": "_gcl_au", "value": os.getenv("GCL_AU"), "domain": ".linkedin.com", "path": "/", "secure": False, "httpOnly": False, "sameSite": "Lax"},
        
        # Google state
        {"name": "g_state", "value": os.getenv("G_STATE"), "domain": "in.linkedin.com", "path": "/", "secure": False, "httpOnly": False, "sameSite": "Lax"},
    ]
