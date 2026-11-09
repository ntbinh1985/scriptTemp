function ExecuteScript() {
    try {
        var iframe = document.querySelector('iframe[src*="tim-kiem-nguoi-dung"]');
        if (!iframe) return "NO_IFRAME";
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        var win = iframe.contentWindow;

        // 1. Tìm thẻ select gốc quản lý trạng thái User
        var selectElem = doc.querySelector('select#statusUser') || 
                         doc.querySelector('select[name*="statusUser"]') ||
                         doc.querySelector('section:has(#select2-statusUser-container) select');

        if (selectElem) {
            // Giá trị của "Đóng" thường là 0 (hoặc text value tương ứng trong option)
            // Lặp tìm option có text chứa chữ "Đóng"
            for (var i = 0; i < selectElem.options.length; i++) {
                if (selectElem.options[i].text.includes("Đóng")) {
                    selectElem.selectedIndex = i;
                    selectElem.value = selectElem.options[i].value;
                    break;
                }
            }

            // Kích hoạt event change để Select2 cập nhật giao diện
            if (win.jQuery) {
                win.jQuery(selectElem).trigger('change');
            } else {
                selectElem.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // 2. Click nút "Tìm kiếm"
        var btnSearch = doc.querySelector('button#search') || doc.querySelector('button.btn-save');
        if (btnSearch) {
            btnSearch.click();
            return "SEARCH_CLICKED";
        }

        return "BTN_NOT_FOUND";
    } catch (e) {
        return "ERROR: " + e.message;
    }
}