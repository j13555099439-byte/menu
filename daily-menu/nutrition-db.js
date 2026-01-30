// 营养数据库 - 每100g食材的营养成分
// 数据来源：中国食物成分表
const NUTRITION_DB = {
    // 主食类
    '大米': { calories: 346, protein: 7.4, fat: 0.8, carbs: 77.9, fiber: 0.7, calcium: 13, iron: 2.3, vitaminC: 0 },
    '面条': { calories: 280, protein: 8.3, fat: 0.7, carbs: 61.9, fiber: 0.8, calcium: 11, iron: 3.6, vitaminC: 0 },
    '馒头': { calories: 221, protein: 7.0, fat: 1.1, carbs: 47.0, fiber: 1.3, calcium: 38, iron: 1.8, vitaminC: 0 },
    '面包': { calories: 312, protein: 8.3, fat: 5.1, carbs: 58.1, fiber: 0.5, calcium: 49, iron: 2.0, vitaminC: 0 },
    '米饭': { calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3, calcium: 7, iron: 1.3, vitaminC: 0 },
    
    // 肉类
    '猪肉': { calories: 395, protein: 13.2, fat: 37.0, carbs: 2.4, fiber: 0, calcium: 6, iron: 1.6, vitaminC: 0 },
    '牛肉': { calories: 250, protein: 20.2, fat: 2.3, carbs: 1.2, fiber: 0, calcium: 9, iron: 2.8, vitaminC: 0 },
    '鸡肉': { calories: 167, protein: 19.3, fat: 9.4, carbs: 1.3, fiber: 0, calcium: 9, iron: 1.4, vitaminC: 0 },
    '鱼肉': { calories: 113, protein: 18.6, fat: 4.2, carbs: 0, fiber: 0, calcium: 28, iron: 1.0, vitaminC: 0 },
    '鸡蛋': { calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8, fiber: 0, calcium: 56, iron: 2.0, vitaminC: 0 },
    
    // 蔬菜类
    '白菜': { calories: 17, protein: 1.5, fat: 0.1, carbs: 3.2, fiber: 0.8, calcium: 50, iron: 0.7, vitaminC: 31 },
    '菠菜': { calories: 24, protein: 2.6, fat: 0.3, carbs: 4.5, fiber: 1.7, calcium: 66, iron: 2.9, vitaminC: 32 },
    '西红柿': { calories: 19, protein: 0.9, fat: 0.2, carbs: 4.0, fiber: 0.5, calcium: 10, iron: 0.4, vitaminC: 19 },
    '黄瓜': { calories: 16, protein: 0.8, fat: 0.2, carbs: 3.2, fiber: 0.5, calcium: 24, iron: 0.5, vitaminC: 9 },
    '胡萝卜': { calories: 41, protein: 0.9, fat: 0.2, carbs: 9.5, fiber: 1.1, calcium: 32, iron: 0.5, vitaminC: 13 },
    '土豆': { calories: 77, protein: 2.0, fat: 0.2, carbs: 17.2, fiber: 0.7, calcium: 8, iron: 0.8, vitaminC: 27 },
    '茄子': { calories: 21, protein: 1.1, fat: 0.1, carbs: 4.9, fiber: 1.3, calcium: 24, iron: 0.5, vitaminC: 5 },
    '青椒': { calories: 22, protein: 1.0, fat: 0.2, carbs: 5.4, fiber: 1.4, calcium: 14, iron: 0.8, vitaminC: 72 },
    '洋葱': { calories: 40, protein: 1.1, fat: 0.2, carbs: 9.0, fiber: 0.9, calcium: 24, iron: 0.6, vitaminC: 8 },
    '豆角': { calories: 30, protein: 2.5, fat: 0.2, carbs: 5.4, fiber: 2.1, calcium: 42, iron: 1.5, vitaminC: 18 },
    
    // 豆制品
    '豆腐': { calories: 81, protein: 8.1, fat: 3.7, carbs: 4.2, fiber: 0.4, calcium: 164, iron: 1.9, vitaminC: 0 },
    '豆浆': { calories: 31, protein: 1.8, fat: 1.1, carbs: 3.0, fiber: 0, calcium: 10, iron: 0.5, vitaminC: 0 },
    '豆腐干': { calories: 140, protein: 16.2, fat: 3.6, carbs: 11.5, fiber: 0.3, calcium: 308, iron: 4.9, vitaminC: 0 },
    
    // 调料类
    '食用油': { calories: 899, protein: 0, fat: 99.9, carbs: 0, fiber: 0, calcium: 0, iron: 0, vitaminC: 0 },
    '盐': { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, calcium: 22, iron: 1.0, vitaminC: 0 },
    '酱油': { calories: 63, protein: 5.6, fat: 0.1, carbs: 9.9, fiber: 0, calcium: 66, iron: 8.6, vitaminC: 0 },
    '醋': { calories: 31, protein: 0.3, fat: 0.1, carbs: 4.9, fiber: 0, calcium: 17, iron: 6.0, vitaminC: 0 },
    '糖': { calories: 400, protein: 0, fat: 0, carbs: 100, fiber: 0, calcium: 20, iron: 0.6, vitaminC: 0 },
    
    // 其他
    '花生': { calories: 563, protein: 24.8, fat: 44.3, carbs: 21.7, fiber: 6.3, calcium: 39, iron: 2.1, vitaminC: 2 },
    '蘑菇': { calories: 20, protein: 2.7, fat: 0.1, carbs: 4.1, fiber: 2.1, calcium: 2, iron: 0.5, vitaminC: 2 },
    '木耳': { calories: 21, protein: 1.5, fat: 0.2, carbs: 6.0, fiber: 2.6, calcium: 34, iron: 5.5, vitaminC: 1 },
    '海带': { calories: 12, protein: 1.1, fat: 0.1, carbs: 2.1, fiber: 0.5, calcium: 46, iron: 0.9, vitaminC: 0 },
};

