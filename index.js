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
    document.getElementById('room1_current').value = data.room1_current || '';
    document.getElementById('room2_current').value = data.room2_current || '';
    document.getElementById('room3_current').value = data.room3_current || '';
    document.getElementById('room4_current').value = data.room4_current || '';
    document.getElementById('room5_current').value = data.room5_current || '';

    document.getElementById('room1_last').value = data.room1_last || '';
    document.getElementById('room2_last').value = data.room2_last || '';
    document.getElementById('room3_last').value = data.room3_last || '';
    document.getElementById('room4_last').value = data.room4_last || '';
    document.getElementById('room5_last').value = data.room5_last || '';

      previousReadings = data.previousReadings || previousReadings;
      history = data.history || [];
        updateHistoryList(); // 重新載入歷史紀錄
  }
}
// 計算電費並更新紀錄
function calculateElectricity() {
    // 取得本期總用電量與總電費
    let totalConsumption = parseFloat(document.getElementById("totalConsumption").value);
    let totalFee = parseFloat(document.getElementById("totalFee").value);
     const pricePerKWh = (totalFee / totalConsumption).toFixed(2); // 單價

    // 驗證總用電量和總電費是否有效
    if (isNaN(totalConsumption) || isNaN(totalFee) || totalConsumption <= 0 || totalFee <= 0) {
        alert("請輸入有效的總用電量與總電費！");
        return;
    }

    // 取得每間房間的當期和上期電表數
    let room1_current = parseFloat(document.getElementById("room1_current").value);
    let room2_current = parseFloat(document.getElementById("room2_current").value);
    let room3_current = parseFloat(document.getElementById("room3_current").value);
    let room4_current = parseFloat(document.getElementById("room4_current").value);
    let room5_current = parseFloat(document.getElementById("room5_current").value);

    let room1_last = parseFloat(document.getElementById("room1_last").value); // 使用上期電表數
    let room2_last = parseFloat(document.getElementById("room2_last").value);
    let room3_last = parseFloat(document.getElementById("room3_last").value);
    let room4_last = parseFloat(document.getElementById("room4_last").value);
    let room5_last = parseFloat(document.getElementById("room5_last").value);

    // 驗證當期電表數是否有效
    if (isNaN(room1_current) || isNaN(room2_current) || isNaN(room3_current) || isNaN(room4_current) || isNaN(room5_current)) {
        alert("請輸入所有房間的當期電表數！");
        return;
    }

    // 計算每間房間的用電量
    let room1_usage = room1_current - room1_last;
    let room2_usage = room2_current - room2_last;
    let room3_usage = room3_current - room3_last;
    let room4_usage = room4_current - room4_last;
    let room5_usage = room5_current - room5_last;
    let totalRoomUsage = room1_usage + room2_usage + room3_usage + room4_usage + room5_usage;

    // 顯示每間房間的本期用電量
    const roomUsages = [
        { id: "room1_usage", value: room1_usage },
        { id: "room2_usage", value: room2_usage },
        { id: "room3_usage", value: room3_usage },
        { id: "room4_usage", value: room4_usage },
        { id: "room5_usage", value: room5_usage }
    ];

    roomUsages.forEach(room => {
        document.getElementById(room.id).value = Math.round(room.value);
    });


    // 計算每間房間的電費
    let room1_fee = (room1_usage * pricePerKWh);
    let room2_fee = (room2_usage * pricePerKWh);
    let room3_fee = (room3_usage * pricePerKWh);
    let room4_fee = (room4_usage * pricePerKWh);
    let room5_fee = (room5_usage * pricePerKWh);

    // 計算總電費（不包含房間用電）
    let totalCommonFee = Math.round((totalConsumption - totalRoomUsage) / 8 * pricePerKWh);
    // 每個人應繳費用的計算（修改後的人名）
    let personFees = {
        "江昀倩": Math.round((room1_fee / 2) + totalCommonFee),
        "陳亭蓁": Math.round((room1_fee / 2) + totalCommonFee),
        "吳宜蓁": Math.round((room2_fee / 2) + totalCommonFee),
        "黃幸妤": Math.round((room2_fee / 2) + totalCommonFee),
        "廖韋涵": Math.round(room3_fee + totalCommonFee),
        "江羽婷": Math.round((room4_fee / 2) + totalCommonFee),
        "羅香茹": Math.round((room4_fee / 2) + totalCommonFee),
        "顏妏軒": Math.round(room5_fee + totalCommonFee)
    };

    // 計算總電費(每個人加總)
    // 使用 Object.values() 方法將 personFees 物件的值轉換為陣列
    // 再使用 reduce() 方法將陣列中的每個元素加總
    let calculatedTotalFee = Object.values(personFees).reduce((sum, fee) => sum + fee, 0);
    
    // 確保實際總費用不低於帳單費用
    const actualTotalFee = Math.max(calculatedTotalFee, totalFee);

    // 更新上期電表數
    previousReadings.room1 = room1_current;
    previousReadings.room2 = room2_current;
    previousReadings.room3 = room3_current;
    previousReadings.room4 = room4_current;
    previousReadings.room5 = room5_current;

    // 更新歷史紀錄
    let historyItem = {
        totalConsumption: totalConsumption,
        totalFee: actualTotalFee, // 使用計算出的總電費
        personFees: personFees,
        time: new Date().toLocaleString(),
        previousReadings: {...previousReadings} // 儲存上期電表數
    };
    history.push(historyItem);
    // 儲存資料到 localStorage
    saveData(totalConsumption,totalFee,room1_current,room2_current,room3_current,room4_current,room5_current,room1_last,room2_last,room3_last,room4_last,room5_last,previousReadings,history);
    // 顯示結果
    updateFeeList(personFees, actualTotalFee, totalConsumption);
    updateHistoryList();

    // 更新上期電表數的顯示，下次計算時使用
    document.getElementById("room1_last").value = room1_current;
    document.getElementById("room2_last").value = room2_current;
    document.getElementById("room3_last").value = room3_current;
    document.getElementById("room4_last").value = room4_current;
    document.getElementById("room5_last").value = room5_current;
}
// 將資料儲存到 localStorage
function saveData(totalConsumption, totalFee,room1_current,room2_current,room3_current,room4_current,room5_current,room1_last,room2_last,room3_last,room4_last,room5_last,previousReadings,history) {
  const data = {
      totalConsumption: totalConsumption,
    totalFee: totalFee,
      room1_current: room1_current,
    room2_current: room2_current,
    room3_current: room3_current,
    room4_current: room4_current,
    room5_current: room5_current,
    room1_last: room1_last,
    room2_last: room2_last,
    room3_last: room3_last,
    room4_last: room4_last,
     room5_last: room5_last,
    previousReadings: previousReadings,
      history: history
  };
  localStorage.setItem('electricityData', JSON.stringify(data));
}
// 更新結果顯示
function updateFeeList(personFees, totalFee, totalConsumption) {
    // 生成顯示用的列表項
    let feeList = document.getElementById("feeList");
    feeList.innerHTML = '';

    // 確保按照人名順序顯示
    const orderedPeople = [
         "江昀倩","陳亭蓁",
        "吳宜蓁","黃幸妤",
        "廖韋涵",
        "江羽婷","羅香茹",
        "顏妏軒"
    ];

    let totalIndividualFee = 0;

    // 顯示每個人的繳費資訊
    for (const person of orderedPeople) {
        if (personFees[person]) {
            feeList.innerHTML += `
                <p>${person}: ${personFees[person]} 元</p>
            `;
            totalIndividualFee += personFees[person];
        }
    }

    // 顯示總金額
    feeList.innerHTML += `
        <p>每人應繳費用總和: ${totalIndividualFee} 元</p>
    `;

    // 顯示總費用和總用電量
    let totalResult = document.getElementById("totalResult");
    totalResult.innerHTML = `
        <p>總費用: ${totalFee.toFixed(2)} 元</p>
        <p>總用電量: ${totalConsumption.toFixed(2)} kWh</p>
    `;
}

