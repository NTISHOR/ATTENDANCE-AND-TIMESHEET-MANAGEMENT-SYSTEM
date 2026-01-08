const API_BASE = 'http://localhost:5000/api';
let token = '';
let userRole = '';

// ---------- SHOW LOGIN / REGISTER ----------
function showLogin() {
  document.getElementById('loginDiv').classList.remove('hidden');
  document.getElementById('registerDiv').classList.add('hidden');
}
function showRegister() {
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('registerDiv').classList.remove('hidden');
}

// ---------- LOGIN FUNCTION ----------
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  userRole = role;

  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Login failed');
    token = data.token;
    if (role === 'lecturer') showLecturerDashboard();
    else showSupervisorDashboard();
  } catch(e) {
    alert(e.message);
  }
}

// ---------- REGISTER FUNCTION ----------
async function register() {
  const name = document.getElementById('reg_name').value;
  const email = document.getElementById('reg_email').value;
  const password = document.getElementById('reg_password').value;
  const department = document.getElementById('reg_department').value;
  const role = document.getElementById('reg_role').value;

  try {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, department, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Registration failed');
    alert('Account created! Please login.');
    showLogin();
  } catch(e) {
    alert(e.message);
  }
}

// ---------- LOGOUT ----------
function logout() {
  token = '';
  userRole = '';
  document.getElementById('loginDiv').classList.remove('hidden');
  document.getElementById('lecturerDiv').classList.add('hidden');
  document.getElementById('supervisorDiv').classList.add('hidden');
}

// ---------- LECTURER DASHBOARD ----------
async function showLecturerDashboard() {
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('registerDiv').classList.add('hidden');
  document.getElementById('lecturerDiv').classList.remove('hidden');

  const res = await fetch(API_BASE + '/lecturer/today-classes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const classes = await res.json();

  const tbody = document.getElementById('lecturerTable').querySelector('tbody');
  tbody.innerHTML = '';
  classes.forEach(cls => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cls.course_name}</td>
      <td><input type="time" id="start_${cls.class_id}"></td>
      <td><input type="time" id="end_${cls.class_id}"></td>
      <td><input type="text" id="notes_${cls.class_id}"></td>
      <td><button onclick="submitClass(${cls.class_id})">Submit</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function submitClass(classId) {
  const start = document.getElementById(`start_${classId}`).value;
  const end = document.getElementById(`end_${classId}`).value;
  const notes = document.getElementById(`notes_${classId}`).value;
  try {
    await fetch(API_BASE + '/lecturer/class-record', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token 
      },
      body: JSON.stringify({ class_id: classId, actual_start: start, actual_end: end, notes })
    });
    alert('Class record submitted!');
  } catch(e) {
    alert('Failed to submit');
  }
}

// ---------- SUPERVISOR DASHBOARD ----------
async function showSupervisorDashboard() {
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('registerDiv').classList.add('hidden');
  document.getElementById('supervisorDiv').classList.remove('hidden');

  const res = await fetch(API_BASE + '/supervisor/lecturers', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const lecturers = await res.json();

  const select = document.getElementById('lecturerSelect');
  select.innerHTML = '';
  lecturers.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.lecturer_id;
    opt.textContent = l.name;
    select.appendChild(opt);
  });

  loadClassRecords();
}

async function loadClassRecords() {
  const lecturerId = document.getElementById('lecturerSelect').value;
  const res = await fetch(`${API_BASE}/supervisor/class-records/${lecturerId}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const records = await res.json();

  const tbody = document.getElementById('supervisorTable').querySelector('tbody');
  tbody.innerHTML = '';
  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.course_name}</td>
      <td>${r.date}</td>
      <td>${r.actual_start}</td>
      <td>${r.actual_end}</td>
      <td>${r.notes}</td>
      <td>${r.status}</td>
      <td>
        ${r.status === 'pending' ? 
          `<button onclick="approveRecord(${r.record_id})">Approve</button>
           <button onclick="rejectRecord(${r.record_id})">Reject</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveRecord(recordId) {
  const remarks = prompt('Add remarks for approval:');
  await fetch(API_BASE + '/supervisor/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ record_id: recordId, status: 'approved', remarks })
  });
  loadClassRecords();
}

async function rejectRecord(recordId) {
  const remarks = prompt('Add remarks for rejection:');
  await fetch(API_BASE + '/supervisor/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ record_id: recordId, status: 'rejected', remarks })
  });
  loadClassRecords();
}