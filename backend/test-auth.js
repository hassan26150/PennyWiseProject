async function run() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'techmart@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    console.log('Logged in, got token');
    
    const updateRes = await fetch('http://localhost:5000/api/auth/me', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        email: 'techmart@example.com',
        phone: '0300000000',
        profile: {
          store_name: 'TechMart PK',
          store_location: 'Lahore, Pakistan'
        }
      })
    });
    const updateData = await updateRes.json();
    console.log('Update success:', updateData);
  } catch (err) {
    console.error('Update failed:', err.response?.data || err.message);
  }
}
run();
