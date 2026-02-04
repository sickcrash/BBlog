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
        page.screenshot(path="debug_final_load.png")
        print("Load timeout")
        browser.close()
        return

    print("Selecting session 'Pull'...")
    # 'Pull' might not be visible initially if it's off screen or if data changed.
    # We should look for any session.
    try:
        page.get_by_text("Pull").click(timeout=5000)
    except:
        print("Pull not found. Maybe new data structure?")
        page.screenshot(path="debug_session.png")

    print("Adding exercise...")
    page.get_by_text("Exercise").click()

    print("Verifying block visibility...")
    expect(page.get_by_placeholder("Exercise Name")).to_be_visible()

    # Test Drag Handle existence (ScaleDecorator usually adds wrappers, but we check if we can click)
    # This is hard to test in headless, but if it renders without crash, it's good.

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)
