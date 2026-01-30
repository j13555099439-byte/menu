// Firebase 配置
// 注意：这个文件需要你创建Firebase项目后填入真实的配置信息

// ============================================
// 步骤：请按照 FIREBASE_SETUP.md 中的说明获取配置信息
// 然后将下面的占位符替换为你的真实配置
// ============================================

let database = null;
let firebaseInitialized = false;

// 检查是否已配置Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAbfDKHaro9c1yKJ4NryH5NxEnyhfjtN1o",
    authDomain: "menu-2588e.firebaseapp.com",
    databaseURL: "https://menu-2588e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "menu-2588e",
    storageBucket: "menu-2588e.firebasestorage.app",
    messagingSenderId: "988223252837",
    appId: "1:988223252837:web:30ebee90c98625303a998c"
};

// 检查配置是否已填写
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                              firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// 初始化Firebase（在DOM加载后执行）
function initFirebase() {
    if (isFirebaseConfigured && typeof firebase !== 'undefined') {
        try {
            // 初始化 Firebase
            firebase.initializeApp(firebaseConfig);
            
            // 获取数据库引用
            database = firebase.database();
            firebaseInitialized = true;
            
            console.log('Firebase 初始化成功');
            console.log('数据库URL:', firebaseConfig.databaseURL);
        } catch (error) {
            console.error('Firebase 初始化失败:', error);
            console.warn('将使用 localStorage 作为后备存储');
        }
    } else {
        if (!isFirebaseConfigured) {
            console.warn('Firebase 配置未完成，将使用 localStorage 存储数据');
        } else {
            console.warn('Firebase SDK 未加载，将使用 localStorage 存储数据');
        }
    }
}

// 等待Firebase SDK加载后初始化
if (typeof firebase !== 'undefined') {
    // 如果Firebase已经加载，立即初始化
    initFirebase();
} else {
    // 如果Firebase还没加载，等待加载
    window.addEventListener('load', function() {
        setTimeout(initFirebase, 100);
    });
}