// 更新歷史紀錄顯示
function updateHistoryList() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = ""; // 清空歷史紀錄列表

    history.forEach((item, index) => {
        let historyItemHTML = `
            <li>
                <strong>時間:</strong> ${item.time}<br>
                <strong>總用電量:</strong> ${item.totalConsumption.toFixed(2)} kWh, 
                <strong>總電費:</strong> ${item.totalFee.toFixed(2)} 元<br>
                <strong>每人應繳費用:</strong><br>
                 <ul>
                    <li>江昀倩: ${item.personFees["江昀倩"]} 元</li>
                    <li>陳亭蓁: ${item.personFees["陳亭蓁"]} 元</li>
                    <li>吳宜蓁: ${item.personFees["吳宜蓁"]} 元</li>
                    <li>黃幸妤: ${item.personFees["黃幸妤"]} 元</li>
                    <li>廖韋涵: ${item.personFees["廖韋涵"]} 元</li>
                    <li>江羽婷: ${item.personFees["江羽婷"]} 元</li>
                    <li>羅香茹: ${item.personFees["羅香茹"]} 元</li>
                    <li>顏妏軒: ${item.personFees["顏妏軒"]} 元</li>
                </ul>
            </li>
        `;
        historyList.innerHTML += historyItemHTML;
    });
}