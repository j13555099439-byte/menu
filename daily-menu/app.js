// 数据存储键名（用于localStorage的登录状态）
const LOGIN_STATUS_KEY = 'login_status';
const LOGIN_USERNAME = '好好吃饭';
const LOGIN_PASSWORD = 'cmpldxyzz'; // 实际应用中应该使用哈希

// 草稿存储键名
const DRAFT_STORAGE_KEY = 'meal_draft';
const DISH_DRAFT_STORAGE_KEY = 'dish_draft';

// Firebase 数据库路径
const FIREBASE_PATHS = {
    MENU_DATA: 'menu_data',
    DISHES_LIBRARY: 'dishes_library'
};

// 登录状态
let isLoggedIn = false;

// 当前编辑的餐次和菜品ID
let currentMealType = '';
let currentEditId = null;
let currentDishId = null;
let currentIngredients = [];
let currentDishImage = null; // 当前编辑的菜品图片（base64）
let currentOrder = {}; // 当前点餐：{ dishId: quantity }

// 检查登录状态
function checkLoginStatus() {
    const loginStatus = localStorage.getItem(LOGIN_STATUS_KEY);
    if (loginStatus === 'true') {
        isLoggedIn = true;
        showApp();
        return true;
    }
    return false;
}

// 显示登录界面
function showLogin() {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
}

// 显示应用界面
function showApp() {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    if (loginScreen) loginScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';
    initApp();
}

// 登录处理
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorDiv = document.getElementById('login-error');
    
    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
        // 登录成功
        localStorage.setItem(LOGIN_STATUS_KEY, 'true');
        isLoggedIn = true;
        if (errorDiv) errorDiv.style.display = 'none';
        showApp();
    } else {
        // 登录失败
        if (errorDiv) {
            errorDiv.textContent = '用户名或密码错误';
            errorDiv.style.display = 'block';
        }
    }
}

// 初始化Firebase数据监听
function initFirebaseListeners() {
    if (!firebaseInitialized || database === null || !isLoggedIn) {
        console.warn('Firebase未初始化或未登录，跳过数据监听，使用localStorage');
        // 从localStorage加载初始数据
        loadInitialDataFromLocalStorage();
        return;
    }
    
    // 监听菜单数据变化
    database.ref(FIREBASE_PATHS.MENU_DATA).on('value', (snapshot) => {
        const data = snapshot.val() || {};
        localStorage.setItem('temp_menu_data', JSON.stringify(data));
        console.log('菜单数据已从Firebase同步');
        // 如果当前在今日点菜标签页，重新加载
        const todayTab = document.getElementById('today-tab');
        if (todayTab && todayTab.classList.contains('active')) {
            loadTodayMenu();
        }
    }, (error) => {
        console.error('Firebase数据监听错误:', error);
    });
    
    // 监听菜品库数据变化
    database.ref(FIREBASE_PATHS.DISHES_LIBRARY).on('value', (snapshot) => {
        const data = snapshot.val() || {};
        localStorage.setItem('temp_dishes_data', JSON.stringify(data));
        console.log('菜品库数据已从Firebase同步');
        // 如果当前在相关标签页，重新加载
        const dishesTab = document.getElementById('dishes-tab');
        const todayTab = document.getElementById('today-tab');
        if (dishesTab && dishesTab.classList.contains('active')) {
            loadDishes();
        }
        if (todayTab && todayTab.classList.contains('active')) {
            loadDishesForOrder();
        }
        updateDishDatalist();
    }, (error) => {
        console.error('Firebase数据监听错误:', error);
    });
    
    console.log('Firebase数据监听已启动');
}

// 从localStorage加载初始数据（Firebase未配置时使用）
function loadInitialDataFromLocalStorage() {
    // 尝试从旧的localStorage键加载数据
    const oldMenuData = localStorage.getItem('daily_menu_data');
    const oldDishesData = localStorage.getItem('dishes_library');
    
    if (oldMenuData) {
        localStorage.setItem('temp_menu_data', oldMenuData);
    }
    if (oldDishesData) {
        localStorage.setItem('temp_dishes_data', oldDishesData);
    }
}

// 初始化应用（登录后调用）
function initApp() {
    try {
        // 初始化Firebase监听
        initFirebaseListeners();
        
        // 设置默认日期为今天
        const menuDateEl = document.getElementById('menu-date');
        if (menuDateEl) {
            const today = new Date().toISOString().split('T')[0];
            menuDateEl.value = today;
            
            // 日期变化监听
            menuDateEl.addEventListener('change', function() {
                loadTodayMenu();
            });
        }
        
        // 加载今日数据
        loadTodayMenu();
        
        // 标签页切换
        setupTabs();
        
        // 表单提交（如果存在）
        const mealForm = document.getElementById('meal-form');
        if (mealForm) {
            mealForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveMealItem();
            });
        }
        
        // 点击模态框外部关闭
        const mealModal = document.getElementById('meal-modal');
        if (mealModal) {
            mealModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        }
        
        const dishModal = document.getElementById('dish-modal');
        if (dishModal) {
            dishModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeDishModal();
                }
            });
        }
        
        // 绑定菜品表单提交事件
        const dishForm = document.getElementById('dish-form');
        if (dishForm) {
            dishForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('表单提交事件触发');
                saveDish();
            });
            console.log('菜品表单提交事件已绑定');
        } else {
            console.error('找不到菜品表单元素');
        }
        
        // 加载草稿
        loadDraft();
        
        // 加载菜品库到datalist
        updateDishDatalist();
        
        // 加载点餐界面（如果元素存在）
        const dishesGrid = document.getElementById('dishes-grid');
        if (dishesGrid) {
            loadDishesForOrder();
        }
    } catch (error) {
        console.error('初始化错误:', error);
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 绑定登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 检查登录状态
    if (!checkLoginStatus()) {
        showLogin();
    }
});

// 标签页切换函数（直接在HTML中调用）
function switchTab(tabName, buttonElement) {
    console.log('switchTab 被调用:', tabName);
    
    // 移除所有活动状态
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // 添加活动状态
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    const targetContent = document.getElementById(tabName + '-tab');
    if (targetContent) {
        targetContent.classList.add('active');
        console.log('成功切换到标签页:', tabName);
    } else {
        console.error('找不到标签内容元素:', tabName + '-tab');
        alert('页面元素加载错误，请刷新页面');
        return;
    }
    
    // 根据不同标签页加载数据
    if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'dishes') {
        loadDishes();
    } else if (tabName === 'today') {
        loadTodayMenu();
        // 确保菜品被加载
        setTimeout(() => {
            const dishesGrid = document.getElementById('dishes-grid');
            if (dishesGrid && dishesGrid.children.length === 0) {
                console.log('标签页切换后重新加载菜品');
                loadDishesForOrder();
            }
        }, 100);
    }
}

