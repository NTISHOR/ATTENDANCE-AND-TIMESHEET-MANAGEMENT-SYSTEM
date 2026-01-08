let token = '';
let currentRole = '';
let selectedLecturerId = null;

// ======================
// UI Helpers
// ======================
function showRegister() {
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('registerDiv').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('registerDiv').classList.add('hidden');
  document.getElementById('loginDiv').classList.remove('hidden');
}

function logout() {
  token = '';
  currentRole = '';
  selectedLecturerId = null;
  document.getElementById('lecturerDiv').classList.add('hidden');
  document.getElementById('supervisorDiv').classList.add('hidden');
  document.getElementById('monthlyReportDiv').classList.add('hidden');
  showLogin();
}

// ======================
// AUTH: Login & Register
// ======================
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();

    if (data.token) {
      token = data.token;
      currentRole = role;
      if (role === 'lecturer') {
        document.getElementById('loginDiv').classList.add('hidden');
        document.getElementById('lecturerDiv').classList.remove('hidden');
        loadLecturerClasses();
      } else {
        document.getElementById('loginDiv').classList.add('hidden');
        document.getElementById('supervisorDiv').classList.remove('hidden');
        loadLecturersForSupervisor();
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Login failed');
  }
}

async function register() {
  const name = document.getElementById('reg_name').value;
  const email = document.getElementById('reg_email').value;
  const password = document.getElementById('reg_password').value;
  const department = document.getElementById('reg_department').value;
  const role = document.getElementById('reg_role').value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, department, role })
    });
    const data = await res.json();
    alert(data.message);
    showLogin();
  } catch (err) {
    console.error(err);
  }
}

// ======================
// LECTURER DASHBOARD
// ======================
async function loadLecturerClasses() {
  try {
    const res = await fetch('http://localhost:5000/api/lecturer/today-classes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const classes = await res.json();

    const tbody = document.querySelector('#lecturerTable tbody');
    tbody.innerHTML = '';

    classes.forEach(cls => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${cls.course_name}</td>
        <td><input type="time" id="start_${cls.class_id}"></td>
        <td><input type="time" id="end_${cls.class_id}"></td>
        <td><input type="text" id="notes_${cls.class_id}" placeholder="Notes"></td>
        <td><button onclick="submitClass(${cls.class_id})">Submit</button></td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function submitClass(classId) {
  const start = document.getElementById(`start_${classId}`).value;
  const end = document.getElementById(`end_${classId}`).value;
  const notes = document.getElementById(`notes_${classId}`).value;

  try {
    const res = await fetch('http://localhost:5000/api/lecturer/class-record', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ class_id: classId, actual_start: start, actual_end: end, notes })
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
  }
}

// ======================
// SUPERVISOR DASHBOARD
// ======================
async function loadLecturersForSupervisor() {
  try {
    const res = await fetch('http://localhost:5000/api/supervisor/lecturers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const lecturers = await res.json();

    const select = document.getElementById('lecturerSelect');
    select.innerHTML = '<option value="">Select Lecturer</option>';
    lecturers.forEach(l => {
      const option = document.createElement('option');
      option.value = l.lecturer_id;
      option.text = l.name;
      select.add(option);
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadClassRecords() {
  selectedLecturerId = document.getElementById('lecturerSelect').value;
  if (!selectedLecturerId) return;

  try {
    const res = await fetch(`http://localhost:5000/api/supervisor/class-records/${selectedLecturerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const records = await res.json();

    const tbody = document.querySelector('#supervisorTable tbody');
    tbody.innerHTML = '';

    records.forEach(rec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.course_name}</td>
        <td>${rec.date}</td>
        <td>${rec.actual_start}</td>
        <td>${rec.actual_end}</td>
        <td>${rec.notes}</td>
        <td>${rec.status}</td>
        <td>
          ${rec.status === 'pending' ? `
            <button onclick="approveRecord(${rec.record_id})">Approve</button>
            <button onclick="rejectRecord(${rec.record_id})">Reject</button>
          ` : rec.remarks || ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function approveRecord(recordId) {
  await updateRecordStatus(recordId, 'approved', '');
}

async function rejectRecord(recordId) {
  const remarks = prompt('Enter remarks for rejection:');
  if (!remarks) return;
  await updateRecordStatus(recordId, 'rejected', remarks);
}

async function updateRecordStatus(recordId, status, remarks) {
  try {
    const res = await fetch('http://localhost:5000/api/supervisor/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ record_id: recordId, status, remarks })
    });
    const data = await res.json();
    alert(data.message);
    loadClassRecords();
  } catch (err) {
    console.error(err);
  }
}

// ======================
// MONTHLY REPORT
// ======================
async function showMonthlyReport() {
  try {
    const res = await fetch(`http://localhost:5000/api/supervisor/monthly-report/${selectedLecturerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const records = await res.json();

    const tbody = document.querySelector('#monthlyReportTable tbody');
    tbody.innerHTML = '';

    records.forEach(rec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.course_name}</td>
        <td>${rec.date}</td>
        <td>${rec.actual_start}</td>
        <td>${rec.actual_end}</td>
        <td>${rec.notes}</td>
        <td>${rec.status}</td>
        <td>${rec.remarks || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('monthlyReportDiv').classList.remove('hidden');
  } catch (err) {
    console.error(err);
  }
}

function hideMonthlyReport() {
  document.getElementById('monthlyReportDiv').classList.add('hidden');
}

function printReport() {
  const printContent = document.getElementById('monthlyReportDiv').innerHTML;
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
}
