// 定義 current 和 last 陣列
var data_current = [4673.6, 1917.8, 2837.4, 84.5, 6101.8];  // 本期電表數 2a, 2b, 3a, 3b, 4
var data_last = [4673.6, 1917.7, 2835.1, 82.4, 6100.1];    // 上期電表數 2a, 2b, 3a, 3b, 4

// 更新表格中的值
function updateRoomData() {
    document.getElementById('room4_current').value = data_current[0];
    document.getElementById('room4_last').value = data_last[0];

    document.getElementById('room5_current').value = data_current[1];
    document.getElementById('room5_last').value = data_last[1];

    document.getElementById('room2_current').value = data_current[2];
    document.getElementById('room2_last').value = data_last[2];

    document.getElementById('room3_current').value = data_current[3];
    document.getElementById('room3_last').value = data_last[3];

    document.getElementById('room1_current').value = data_current[4];
    document.getElementById('room1_last').value = data_last[4];
}


// 儲存上期電表數的資料結構
let previousReadings = {
    room1: 0, // 江昀倩、陳亭蓁
    room2: 0, // 吳宜蓁、黃幸妤
    room3: 0, // 廖韋涵
    room4: 0, // 江羽婷、羅香茹
    room5: 0  // 顏妏軒
};

let history = []; // 儲存歷史紀錄

// 初始化頁面時，從 localStorage 載入資料
window.onload = function() {
    loadData();
    updateRoomData(); // 確保初始時數據能正確顯示

};

// 從 localStorage 讀取資料
function loadData() {
    const savedData = localStorage.getItem('electricityData');
    if (savedData) {
        const data = JSON.parse(savedData);

        // 載入總用電量、總電費
        document.getElementById('totalConsumption').value = data.totalConsumption || '';
        document.getElementById('totalFee').value = data.totalFee || '';

        // 載入房間電表數
        ['room1', 'room2', 'room3', 'room4', 'room5'].forEach(room => {
            document.getElementById(`${room}_current`).value = data[`${room}_current`] || '';
            document.getElementById(`${room}_last`).value = data[`${room}_last`] || '';
        });

        previousReadings = data.previousReadings || previousReadings;
        history = data.history || [];
        updateHistoryList(); // 重新載入歷史紀錄
    }
}

let totalConsumption = parseFloat(document.getElementById("totalConsumption").value);
let totalFee = parseFloat(document.getElementById("totalFee").value);
let totalWater = parseFloat(document.getElementById("totalwater").value);
let waterFee = Math.round(totalWater / 8);