// 设置标签页切换（保留作为备用）
function setupTabs() {
    console.log('setupTabs 被调用');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('找到标签按钮数量:', tabBtns.length);
    console.log('找到标签内容数量:', tabContents.length);
    
    if (tabBtns.length === 0) {
        console.error('没有找到标签按钮');
        return;
    }
    
    tabBtns.forEach((btn, index) => {
        // 如果已经有onclick事件，就不重复绑定
        if (btn.getAttribute('onclick')) {
            console.log('按钮已有onclick事件，跳过绑定');
            return;
        }
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = this.getAttribute('data-tab');
            console.log('点击标签:', targetTab);
            
            if (!targetTab) {
                console.error('标签按钮没有 data-tab 属性');
                return;
            }
            
            switchTab(targetTab, this);
            
            return false;
        });
    });
    
    console.log('标签页切换事件已绑定');
}

// 加载今日菜单（新的点餐形式）
function loadTodayMenu() {
    const menuDateEl = document.getElementById('menu-date');
    if (!menuDateEl) return; // 如果元素不存在，直接返回
    
    const date = menuDateEl.value;
    const data = getStoredData();
    const dayData = data[date] || {};
    
    // 加载点餐数据，确保数量是数字类型
    const orderData = dayData.order || {};
    currentOrder = {};
    Object.keys(orderData).forEach(dishId => {
        const qty = parseInt(orderData[dishId]) || 0;
        if (qty > 0) {
            currentOrder[dishId] = qty;
        }
    });
    console.log('加载点餐数据，转换后的 currentOrder:', currentOrder);
    
    // 加载菜品浏览界面（如果元素存在）
    const dishesGrid = document.getElementById('dishes-grid');
    if (dishesGrid) {
        loadDishesForOrder();
    }
    
    // 加载已点菜品
    loadOrderItems();
    
    // 计算并显示营养汇总（只在元素存在时调用）
    const nutritionContainer = document.getElementById('nutrition-summary-content');
    if (nutritionContainer) {
        calculateAndDisplayNutrition();
    } else {
        console.warn('营养汇总容器不存在，跳过营养汇总计算');
    }
}

// 添加菜品到DOM（旧函数，保留以兼容旧数据）
function addMealItemToDOM(mealType, item, index) {
    const container = document.getElementById(mealType + '-items');
    if (!container) return; // 如果容器不存在，说明是新的点餐界面
    
    const mealItem = document.createElement('div');
    mealItem.className = 'meal-item';
    mealItem.setAttribute('data-index', index);
    
    const noteText = item.note ? ` | ${item.note}` : '';
    
    mealItem.innerHTML = `
        <div class="meal-item-info">
            <div class="meal-item-name">${item.name}</div>
            <div class="meal-item-details">${noteText}</div>
        </div>
        <div class="meal-item-actions">
            <button class="btn-edit" onclick="editMealItem('${mealType}', ${index})">编辑</button>
            <button class="btn-delete" onclick="deleteMealItem('${mealType}', ${index})">删除</button>
        </div>
    `;
    
    container.appendChild(mealItem);
}

// 添加菜品
function addMealItem(mealType) {
    currentMealType = mealType;
    currentEditId = null;
    
    // 清空表单
    document.getElementById('meal-form').reset();
    document.getElementById('meal-name').focus();
    
    // 显示模态框
    document.getElementById('meal-modal').classList.add('active');
}

// 编辑菜品
function editMealItem(mealType, index) {
    const date = document.getElementById('menu-date').value;
    const data = getStoredData();
    const dayData = data[date] || {};
    const items = dayData[mealType] || [];
    const item = items[index];
    
    if (!item) return;
    
    currentMealType = mealType;
    currentEditId = index;
    
    // 填充表单
    document.getElementById('meal-name').value = item.name;
    document.getElementById('meal-note').value = item.note || '';
    
    // 显示模态框
    document.getElementById('meal-modal').classList.add('active');
}

// 删除菜品
function deleteMealItem(mealType, index) {
    if (!confirm('确定要删除这个菜品吗？')) return;
    
    const date = document.getElementById('menu-date').value;
    const data = getStoredData();
    
    if (!data[date] || !data[date][mealType]) return;
    
    data[date][mealType].splice(index, 1);
    
    // 如果该餐次为空，删除餐次对象
    if (data[date][mealType].length === 0) {
        delete data[date][mealType];
    }
    
    // 如果该天没有数据，删除日期对象
    if (Object.keys(data[date]).length === 0) {
        delete data[date];
    }
    
    saveStoredData(data);
    loadTodayMenu();
}

// 保存菜品
function saveMealItem() {
    const name = document.getElementById('meal-name').value.trim();
    if (!name) {
        alert('请输入菜品名称');
        return;
    }
    
    const note = document.getElementById('meal-note').value.trim();
    
    const date = document.getElementById('menu-date').value;
    const data = getStoredData();
    
    if (!data[date]) {
        data[date] = {};
    }
    if (!data[date][currentMealType]) {
        data[date][currentMealType] = [];
    }
    
    const item = {
        name: name,
        note: note || null,
        timestamp: new Date().toISOString()
    };
    
    if (currentEditId !== null) {
        // 编辑模式
        data[date][currentMealType][currentEditId] = item;
    } else {
        // 添加模式
        data[date][currentMealType].push(item);
    }
    
    saveStoredData(data);
    closeModal();
    loadTodayMenu();
}

// 关闭模态框
function closeModal() {
    document.getElementById('meal-modal').classList.remove('active');
    currentMealType = '';
    currentEditId = null;
    document.getElementById('meal-form').reset();
}

// 加载历史记录
function loadHistory() {
    const data = getStoredData();
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    // 获取所有日期并排序
    const dates = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有记录，快去添加第一道菜吧！</div>';
        return;
    }
    
    dates.forEach(date => {
        const dayData = data[date];
        const dayElement = createHistoryDayElement(date, dayData);
        container.appendChild(dayElement);
    });
}