// 获取食材的营养成分（每100g）
function getNutrition(ingredientName) {
    // 尝试精确匹配
    if (NUTRITION_DB[ingredientName]) {
        return NUTRITION_DB[ingredientName];
    }
    
    // 尝试模糊匹配（包含关键词）
    const lowerName = ingredientName.toLowerCase();
    for (const key in NUTRITION_DB) {
        if (key.includes(ingredientName) || ingredientName.includes(key)) {
            return NUTRITION_DB[key];
        }
    }
    
    // 如果找不到，返回默认值（平均值）
    return {
        calories: 100,
        protein: 5,
        fat: 3,
        carbs: 15,
        fiber: 1,
        calcium: 20,
        iron: 1,
        vitaminC: 10
    };
}

// 根据重量计算营养成分
function calculateNutrition(ingredientName, weight) {
    const nutrition = getNutrition(ingredientName);
    const multiplier = weight / 100; // 转换为100g的倍数
    
    return {
        calories: Math.round(nutrition.calories * multiplier * 10) / 10,
        protein: Math.round(nutrition.protein * multiplier * 10) / 10,
        fat: Math.round(nutrition.fat * multiplier * 10) / 10,
        carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
        fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
        calcium: Math.round(nutrition.calcium * multiplier * 10) / 10,
        iron: Math.round(nutrition.iron * multiplier * 10) / 10,
        vitaminC: Math.round(nutrition.vitaminC * multiplier * 10) / 10
    };
}

// 合并多个营养成分
function mergeNutrition(nutritionList) {
    const total = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        calcium: 0,
        iron: 0,
        vitaminC: 0
    };
    
    nutritionList.forEach(nutrition => {
        total.calories += nutrition.calories || 0;
        total.protein += nutrition.protein || 0;
        total.fat += nutrition.fat || 0;
        total.carbs += nutrition.carbs || 0;
        total.fiber += nutrition.fiber || 0;
        total.calcium += nutrition.calcium || 0;
        total.iron += nutrition.iron || 0;
        total.vitaminC += nutrition.vitaminC || 0;
    });
    
    // 保留一位小数
    Object.keys(total).forEach(key => {
        total[key] = Math.round(total[key] * 10) / 10;
    });
    
    return total;
}

// 获取推荐的每日营养需求（成人）
function getDailyNutritionNeeds() {
    return {
        calories: 2000,      // 卡路里（kcal）
        protein: 60,         // 蛋白质（g）
        fat: 65,             // 脂肪（g）
        carbs: 300,          // 碳水化合物（g）
        fiber: 25,           // 膳食纤维（g）
        calcium: 800,        // 钙（mg）
        iron: 15,            // 铁（mg）
        vitaminC: 100        // 维生素C（mg）
    };
}