function calculateElectricity() {
    // 驗證總用電量和總電費是否有效
    if (isNaN(totalConsumption) || isNaN(totalFee) || totalConsumption <= 0 || totalFee <= 0) {
        alert("請輸入有效的總用電量與總電費！");
        return;
    }

    // 取得每間房間的當期和上期電表數
    let roomReadings = ['room1', 'room2', 'room3', 'room4', 'room5'].reduce((acc, room) => {
        acc[room] = {
            current: parseFloat(document.getElementById(`${room}_current`).value),
            last: parseFloat(document.getElementById(`${room}_last`).value)
        };
        return acc;
    }, {});

    // 驗證當期電表數是否有效
    for (let room in roomReadings) {
        if (isNaN(roomReadings[room].current)) {
            alert(`請輸入${room}的當期電表數！`);
            return;
        }
    }

    // 計算每間房間的用電量
    let roomUsages = {};
    let totalRoomUsage = 0;
    for (let room in roomReadings) {
        let usage = roomReadings[room].current - roomReadings[room].last;
        roomUsages[room] = usage;
        totalRoomUsage += usage;
        document.getElementById(`${room}_usage`).value = Math.round(usage);
    }

    // 計算單價
    const pricePerKWh = (totalFee / totalConsumption).toFixed(2);

    // 計算每間房間的電費
    let roomFees = {};
    for (let room in roomUsages) {
        roomFees[room] = roomUsages[room] * pricePerKWh;
    }

    // 計算總電費（不包含房間用電）
    let totalCommonFee = Math.round((totalConsumption - totalRoomUsage) / 8 * pricePerKWh);

    // 每個人應繳費用的計算
    let personFees = {
        "江昀倩": Math.round((roomFees.room1 / 2) + totalCommonFee),
        "陳亭蓁": Math.round((roomFees.room1 / 2) + totalCommonFee),
        "吳宜蓁": Math.round((roomFees.room2 / 2) + totalCommonFee),
        "黃幸妤": Math.round((roomFees.room2 / 2) + totalCommonFee),
        "廖韋涵": Math.round(roomFees.room3 + totalCommonFee),
        "江羽婷": Math.round((roomFees.room4 / 2) + totalCommonFee),
        "羅香茹": Math.round((roomFees.room4 / 2) + totalCommonFee),
        "顏妏軒": Math.round(roomFees.room5 + totalCommonFee)
    };

    // 計算總電費(每個人加總)
    let calculatedTotalFee = Object.values(personFees).reduce((sum, fee) => sum + fee, 0);

    // 確保實際總費用不低於帳單費用
    const actualTotalFee = Math.max(calculatedTotalFee, totalFee);

    // 更新歷史紀錄
    let historyItem = {
        totalConsumption: totalConsumption,
        totalFee: actualTotalFee,
        personFees: personFees,
        time: new Date().toLocaleString(),
        previousReadings: {...previousReadings}
    };
    history.push(historyItem);

    // 儲存資料到 localStorage
    saveData();

    // 顯示結果
    updateFeeList(personFees, actualTotalFee, totalConsumption, waterFee);
    updateHistoryList();
}

// 儲存資料到 localStorage
function saveData() {
    const data = {
        totalConsumption,
        totalFee,
        totalWater,
        previousReadings,
        history
    };
    ['room1', 'room2', 'room3', 'room4', 'room5'].forEach(room => {
        data[`${room}_current`] = parseFloat(document.getElementById(`${room}_current`).value);
        data[`${room}_last`] = parseFloat(document.getElementById(`${room}_last`).value);
    });

    localStorage.setItem('electricityData', JSON.stringify(data));
}

// 更新結果顯示
function updateFeeList(personFees, totalFee, totalConsumption, waterFee) {
    let feeList = document.getElementById("feeList");
    feeList.innerHTML = '';

    const orderedPeople = [
        "江昀倩", "陳亭蓁", "吳宜蓁", "黃幸妤", "廖韋涵", "江羽婷", "羅香茹", "顏妏軒"
    ];

    let totalIndividualFee = 0;
    orderedPeople.forEach(person => {
        if (personFees[person]) {
            feeList.innerHTML += `
                <p>${person}: ${personFees[person]} 元 + 水費: ${waterFee} = ${personFees[person] + waterFee} 元</p>
            `;
            totalIndividualFee += personFees[person];
        }
    });

    feeList.innerHTML += `
        <p>每人應繳費用總和: ${totalIndividualFee} 元</p>
    `;

    let totalResult = document.getElementById("totalResult");
    totalResult.innerHTML = `
        <p>匯款人實際收到的總費用: ${totalIndividualFee + waterFee * 8} 元</p>
        <p>匯款人應收總費用: ${totalFee + totalWater} 元</p>
    `;
}

// 更新歷史紀錄顯示
function updateHistoryList() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    history.forEach((item) => {
        let historyItemHTML = `
            <li>
                <strong>時間:</strong> ${item.time}<br>
                <strong>總用電量:</strong> ${item.totalConsumption.toFixed(2)} kWh, 
                <strong>總電費:</strong> ${item.totalFee.toFixed(2)} 元<br>
                <strong>每人應繳費用:</strong><br>
                <ul>
                    ${Object.keys(item.personFees).map(person => `<li>${person}: ${item.personFees[person]} 元</li>`).join('')}
                </ul>
            </li>
        `;
        historyList.innerHTML += historyItemHTML;
    });
}
