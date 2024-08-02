const checkInBtn = document.getElementById('checkIn');
const checkOutBtn = document.getElementById('checkOut');
const message = document.getElementById('message');
const recordTable = document.getElementById('recordTable').getElementsByTagName('tbody')[0];
const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const currentUserElement = document.getElementById('currentUser');

let currentUser = '';
let records = {};

function login() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        currentUser = username;
        records[currentUser] = JSON.parse(localStorage.getItem(`swimmingRecords_${currentUser}`)) || [];
        loginSection.style.display = 'none'; // 隐藏登录区域
        mainSection.style.display = 'block'; // 显示签到签退区域
        currentUserElement.textContent = `当前用户: ${currentUser}`;
        updateTable(); // 更新表格
    } else {
        alert('请输入用户名');
    }
}

function updateTable() {
    recordTable.innerHTML = ''; // 清空表格
    records[currentUser].forEach(record => {
        const row = recordTable.insertRow(-1);
        row.insertCell(0).textContent = record.checkIn;
        row.insertCell(1).textContent = record.checkOut || '未签退';
        row.insertCell(2).textContent = record.duration || '未计算';
    });
}

function saveRecords() {
    localStorage.setItem(`swimmingRecords_${currentUser}`, JSON.stringify(records[currentUser]));
}

function calculateDuration(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.round((end - start) / 60000); // 转换为分钟
}

function checkOvertime(duration) {
    if (duration > 120) {
        return "您已超时，请在小程序上补票15元";
    } else if (duration > 100) {
        return "您已超时，请在小程序上补票10元";
    } else if (duration > 80) {
        return "您已超时，请在小程序上补票5元";
    }
    return "";
}

checkInBtn.addEventListener('click', () => {
    const now = new Date().toLocaleString();
    records[currentUser].push({ checkIn: now });
    saveRecords();
    updateTable();
    message.textContent = '✅ 签到成功';
    message.style.backgroundColor = '#e6ffe6';
    message.style.color = '#4CAF50';
});

checkOutBtn.addEventListener('click', () => {
    if (records[currentUser].length === 0 || records[currentUser][records[currentUser].length - 1].checkOut) {
        message.textContent = '❗ 请先签到';
        message.style.backgroundColor = '#ffe6e6';
        message.style.color = '#F44336';
        return;
    }
    const now = new Date().toLocaleString();
    records[currentUser][records[currentUser].length - 1].checkOut = now;
    const duration = calculateDuration(records[currentUser][records[currentUser].length - 1].checkIn, now);
    records[currentUser][records[currentUser].length - 1].duration = duration + ' 分钟';
    saveRecords();
    updateTable();
    const overtimeMessage = checkOvertime(duration);
    message.textContent = overtimeMessage ? `⚠️ ${overtimeMessage}` : '✅ 签退成功';
    message.style.backgroundColor = overtimeMessage ? '#fff3e0' : '#e6ffe6';
    message.style.color = overtimeMessage ? '#FF9800' : '#4CAF50';
});