// 创建历史记录日期元素
function createHistoryDayElement(date, dayData) {
    const dayElement = document.createElement('div');
    dayElement.className = 'history-day';
    
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    let html = `<div class="history-day-header">${dateStr}</div>`;
    
    // 兼容旧数据格式（mealType）和新数据格式（order）
    const dishes = getDishesData();
    
    if (dayData.order && Object.keys(dayData.order).length > 0) {
        // 新格式：使用order
        html += `<div class="history-meal">
            <div class="history-meal-title">已点菜品</div>
            <div class="history-meal-items">`;
        
        Object.keys(dayData.order).forEach(dishId => {
            const quantity = dayData.order[dishId];
            if (quantity > 0) {
                const dish = dishes[dishId];
                if (dish) {
                    html += `<div class="history-meal-item">${dish.name} × ${quantity} 份</div>`;
                }
            }
        });
        
        html += `</div></div>`;
    } else {
        // 兼容旧格式：mealType
        const mealTypes = {
            breakfast: '早餐',
            lunch: '午餐',
            dinner: '晚餐',
            snack: '夜宵/零食'
        };
        
        Object.keys(mealTypes).forEach(mealType => {
            if (dayData[mealType] && dayData[mealType].length > 0) {
                html += `<div class="history-meal">
                    <div class="history-meal-title">${mealTypes[mealType]}</div>
                    <div class="history-meal-items">`;
                
                dayData[mealType].forEach(item => {
                    const noteText = item.note ? ` - ${item.note}` : '';
                    html += `<div class="history-meal-item">${item.name}${noteText}</div>`;
                });
                
                html += `</div></div>`;
            }
        });
    }
    
    dayElement.innerHTML = html;
    return dayElement;
}

// 筛选历史记录
function filterHistory() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        alert('请选择开始日期和结束日期');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('开始日期不能晚于结束日期');
        return;
    }
    
    const data = getStoredData();
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    // 获取所有日期并筛选
    const dates = Object.keys(data)
        .filter(date => date >= startDate && date <= endDate)
        .sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) {
        container.innerHTML = '<div class="empty-state">该日期范围内没有记录</div>';
        return;
    }
    
    dates.forEach(date => {
        const dayData = data[date];
        const dayElement = createHistoryDayElement(date, dayData);
        container.appendChild(dayElement);
    });
}

// 清除筛选
function clearFilter() {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    loadHistory();
}

// 导出为CSV
function exportToCSV() {
    const startDate = document.getElementById('export-start-date').value;
    const endDate = document.getElementById('export-end-date').value;
    
    if (!startDate || !endDate) {
        alert('请选择开始日期和结束日期');
        return;
    }
    
    const data = getStoredData();
    const dates = Object.keys(data)
        .filter(date => date >= startDate && date <= endDate)
        .sort((a, b) => new Date(a) - new Date(b));
    
    if (dates.length === 0) {
        alert('该日期范围内没有数据');
        return;
    }
    
    let csv = '日期,菜品名称,数量\n';
    const dishes = getDishesData();
    
    dates.forEach(date => {
        const dayData = data[date];
        
        // 新格式：使用order
        if (dayData.order && Object.keys(dayData.order).length > 0) {
            Object.keys(dayData.order).forEach(dishId => {
                const quantity = dayData.order[dishId];
                if (quantity > 0) {
                    const dish = dishes[dishId];
                    if (dish) {
                        csv += `"${date}","${dish.name}","${quantity}"\n`;
                    }
                }
            });
        } else {
            // 兼容旧格式
            const mealTypes = {
                breakfast: '早餐',
                lunch: '午餐',
                dinner: '晚餐',
                snack: '夜宵/零食'
            };
            
            Object.keys(mealTypes).forEach(mealType => {
                if (dayData[mealType] && dayData[mealType].length > 0) {
                    dayData[mealType].forEach(item => {
                        csv += `"${date}","${item.name}","1"\n`;
                    });
                }
            });
        }
    });
    
    downloadFile(csv, `菜单记录_${startDate}_${endDate}.csv`, 'text/csv;charset=utf-8;');
    showExportPreview('CSV', dates.length);
}

// 导出为Excel (实际是CSV格式，Excel可以打开)
function exportToExcel() {
    exportToCSV(); // Excel可以打开CSV格式
}

// 导出为JSON
function exportToJSON() {
    const startDate = document.getElementById('export-start-date').value;
    const endDate = document.getElementById('export-end-date').value;
    
    if (!startDate || !endDate) {
        alert('请选择开始日期和结束日期');
        return;
    }
    
    const data = getStoredData();
    const exportData = {};
    
    const dates = Object.keys(data)
        .filter(date => date >= startDate && date <= endDate)
        .sort((a, b) => new Date(a) - new Date(b));
    
    if (dates.length === 0) {
        alert('该日期范围内没有数据');
        return;
    }
    
    dates.forEach(date => {
        exportData[date] = data[date];
    });
    
    const json = JSON.stringify(exportData, null, 2);
    downloadFile(json, `菜单记录_${startDate}_${endDate}.json`, 'application/json;charset=utf-8;');
    showExportPreview('JSON', dates.length);
}

