function ExecuteScript() {
    try {
        // Tìm trực tiếp thẻ trigger mở cửa sổ tìm kiếm người dùng
        var trigger = document.querySelector('#layout_27 a.window-trigger') || 
                      document.querySelector('a.window-trigger[href*="tim-kiem-nguoi-dung"]');
        
        if (trigger) {
            trigger.click();
            return "TRIGGERED";
        }

        // Dự phòng nếu trigger ẩn trong dropdown chưa khởi tạo click được:
        var allTriggers = Array.from(document.querySelectorAll('a.window-trigger'));
        var userSearchBtn = allTriggers.find(el => el.textContent.trim().includes('Tìm kiếm người dùng'));
        if (userSearchBtn) {
            userSearchBtn.click();
            return "TRIGGERED";
        }

        return "NOT_FOUND_TRIGGER";
    } catch (e) {
        return "ERROR: " + e.message;
    }
}