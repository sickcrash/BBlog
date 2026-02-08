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
        page.screenshot(path="debug_final_load_arch.png")
        print("Load timeout")
        browser.close()
        return

    print("Selecting session 'Pull'...")
    try:
        page.get_by_text("Pull").click(timeout=5000)
    except:
        print("Pull not found.")
        page.screenshot(path="debug_session_arch.png")

    print("Adding exercise...")
    page.get_by_text("Exercise").click()

    print("Verifying block visibility...")
    expect(page.get_by_placeholder("Exercise Name")).to_be_visible()

    print("Typing in Exercise Name...")
    ex_input = page.get_by_placeholder("Exercise Name")
    ex_input.click()
    ex_input.type("Deadlift")

    # Blur
    page.get_by_text("Note").click()

    # Test program management?
    # Open program modal
    page.get_by_text("Program 1").click()
    # Check if we can see the trash icon (might be tricky if edit mode is required first)
    # The requirement says "Trash2 per eliminare il programma".
    # In my code, Trash2 appears only when editing.

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)
