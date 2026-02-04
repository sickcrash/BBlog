from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating...")
    page.goto("http://localhost:8081", timeout=60000)

    print("Waiting for load...")
    try:
        expect(page.get_by_text("Program 1")).to_be_visible(timeout=30000)
    except:
        page.screenshot(path="debug_load_fail.png")
        print("Load timeout")
        browser.close()
        return

    print("Selecting session...")
    page.get_by_text("Pull").click()

    print("Adding exercise...")
    page.get_by_text("Exercise").click()

    # Wait for block
    print("Verifying block visibility...")
    try:
        # Check for placeholder text or some input
        expect(page.get_by_placeholder("Exercise Name")).to_be_visible(timeout=5000)
        print("Block is visible!")
    except:
        print("Block NOT visible")
        page.screenshot(path="block_missing.png")

    page.screenshot(path="final_verification.png")
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)
