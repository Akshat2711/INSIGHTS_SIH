import asyncio
from playwright.async_api import async_playwright, Page, BrowserContext
import os
import sys
import json
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

linkedin_pass = os.getenv("Linkedin_pass", " ")
linkedin_email = os.getenv("Linkedin_email", " ")

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from credentials.cookies import return_cookies


class LinkedInScraper:
    def __init__(self, headless=False, proxy=None, max_scrolls=15, scroll_delay=1):
        self.headless = headless
        self.proxy = proxy
        self.max_scrolls = max_scrolls
        self.scroll_delay = scroll_delay
        self.browser = None
        self.context = None
        self.page = None
        self.playwright = None
        self.is_initialized = False
        # store the asyncio loop that created/started playwright/browser
        self.creation_loop = None

    async def launch_browser(self):
        launch_options = {
            "headless": self.headless,
            "args": ['--no-sandbox', '--disable-blink-features=AutomationControlled']
        }
        if self.proxy:
            launch_options["proxy"] = {"server": self.proxy}

        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(**launch_options)
        # record the loop that launched Playwright/browser so we know if it's safe to reuse
        try:
            self.creation_loop = asyncio.get_running_loop()
        except Exception:
            self.creation_loop = None
        self.context = await self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36"
        )
        self.page = await self.context.new_page()
        await self.page.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )

    async def close_browser(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        # don't clear creation_loop here; cleanup() will
    
    async def cleanup(self):
        """Call this when you're done with all scraping"""
        await self.close_browser()
        self.is_initialized = False
        # clear references so re-initialization from another loop is obvious/safe
        self.browser = None
        self.context = None
        self.page = None
        self.playwright = None
        self.creation_loop = None

    async def ensure_login(self) -> bool:
        """Try cookies first, fallback to email/password login."""
        try:
            # try cookies first
            cookies = return_cookies()
            if cookies:
                await self.context.add_cookies(cookies)

            await self.page.goto("https://www.linkedin.com/feed/", timeout=20000)
            await self.page.wait_for_selector("#global-nav", timeout=10000)
            if await self.page.locator('[data-test-id="nav-user-menu"]').count() > 0:
                return True

        except Exception:
            pass  # fall back

        # --- fallback manual login ---
        await self.page.goto("https://www.linkedin.com/login", timeout=20000)

        try:
            if await self.page.locator("#username").count() > 0:
                await self.page.fill("#username", linkedin_email)
            if await self.page.locator("#password").count() > 0:
                await self.page.fill("#password", linkedin_pass)

            await self.page.click('button[type="submit"]')
            await self.page.wait_for_load_state("networkidle", timeout=15000)

            # check again if logged in
            if await self.page.locator('[data-test-id="nav-user-menu"]').count() > 0:
                return True
            else:
                print("-> Login may have failed (captcha/2FA?)")
                return False

        except Exception as e:
            print(f"-> Login fallback error: {e}")
            return False

    async def auto_scroll(self):
        """Scroll until no new content loads or max_scrolls reached."""
        last_height = await self.page.evaluate("document.body.scrollHeight")
        for _ in range(self.max_scrolls):
            await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(self.scroll_delay)
            new_height = await self.page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    async def fetch_post_containers(self):
        """Return all post containers using reliable selectors."""
        containers = await self.page.query_selector_all(
            '.feed-shared-update-v2, [data-id*="urn:li:activity"]'
        )
        return containers

    async def extract_post_data(self, container) -> dict:
        """Extract post data in one JS evaluation (faster than many API calls)."""
        return await container.evaluate("""(el) => {
            const q = (sel) => el.querySelector(sel)?.innerText?.trim() || null;
            const a = (sel) => el.querySelector(sel)?.getAttribute('href') || null;
            const img = (sel) => el.querySelector(sel)?.getAttribute('src') || null;

            let hashtags = [];
            el.querySelectorAll('a[href*="keywords=%23"], a[href*="/hashtag/"]').forEach(tag => {
                if (tag.innerText.startsWith('#')) hashtags.push(tag.innerText.trim());
            });

            let images = [];
            el.querySelectorAll('.update-components-image__image, .feed-shared-image img')
              .forEach(i => { if (i.src) images.push(i.src); });

            return {
                author_name: el.querySelector('.update-components-actor__meta-link, .feed-shared-actor__meta a')?.ariaLabel || q('.update-components-actor__meta-link, .feed-shared-actor__meta a'),
                author_url: a('.update-components-actor__meta-link, .feed-shared-actor__meta a'),
                author_avatar: img('.update-components-actor__avatar-image, .feed-shared-actor__avatar img'),
                timestamp: q('.update-components-actor__sub-description, .feed-shared-actor__sub-description'),
                text: q('.update-components-text, .feed-shared-text'),
                hashtags,
                images,
                reactions: el.querySelector('[data-reaction-details], .social-counts-reactions button')?.ariaLabel
                           || q('[data-reaction-details], .social-counts-reactions button'),
                comments: q('.social-details-social-counts__comments button, .social-counts-comments button'),
                user_liked: !!el.querySelector('.react-button__trigger[aria-pressed="true"], .reactions-button[aria-pressed="true"]'),
                post_url: a('a[href*="/posts/"], a[href*="/activity:"]')
            };
        }""")
    async def scrape_profile_activity(self, profile_url: str) -> list:
        try:
            # Always ensure browser is properly initialized
            if not self.is_initialized or self.page is None or self.browser is None:
                await self.launch_browser()
                await self.ensure_login()
                self.is_initialized = True
            
            activity_url = f"{profile_url.rstrip('/')}/recent-activity/all/"
            await self.page.goto(activity_url, wait_until="domcontentloaded", timeout=30000)
            
            await self.auto_scroll()

            containers = await self.fetch_post_containers()
            print(f"-> Found {len(containers)} post containers")

            posts_data = []
            for idx, container in enumerate(containers):
                try:
                    post_data = await self.extract_post_data(container)
                    if post_data.get('text') or post_data.get('images'):
                        posts_data.append(post_data)
                except Exception as e:
                    print(f"-> Error processing post {idx}: {e}")

            return posts_data

        except Exception as e:
            print(f"-> Scraping error: {e}")
            # Reset initialization flag on error
            self.is_initialized = False
            return []
    def can_be_used_in_loop(self) -> bool:
        """Return True if this scraper was created/started in current running loop and appears initialized."""
        try:
            return (self.is_initialized
                    and self.creation_loop is not None
                    and self.creation_loop == asyncio.get_running_loop()
                    and self.browser is not None
                    and self.page is not None)
        except RuntimeError:
            # no running loop -> cannot be used
            return False
if __name__ == "__main__":
    async def test_scraper():
        scraper = LinkedInScraper(headless=False)
        try:
            posts = await scraper.scrape_profile_activity("https://www.linkedin.com/in/gomathi--nayagam")
            print(f"Found {len(posts)} posts")
        finally:
            await scraper.cleanup()
    
    asyncio.run(test_scraper())