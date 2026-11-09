function ExecuteScript() {
    try {
        // 1. Nhận biến từ Power Automate Desktop
        var maKH = "%MaKH%";
        var maNV = "%MaNV%";
        var ngayHieuLuc = "%NgayHieuLuc%";
        var donVi = "%DonVi%";

        // 2. Xác định iframe chứa form
        var doc = document;
        var win = window;
        var iframe = document.querySelector('iframe[src*="tao-moi-nguoi-dung"]') ||
                     document.querySelector('iframe[src*="nguoi-dung"]') || 
                     document.querySelector('iframe[src*="user"]') ||
                     document.querySelector('div.window.active iframe');

        if (iframe) {
            doc = iframe.contentDocument || iframe.contentWindow.document;
            win = iframe.contentWindow;
        }

        // Hàm delay đồng bộ (Synchronous Sleep) để PAD không bị trả về Object Promise
        function syncSleep(ms) {
            var start = Date.now();
            while (Date.now() - start < ms) {
                // Giữ vòng lặp chạy tạo độ trễ cho DOM render
            }
        }

        // Đóng popup lỗi/cảnh báo tồn đọng nếu có
        var btnClose = doc.querySelector('.modal.show button.close') || 
                       doc.querySelector('.modal.show button[data-dismiss="modal"]') ||
                       doc.querySelector('.modal-dialog button');
        if (btnClose) btnClose.click();

        // 3. Hàm chọn Select2 AJAX đồng bộ
        function selectLOVById(selectId, searchValue) {
            var selectElem = doc.querySelector(selectId);
            if (!selectElem) return "ERR_NOT_FOUND_" + selectId;

            var nextSpan = selectElem.nextElementSibling;
            var select2Btn = (nextSpan && nextSpan.classList.contains('select2-container')) ? 
                             nextSpan.querySelector('.select2-selection') : 
                             doc.querySelector('span[aria-labelledby*="' + selectElem.id + '"]');

            if (!select2Btn) return "ERR_BTN_NOT_FOUND_" + selectId;

            select2Btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            select2Btn.click();
            syncSleep(300);

            var searchInput = doc.querySelector('.select2-container--open input.select2-search__field') || 
                              doc.querySelector('input.select2-search__field') ||
                              document.querySelector('input.select2-search__field');

            if (!searchInput) return "ERR_INPUT_NOT_FOUND_" + selectId;

            searchInput.focus();
            searchInput.value = "";
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            syncSleep(100);

            searchInput.value = searchValue;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            if (win.jQuery) {
                win.jQuery(searchInput).val(searchValue).trigger('input').trigger('keyup');
            } else {
                searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
            }

            syncSleep(400);

            var startTime = Date.now();
            var targetItem = null;
            var cleanSearchVal = searchValue.trim().toUpperCase();

            // Chờ tối đa 8 giây cho AJAX trả kết quả
            while (Date.now() - startTime < 8000) {
                var results = doc.querySelectorAll('.select2-container--open ul.select2-results__options li.select2-results__option') ||
                              doc.querySelectorAll('ul.select2-results__options li.select2-results__option');

                if (results && results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        var item = results[i];
                        if (item.classList.contains('loading-results') || 
                            item.classList.contains('select2-results__message')) {
                            continue;
                        }

                        var itemText = (item.textContent || "").trim().toUpperCase();
                        if (itemText.includes(cleanSearchVal)) {
                            targetItem = item;
                            break;
                        }
                    }
                }

                if (targetItem) break;
                syncSleep(200);
            }

            if (targetItem) {
                targetItem.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                targetItem.click();
                syncSleep(600);
                return "OK";
            } else {
                if (doc.body) doc.body.click();
                return "TIMEOUT_NOT_FOUND_" + searchValue;
            }
        }

        // 4. Điền tuần tự các trường
        // [1] Mã khách hàng
        var resKH = selectLOVById('select#customerCode', maKH);
        if (resKH !== "OK") return resKH;

        // [2] Mã nhân viên
        var nvId = 'select#employeeCode';
        if (!doc.querySelector(nvId)) {
            var nvSelect = doc.querySelector('section:has(label:contains("Mã nhân viên")) select') ||
                           doc.querySelector('select[name*="employee"]') ||
                           doc.querySelector('select[name*="userCode"]');
            if (nvSelect) nvId = '#' + nvSelect.id;
        }
        var resNV = selectLOVById(nvId, maNV);
        if (resNV !== "OK") return resNV;

        // [3] Ngày hiệu lực
        var dateInput = doc.querySelector('#activeTime') || doc.querySelector('input[name*="activeTime"]');
        if (dateInput) {
            dateInput.focus();
            dateInput.value = ngayHieuLuc;
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            dateInput.dispatchEvent(new Event('blur', { bubbles: true }));
        }
        syncSleep(300);

        // [4] Đơn vị
        var dvId = 'select#branchUuid, select#branch';
        if (!doc.querySelector(dvId)) {
            var dvSelect = doc.querySelector('select[name*="branch"]') ||
                           doc.querySelector('select#orgUnit');
            if (dvSelect) dvId = '#' + dvSelect.id;
        }
        var resDV = selectLOVById(dvId, donVi);
        if (resDV !== "OK") return resDV;

        // Trả về chuỗi Text thuần túy
        return "SUCCESS";

    } catch (err) {
        return "ERROR: " + err.message;
    }
}
