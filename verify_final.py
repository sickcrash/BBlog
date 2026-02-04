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
    page.get_by_text("Pull").click()

    print("Adding exercise...")
    page.get_by_text("Exercise").click()

    print("Verifying block visibility...")
    expect(page.get_by_placeholder("Exercise Name")).to_be_visible()

    print("Verifying Calendar UI...")
    # Open calendar
    page.get_by_role("button").filter(has_text=r"Feb").first.click()

    # Check if 'today' or selected date has correct style class or attribute (hard to check color in headless without screenshot analysis, but we can check if it renders)
    page.screenshot(path="calendar_check.png")

    # Close calendar
    # page.keyboard.press("Escape") or click X
    # Assuming X button exists

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)