// 下载文件
function downloadFile(content, filename, contentType) {
    const blob = new Blob(['\ufeff' + content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 显示导出预览
function showExportPreview(format, dayCount) {
    const preview = document.getElementById('export-preview');
    preview.innerHTML = `
        <h3>导出成功！</h3>
        <p>格式：${format}</p>
        <p>共导出 ${dayCount} 天的记录</p>
        <p>文件已下载到您的设备</p>
    `;
}

// 获取存储的数据（从Firebase）
function getStoredData() {
    if (!isLoggedIn) {
        return {};
    }
    
    // 如果Firebase已初始化，从临时存储读取（Firebase监听器会更新它）
    if (typeof database !== 'undefined') {
        const data = localStorage.getItem('temp_menu_data');
        return data ? JSON.parse(data) : {};
    }
    
    // 如果Firebase未初始化，从localStorage读取（兼容模式）
    const data = localStorage.getItem('temp_menu_data');
    return data ? JSON.parse(data) : {};
}

// 保存数据（保存到Firebase）
function saveStoredData(data) {
    if (!isLoggedIn) {
        console.error('未登录，无法保存数据');
        return;
    }
    
    // 先保存到localStorage作为备份
    localStorage.setItem('temp_menu_data', JSON.stringify(data));
    
    // 如果Firebase已初始化，保存到Firebase
    if (firebaseInitialized && database !== null) {
        database.ref(FIREBASE_PATHS.MENU_DATA).set(data)
            .then(() => {
                console.log('菜单数据已保存到Firebase');
            })
            .catch((error) => {
                console.error('保存菜单数据到Firebase失败:', error);
                console.log('数据已保存到localStorage作为备份');
            });
    } else {
        console.log('Firebase未配置，数据已保存到localStorage');
    }
}

// ==================== 菜品管理功能 ====================

// 获取菜品库数据（从Firebase）
function getDishesData() {
    if (!isLoggedIn) {
        return {};
    }
    
    // 如果Firebase已初始化，从临时存储读取（Firebase监听器会更新它）
    if (typeof database !== 'undefined') {
        const data = localStorage.getItem('temp_dishes_data');
        return data ? JSON.parse(data) : {};
    }
    
    // 如果Firebase未初始化，从localStorage读取（兼容模式）
    const data = localStorage.getItem('temp_dishes_data');
    return data ? JSON.parse(data) : {};
}

// 保存菜品库数据（保存到Firebase）
function saveDishesData(data) {
    if (!isLoggedIn) {
        console.error('未登录，无法保存数据');
        return;
    }
    
    // 先保存到localStorage作为备份
    localStorage.setItem('temp_dishes_data', JSON.stringify(data));
    updateDishDatalist();
    
    // 如果Firebase已初始化，保存到Firebase
    if (firebaseInitialized && database !== null) {
        database.ref(FIREBASE_PATHS.DISHES_LIBRARY).set(data)
            .then(() => {
                console.log('菜品库数据已保存到Firebase');
            })
            .catch((error) => {
                console.error('保存菜品库数据到Firebase失败:', error);
                console.log('数据已保存到localStorage作为备份');
            });
    } else {
        console.log('Firebase未配置，数据已保存到localStorage');
    }
}

// 加载菜品列表
function loadDishes() {
    const dishes = getDishesData();
    const container = document.getElementById('dishes-list');
    container.innerHTML = '';
    
    const dishIds = Object.keys(dishes);
    if (dishIds.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有添加菜品，点击上方按钮添加第一个菜品吧！</div>';
        return;
    }
    
    dishIds.forEach(id => {
        const dish = dishes[id];
        const dishCard = createDishCard(id, dish);
        container.appendChild(dishCard);
    });
}

// 创建菜品卡片（菜品管理页面）
function createDishCard(id, dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    
    let ingredientsHtml = '';
    if (dish.ingredients && dish.ingredients.length > 0) {
        dish.ingredients.forEach(ing => {
            ingredientsHtml += `<div class="dish-ingredient-item">${ing.name} - ${ing.weight}g</div>`;
        });
    } else {
        ingredientsHtml = '<div class="dish-ingredient-item" style="color:#999;">暂无原材料</div>';
    }
    
    const nutrition = calculateDishNutrition(dish.ingredients || []);
    
    let imageHtml = '';
    if (dish.image) {
        imageHtml = `<div class="dish-card-image-container"><img src="${dish.image}" alt="${dish.name}" class="dish-card-image"></div>`;
    }
    
    card.innerHTML = `
        ${imageHtml}
        <div class="dish-card-header">
            <div class="dish-card-name">${dish.name}</div>
            <div class="dish-card-actions">
                <button class="dish-card-btn btn-edit-dish" onclick="editDish('${id}')">编辑</button>
                <button class="dish-card-btn btn-delete-dish" onclick="deleteDish('${id}')">删除</button>
            </div>
        </div>
        <div class="dish-ingredients">${ingredientsHtml}</div>
        <div class="dish-nutrition-mini">
            热量: ${nutrition.calories.toFixed(1)}kcal | 
            蛋白质: ${nutrition.protein.toFixed(1)}g | 
            脂肪: ${nutrition.fat.toFixed(1)}g
        </div>
    `;
    
    return card;
}

// 打开菜品模态框
function openDishModal(dishId = null) {
    console.log('openDishModal 被调用', dishId);
    const modal = document.getElementById('dish-modal');
    const form = document.getElementById('dish-form');
    const imagePreview = document.getElementById('dish-image-preview');
    
    if (!modal) {
        console.error('找不到菜品模态框元素 dish-modal');
        alert('页面元素加载错误，请刷新页面');
        return;
    }
    if (!form) {
        console.error('找不到菜品表单元素 dish-form');
        alert('页面元素加载错误，请刷新页面');
        return;
    }
    
    console.log('模态框和表单元素找到，准备打开');
    currentDishId = dishId;
    currentDishImage = null;
    
    if (dishId) {
        const titleEl = document.getElementById('dish-modal-title');
        if (titleEl) titleEl.textContent = '编辑菜品';
        
        const dishes = getDishesData();
        const dish = dishes[dishId];
        if (dish) {
            const nameEl = document.getElementById('dish-name');
            const noteEl = document.getElementById('dish-note');
            if (nameEl) nameEl.value = dish.name;
            if (noteEl) noteEl.value = dish.note || '';
            currentIngredients = JSON.parse(JSON.stringify(dish.ingredients || []));
            currentDishImage = dish.image || null;
            renderDishIngredients();
            updateDishNutritionPreview();
            // 显示图片预览
            if (imagePreview) {
                if (dish.image) {
                    imagePreview.innerHTML = `<img src="${dish.image}" alt="预览" class="image-preview">`;
                } else {
                    imagePreview.innerHTML = '';
                }
            }
        }
    } else {
        const titleEl = document.getElementById('dish-modal-title');
        if (titleEl) titleEl.textContent = '添加新菜品';
        form.reset();
        currentIngredients = [];
        if (imagePreview) imagePreview.innerHTML = '';
        renderDishIngredients();
        updateDishNutritionPreview();
    }
    
    modal.classList.add('active');
    console.log('模态框已打开');
}

// 关闭菜品模态框
function closeDishModal() {
    const modal = document.getElementById('dish-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentDishId = null;
    currentIngredients = [];
    currentDishImage = null;
    const form = document.getElementById('dish-form');
    if (form) {
        form.reset();
    }
    const imagePreview = document.getElementById('dish-image-preview');
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
}

// 处理图片上传
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentDishImage = e.target.result;
        const preview = document.getElementById('dish-image-preview');
        preview.innerHTML = `<img src="${currentDishImage}" alt="预览" class="image-preview">`;
    };
    reader.readAsDataURL(file);
}

// 添加菜品原材料行
function addDishIngredientRow() {
    currentIngredients.push({ name: '', weight: '' });
    renderDishIngredients();
    updateDishNutritionPreview();
}

// 渲染菜品原材料列表
function renderDishIngredients() {
    const container = document.getElementById('dish-ingredients-list');
    if (!container) return; // 如果元素不存在，直接返回
    
    container.innerHTML = '';
    
    currentIngredients.forEach((ing, index) => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" placeholder="原材料名称" value="${ing.name}" 
                   onchange="updateDishIngredient(${index}, 'name', this.value)"
                   oninput="updateDishNutritionPreview()">
            <input type="number" placeholder="重量" value="${ing.weight}" step="0.1" min="0"
                   onchange="updateDishIngredient(${index}, 'weight', this.value)"
                   oninput="updateDishNutritionPreview()">
            <span class="unit">g</span>
            <button type="button" class="btn-remove-ingredient" onclick="removeDishIngredient(${index})">删除</button>
        `;
        container.appendChild(row);
    });
}

// 更新菜品原材料
function updateDishIngredient(index, field, value) {
    if (currentIngredients[index]) {
        currentIngredients[index][field] = value;
        saveDishDraft();
    }
}

// 删除菜品原材料
function removeDishIngredient(index) {
    currentIngredients.splice(index, 1);
    renderDishIngredients();
    updateDishNutritionPreview();
    saveDishDraft();
}

// 计算菜品营养
function calculateDishNutrition(ingredients) {
    const nutritionList = [];
    ingredients.forEach(ing => {
        if (ing.name && ing.weight) {
            const weight = parseFloat(ing.weight) || 0;
            if (weight > 0) {
                const nutrition = calculateNutrition(ing.name, weight);
                nutritionList.push(nutrition);
            }
        }
    });
    return mergeNutrition(nutritionList);
}

// 更新菜品营养预览
function updateDishNutritionPreview() {
    const nutrition = calculateDishNutrition(currentIngredients);
    const container = document.getElementById('dish-nutrition-preview');
    if (!container) return; // 如果元素不存在，直接返回
    
    if (currentIngredients.length === 0 || !currentIngredients.some(ing => ing.name && ing.weight)) {
        container.innerHTML = '<p style="color:#999;text-align:center;">添加原材料后自动计算营养</p>';
        return;
    }
    
    container.innerHTML = `
        <h3>营养信息预览</h3>
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <div class="nutrition-item-label">热量</div>
                <div class="nutrition-item-value">${nutrition.calories.toFixed(1)}</div>
                <div class="nutrition-item-label">kcal</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">蛋白质</div>
                <div class="nutrition-item-value">${nutrition.protein.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">脂肪</div>
                <div class="nutrition-item-value">${nutrition.fat.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">碳水</div>
                <div class="nutrition-item-value">${nutrition.carbs.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">膳食纤维</div>
                <div class="nutrition-item-value">${nutrition.fiber.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">钙</div>
                <div class="nutrition-item-value">${nutrition.calcium.toFixed(1)}</div>
                <div class="nutrition-item-label">mg</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">铁</div>
                <div class="nutrition-item-value">${nutrition.iron.toFixed(1)}</div>
                <div class="nutrition-item-label">mg</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">维C</div>
                <div class="nutrition-item-value">${nutrition.vitaminC.toFixed(1)}</div>
                <div class="nutrition-item-label">mg</div>
            </div>
        </div>
    `;
}

// 保存菜品
function saveDish() {
    console.log('saveDish 被调用');
    const nameEl = document.getElementById('dish-name');
    const noteEl = document.getElementById('dish-note');
    
    if (!nameEl) {
        console.error('菜品名称输入框不存在');
        alert('页面元素加载错误，请刷新页面重试');
        return;
    }
    
    const name = nameEl.value.trim();
    console.log('菜品名称:', name);
    if (!name) {
        alert('请输入菜品名称');
        return;
    }
    
    const note = noteEl ? noteEl.value.trim() : '';
    const dishes = getDishesData();
    const id = currentDishId || Date.now().toString();
    
    dishes[id] = {
        name: name,
        ingredients: currentIngredients.filter(ing => ing.name && ing.weight),
        note: note || null,
        image: currentDishImage || null,
        nutrition: calculateDishNutrition(currentIngredients),
        createdAt: currentDishId ? dishes[id]?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    saveDishesData(dishes);
    console.log('菜品已保存:', dishes[id]);
    closeDishModal();
    loadDishes();
    clearDishDraft();
    // 如果是在点餐页面，重新加载
    const todayTab = document.getElementById('today-tab');
    if (todayTab && todayTab.classList.contains('active')) {
        loadDishesForOrder();
    }
    alert('菜品保存成功！');
}

// 编辑菜品
function editDish(id) {
    openDishModal(id);
}

// 删除菜品
function deleteDish(id) {
    if (!confirm('确定要删除这个菜品吗？')) return;
    
    const dishes = getDishesData();
    delete dishes[id];
    saveDishesData(dishes);
    loadDishes();
}

// 切换菜品列表的展开/折叠
function toggleDishesList() {
    const dishesGrid = document.getElementById('dishes-grid');
    const toggleBtn = document.getElementById('toggle-dishes-btn');
    
    if (!dishesGrid || !toggleBtn) return;
    
    // 切换折叠状态
    const isCollapsed = dishesGrid.classList.contains('collapsed');
    
    if (isCollapsed) {
        // 展开
        dishesGrid.classList.remove('collapsed');
        toggleBtn.classList.remove('collapsed');
    } else {
        // 折叠
        dishesGrid.classList.add('collapsed');
        toggleBtn.classList.add('collapsed');
    }
}

// 加载菜品用于点餐界面
function loadDishesForOrder() {
    console.log('loadDishesForOrder 被调用');
    const container = document.getElementById('dishes-grid');
    if (!container) {
        console.error('找不到 dishes-grid 容器，可能不在今日点菜标签页');
        return; // 如果元素不存在，直接返回
    }
    
    try {
        const dishes = getDishesData();
        console.log('获取到的菜品数据:', dishes);
        console.log('菜品数据对象:', typeof dishes, Object.keys(dishes));
        
        container.innerHTML = '';
        
        const dishIds = Object.keys(dishes);
        console.log('菜品数量:', dishIds.length);
        
        if (dishIds.length === 0) {
            container.innerHTML = '<div class="empty-state">还没有添加菜品，先去菜品管理添加吧！</div>';
            console.log('没有菜品数据');
            return;
        }
        
        let loadedCount = 0;
        dishIds.forEach(id => {
            const dish = dishes[id];
            if (!dish) {
                console.warn('菜品数据为空:', id);
                return;
            }
            try {
                const dishCard = createDishItemCard(id, dish);
                container.appendChild(dishCard);
                loadedCount++;
            } catch (error) {
                console.error('创建菜品卡片失败:', id, error);
            }
        });
        
        console.log('菜品加载完成，共', loadedCount, '个菜品成功加载');
    } catch (error) {
        console.error('加载菜品时出错:', error);
        container.innerHTML = '<div class="empty-state" style="color:red;">加载菜品时出错，请刷新页面重试</div>';
    }
}

// 创建点餐菜品卡片
function createDishItemCard(id, dish) {
    const card = document.createElement('div');
    card.className = 'dish-item-card';
    
    const nutrition = dish.nutrition || calculateDishNutrition(dish.ingredients || []);
    const quantity = currentOrder[id] || 0;
    
    let imageHtml = '';
    if (dish.image) {
        imageHtml = `<img src="${dish.image}" alt="${dish.name}">`;
    } else {
        imageHtml = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:0.9em;">暂无图片</div>';
    }
    
    card.innerHTML = `
        <div class="dish-item-image">${imageHtml}</div>
        <div class="dish-item-info">
            <div class="dish-item-name">${dish.name}</div>
            <div class="dish-item-nutrition">
                热量: ${nutrition.calories.toFixed(1)}kcal | 
                蛋白质: ${nutrition.protein.toFixed(1)}g
            </div>
            <div class="dish-item-quantity">
                <button class="quantity-btn" onclick="decreaseQuantity('${id}')">-</button>
                <input type="number" class="quantity-input" id="qty-${id}" value="${quantity}" min="0" 
                       onchange="updateQuantity('${id}', this.value)">
                <button class="quantity-btn" onclick="increaseQuantity('${id}')">+</button>
            </div>
        </div>
    `;
    
    return card;
}

// 增加数量（确保在全局作用域）
window.increaseQuantity = function(dishId) {
    console.log('increaseQuantity 被调用:', dishId);
    const currentQty = parseInt(currentOrder[dishId] || 0);
    updateQuantity(dishId, currentQty + 1);
};

// 减少数量（确保在全局作用域）
window.decreaseQuantity = function(dishId) {
    console.log('decreaseQuantity 被调用:', dishId);
    const currentQty = parseInt(currentOrder[dishId] || 0);
    if (currentQty > 0) {
        updateQuantity(dishId, currentQty - 1);
    }
};

// 更新数量（确保在全局作用域）
window.updateQuantity = function(dishId, quantity) {
    console.log('updateQuantity 被调用:', dishId, quantity);
    let qty = parseInt(quantity) || 0;
    if (qty < 0) {
        qty = 0;
    }
    
    if (qty === 0) {
        delete currentOrder[dishId];
    } else {
        currentOrder[dishId] = qty; // 确保保存为数字
    }
    
    // 更新输入框
    const input = document.getElementById(`qty-${dishId}`);
    if (input) {
        input.value = qty;
    }
    
    // 保存点餐数据
    saveOrder();
    
    // 重新加载已点菜品和营养汇总
    loadOrderItems();
    calculateAndDisplayNutrition();
};

// 保存点餐数据
function saveOrder() {
    const date = document.getElementById('menu-date').value;
    const data = getStoredData();
    
    if (!data[date]) {
        data[date] = {};
    }
    
    data[date].order = currentOrder;
    saveStoredData(data);
}

// 加载已点菜品
function loadOrderItems() {
    const container = document.getElementById('order-items');
    if (!container) return; // 如果元素不存在，直接返回
    
    container.innerHTML = '';
    
    const dishes = getDishesData();
    // 确保数量是数字类型
    const orderDishIds = Object.keys(currentOrder).filter(id => {
        const qty = parseInt(currentOrder[id]) || 0;
        return qty > 0;
    });
    
    if (orderDishIds.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有点菜，从上方选择菜品吧！</div>';
        return;
    }
    
    orderDishIds.forEach(dishId => {
        const dish = dishes[dishId];
        if (!dish) return;
        
        const quantity = parseInt(currentOrder[dishId]) || 0;
        const orderItem = createOrderItem(dishId, dish, quantity);
        container.appendChild(orderItem);
    });
}

// 创建已点菜品项
function createOrderItem(dishId, dish, quantity) {
    const item = document.createElement('div');
    item.className = 'order-item';
    
    let imageHtml = '';
    if (dish.image) {
        imageHtml = `<img src="${dish.image}" alt="${dish.name}" class="order-item-image">`;
    } else {
        imageHtml = '<div class="order-item-image" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:0.8em;">无图</div>';
    }
    
    item.innerHTML = `
        <div class="order-item-info">
            ${imageHtml}
            <div class="order-item-details">
                <div class="order-item-name">${dish.name}</div>
                <div class="order-item-quantity">数量: ${quantity} 份</div>
            </div>
        </div>
        <div class="order-item-actions">
            <button class="quantity-btn" onclick="decreaseQuantity('${dishId}')">-</button>
            <input type="number" class="quantity-input" value="${quantity}" min="0" 
                   onchange="updateQuantity('${dishId}', this.value)">
            <button class="quantity-btn" onclick="increaseQuantity('${dishId}')">+</button>
        </div>
    `;
    
    return item;
}

// 计算并显示营养汇总
function calculateAndDisplayNutrition() {
    console.log('calculateAndDisplayNutrition 被调用');
    console.log('当前点餐数据:', currentOrder);
    console.log('currentOrder 类型:', typeof currentOrder);
    console.log('currentOrder 键:', Object.keys(currentOrder));
    
    const dishes = getDishesData();
    const needs = getDailyNutritionNeeds();
    
    // 计算总营养
    let totalNutrition = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        calcium: 0,
        iron: 0,
        vitaminC: 0
    };
    
    // 确保 currentOrder 是对象
    if (!currentOrder || typeof currentOrder !== 'object') {
        console.warn('currentOrder 不是有效对象，重置为空对象');
        currentOrder = {};
    }
    
    // 过滤出数量大于0的菜品，处理字符串和数字类型
    const orderDishIds = Object.keys(currentOrder).filter(id => {
        const qty = parseInt(currentOrder[id]) || 0;
        console.log(`菜品 ${id} 的数量:`, currentOrder[id], '转换为:', qty);
        return qty > 0;
    });
    console.log('已点菜品ID列表:', orderDishIds);
    console.log('已点菜品数量:', orderDishIds.length);
    
    if (orderDishIds.length === 0) {
        console.log('没有已点菜品，清空营养汇总');
        const container = document.getElementById('nutrition-summary-content');
        if (container) {
            container.innerHTML = '<div class="empty-state">还没有点菜，营养汇总将在点菜后显示</div>';
        }
        return;
    }
    
    orderDishIds.forEach(dishId => {
        // 确保数量是数字类型
        const quantity = parseInt(currentOrder[dishId]) || 0;
        console.log(`处理菜品 ${dishId}，数量: ${quantity}`);
        
        if (quantity > 0) {
            const dish = dishes[dishId];
            if (dish) {
                const nutrition = dish.nutrition || calculateDishNutrition(dish.ingredients || []);
                console.log(`菜品 ${dish.name} (${quantity}份) 的营养:`, nutrition);
                Object.keys(totalNutrition).forEach(key => {
                    totalNutrition[key] += (nutrition[key] || 0) * quantity;
                });
            } else {
                console.warn('找不到菜品数据:', dishId);
            }
        }
    });
    
    console.log('计算出的总营养:', totalNutrition);
    
    // 显示营养汇总
    displayNutritionSummary(totalNutrition, needs);
}

// 显示营养汇总
function displayNutritionSummary(total, needs) {
    console.log('displayNutritionSummary 被调用');
    const container = document.getElementById('nutrition-summary-content');
    if (!container) {
        console.error('找不到营养汇总容器 nutrition-summary-content');
        return; // 如果元素不存在，直接返回
    }
    
    console.log('找到营养汇总容器，准备显示数据');
    
    const nutritionItems = [
        { key: 'calories', label: '热量', unit: 'kcal', need: needs.calories },
        { key: 'protein', label: '蛋白质', unit: 'g', need: needs.protein },
        { key: 'fat', label: '脂肪', unit: 'g', need: needs.fat },
        { key: 'carbs', label: '碳水化合物', unit: 'g', need: needs.carbs },
        { key: 'fiber', label: '膳食纤维', unit: 'g', need: needs.fiber },
        { key: 'calcium', label: '钙', unit: 'mg', need: needs.calcium },
        { key: 'iron', label: '铁', unit: 'mg', need: needs.iron },
        { key: 'vitaminC', label: '维生素C', unit: 'mg', need: needs.vitaminC }
    ];
    
    let html = '';
    nutritionItems.forEach(item => {
        const value = total[item.key] || 0;
        const need = item.need;
        const percentage = need > 0 ? (value / need * 100).toFixed(1) : '0.0';
        const isSatisfied = value >= need;
        const shortage = isSatisfied ? 0 : (need - value).toFixed(1);
        
        html += `
            <div class="nutrition-status-item ${isSatisfied ? 'satisfied' : 'unsatisfied'}">
                <div>
                    <div class="nutrition-status-label">${item.label}</div>
                    <div class="nutrition-status-detail">
                        ${value.toFixed(1)}${item.unit} / ${need}${item.unit} (${percentage}%)
                    </div>
                </div>
                <div class="nutrition-status-value">
                    ${isSatisfied ? '✓ 满足' : `✗ 还差 ${shortage}${item.unit}`}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('营养汇总已显示，HTML长度:', html.length);
}

// 更新菜品datalist
function updateDishDatalist() {
    const dishes = getDishesData();
    const datalist = document.getElementById('dish-list');
    datalist.innerHTML = '';
    
    Object.values(dishes).forEach(dish => {
        const option = document.createElement('option');
        option.value = dish.name;
        datalist.appendChild(option);
    });
}

// ==================== 原材料管理功能 ====================

// 添加原材料行
function addIngredientRow() {
    currentIngredients.push({ name: '', weight: '' });
    renderIngredients();
    updateNutritionPreview();
    saveDraft();
}

// 渲染原材料列表
function renderIngredients() {
    const container = document.getElementById('ingredients-list');
    container.innerHTML = '';
    
    currentIngredients.forEach((ing, index) => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" placeholder="原材料名称" value="${ing.name}" 
                   list="ingredient-suggestions"
                   onchange="updateIngredient(${index}, 'name', this.value)"
                   oninput="updateNutritionPreview(); saveDraft();">
            <input type="number" placeholder="重量" value="${ing.weight}" step="0.1" min="0"
                   onchange="updateIngredient(${index}, 'weight', this.value)"
                   oninput="updateNutritionPreview(); saveDraft();">
            <span class="unit">g</span>
            <button type="button" class="btn-remove-ingredient" onclick="removeIngredient(${index})">删除</button>
        `;
        container.appendChild(row);
    });
    
    // 添加原材料建议列表
    if (!document.getElementById('ingredient-suggestions')) {
        const datalist = document.createElement('datalist');
        datalist.id = 'ingredient-suggestions';
        Object.keys(NUTRITION_DB).forEach(ing => {
            const option = document.createElement('option');
            option.value = ing;
            datalist.appendChild(option);
        });
        document.body.appendChild(datalist);
    }
}

// 更新原材料
function updateIngredient(index, field, value) {
    if (currentIngredients[index]) {
        currentIngredients[index][field] = value;
        saveDraft();
    }
}

// 删除原材料
function removeIngredient(index) {
    currentIngredients.splice(index, 1);
    renderIngredients();
    updateNutritionPreview();
    saveDraft();
}

// 更新营养预览
function updateNutritionPreview() {
    const nutrition = calculateDishNutrition(currentIngredients);
    const container = document.getElementById('nutrition-preview');
    
    if (currentIngredients.length === 0 || !currentIngredients.some(ing => ing.name && ing.weight)) {
        container.innerHTML = '<p style="color:#999;text-align:center;">添加原材料后自动计算营养</p>';
        return;
    }
    
    const needs = getDailyNutritionNeeds();
    
    container.innerHTML = `
        <h3>营养信息</h3>
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <div class="nutrition-item-label">热量</div>
                <div class="nutrition-item-value">${nutrition.calories.toFixed(1)}</div>
                <div class="nutrition-item-label">kcal</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">蛋白质</div>
                <div class="nutrition-item-value">${nutrition.protein.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">脂肪</div>
                <div class="nutrition-item-value">${nutrition.fat.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">碳水</div>
                <div class="nutrition-item-value">${nutrition.carbs.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
        </div>
    `;
}

// 显示菜品选择器
function showDishSelector() {
    const dishes = getDishesData();
    const container = document.getElementById('dish-selector-list');
    container.innerHTML = '';
    
    const dishIds = Object.keys(dishes);
    if (dishIds.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有添加菜品，先去菜品管理添加吧！</div>';
    } else {
        dishIds.forEach(id => {
            const dish = dishes[id];
            const item = document.createElement('div');
            item.className = 'dish-selector-item';
            item.onclick = () => selectDish(id);
            
            const nutrition = dish.nutrition || calculateDishNutrition(dish.ingredients || []);
            item.innerHTML = `
                <div class="dish-selector-item-name">${dish.name}</div>
                <div class="dish-selector-item-info">
                    热量: ${nutrition.calories.toFixed(1)}kcal | 
                    原材料: ${(dish.ingredients || []).length}种
                </div>
            `;
            container.appendChild(item);
        });
    }
    
    document.getElementById('dish-selector-modal').classList.add('active');
}

// 关闭菜品选择器
function closeDishSelector() {
    document.getElementById('dish-selector-modal').classList.remove('active');
}

// 选择菜品
function selectDish(id) {
    const dishes = getDishesData();
    const dish = dishes[id];
    if (!dish) return;
    
    document.getElementById('meal-name').value = dish.name;
    currentIngredients = JSON.parse(JSON.stringify(dish.ingredients || []));
    renderIngredients();
    updateNutritionPreview();
    closeDishSelector();
    saveDraft();
}

// ==================== 草稿功能 ====================

// 保存草稿
function saveDraft() {
    const mealNameEl = document.getElementById('meal-name');
    if (!mealNameEl) return; // 如果元素不存在，说明不在点餐界面
    
    const draft = {
        name: mealNameEl.value,
        note: document.getElementById('meal-note').value,
        ingredients: currentIngredients,
        mealType: currentMealType
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

// 加载草稿
function loadDraft() {
    const mealNameEl = document.getElementById('meal-name');
    if (!mealNameEl) return; // 如果元素不存在，说明不在点餐界面
    
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
        try {
            const data = JSON.parse(draft);
            if (data.name) mealNameEl.value = data.name;
            if (data.note) document.getElementById('meal-note').value = data.note;
            if (data.ingredients) {
                currentIngredients = data.ingredients;
                renderIngredients();
                updateNutritionPreview();
            }
        } catch (e) {
            console.error('加载草稿失败', e);
        }
    }
}

// 清除草稿
function clearDraft() {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
}

// 保存菜品草稿
function saveDishDraft() {
    const draft = {
        name: document.getElementById('dish-name').value,
        note: document.getElementById('dish-note').value,
        ingredients: currentIngredients
    };
    localStorage.setItem(DISH_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

// 清除菜品草稿
function clearDishDraft() {
    localStorage.removeItem(DISH_DRAFT_STORAGE_KEY);
}

// ==================== 更新现有功能 ====================

// 更新添加菜品函数
function addMealItem(mealType) {
    currentMealType = mealType;
    currentEditId = null;
    currentIngredients = [];
    
    // 清空表单
    document.getElementById('meal-form').reset();
    renderIngredients();
    updateNutritionPreview();
    document.getElementById('meal-name').focus();
    
    // 显示模态框
    document.getElementById('meal-modal').classList.add('active');
}

// 更新编辑菜品函数
function editMealItem(mealType, index) {
    const date = document.getElementById('menu-date').value;
    const data = getStoredData();
    const dayData = data[date] || {};
    const items = dayData[mealType] || [];
    const item = items[index];
    
    if (!item) return;
    
    currentMealType = mealType;
    currentEditId = index;
    
    // 填充表单
    document.getElementById('meal-name').value = item.name || '';
    document.getElementById('meal-note').value = item.note || '';
    currentIngredients = item.ingredients ? JSON.parse(JSON.stringify(item.ingredients)) : [];
    renderIngredients();
    updateNutritionPreview();
    
    // 显示模态框
    document.getElementById('meal-modal').classList.add('active');
}

// 更新保存菜品函数
function saveMealItem() {
    const name = document.getElementById('meal-name').value.trim();
    if (!name) {
        alert('请输入菜品名称');
        return;
    }
    
    const note = document.getElementById('meal-note').value.trim();
    
    const date = document.getElementById('menu-date').value;
    const data = getStoredData();
    
    if (!data[date]) {
        data[date] = {};
    }
    if (!data[date][currentMealType]) {
        data[date][currentMealType] = [];
    }
    
    const nutrition = calculateDishNutrition(currentIngredients);
    
    const item = {
        name: name,
        note: note || null,
        ingredients: currentIngredients.filter(ing => ing.name && ing.weight),
        nutrition: nutrition,
        timestamp: new Date().toISOString()
    };
    
    if (currentEditId !== null) {
        data[date][currentMealType][currentEditId] = item;
    } else {
        data[date][currentMealType].push(item);
    }
    
    saveStoredData(data);
    clearDraft();
    closeModal();
    loadTodayMenu();
}

// 更新关闭模态框函数
function closeModal() {
    document.getElementById('meal-modal').classList.remove('active');
    currentMealType = '';
    currentEditId = null;
    currentIngredients = [];
    document.getElementById('meal-form').reset();
    renderIngredients();
    updateNutritionPreview();
}

// 更新添加菜品到DOM函数
function addMealItemToDOM(mealType, item, index) {
    const container = document.getElementById(mealType + '-items');
    const mealItem = document.createElement('div');
    mealItem.className = 'meal-item';
    mealItem.setAttribute('data-index', index);
    
    const noteText = item.note ? ` | ${item.note}` : '';
    const nutritionText = item.nutrition ? ` | 热量: ${item.nutrition.calories.toFixed(1)}kcal` : '';
    
    mealItem.innerHTML = `
        <div class="meal-item-info">
            <div class="meal-item-name">${item.name}</div>
            <div class="meal-item-details">${noteText}${nutritionText}</div>
        </div>
        <div class="meal-item-actions">
            <button class="btn-edit" onclick="editMealItem('${mealType}', ${index})">编辑</button>
            <button class="btn-delete" onclick="deleteMealItem('${mealType}', ${index})">删除</button>
        </div>
    `;
    
    container.appendChild(mealItem);
}

// 旧的loadTodayMenu函数已删除，使用新的点餐系统版本

// 计算一餐的营养
function calculateMealNutrition(items) {
    const nutritionList = [];
    items.forEach(item => {
        if (item.nutrition) {
            nutritionList.push(item.nutrition);
        } else if (item.ingredients) {
            const nutrition = calculateDishNutrition(item.ingredients);
            nutritionList.push(nutrition);
        }
    });
    return mergeNutrition(nutritionList);
}

// 显示营养汇总（旧版本，用于兼容旧数据，已重命名）
function displayNutritionSummaryOld(mealType, nutrition) {
    const container = document.getElementById(mealType + '-nutrition');
    if (!container) return; // 如果元素不存在，直接返回
    
    const mealNames = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐',
        snack: '夜宵/零食'
    };
    
    if (nutrition.calories === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <h3>${mealNames[mealType]}营养汇总</h3>
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <div class="nutrition-item-label">热量</div>
                <div class="nutrition-item-value">${nutrition.calories.toFixed(1)}</div>
                <div class="nutrition-item-label">kcal</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">蛋白质</div>
                <div class="nutrition-item-value">${nutrition.protein.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">脂肪</div>
                <div class="nutrition-item-value">${nutrition.fat.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-item-label">碳水</div>
                <div class="nutrition-item-value">${nutrition.carbs.toFixed(1)}</div>
                <div class="nutrition-item-label">g</div>
            </div>
        </div>
    `;
}
