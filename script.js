let token = '';
let currentRole = '';

function showRegister() {
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('registerDiv').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('registerDiv').classList.add('hidden');
  document.getElementById('loginDiv').classList.remove('hidden');
}

// Logout
function logout() {
  token = '';
  currentRole = '';
  document.getElementById('lecturerDiv').classList.add('hidden');
  document.getElementById('supervisorDiv').classList.add('hidden');
  showLogin();
}

// LOGIN
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
  }
}

// REGISTER
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

// Dummy functions to load classes (to be connected to backend)
function loadLecturerClasses() {
  console.log('Load lecturer classes using token:', token);
}

function loadLecturersForSupervisor() {
  console.log('Load all lecturers for supervisor using token:', token);
}
