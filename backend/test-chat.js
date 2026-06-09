async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "5 products under 3000" })
    });
    const data = await res.json();
    console.log('API response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('API Error:', err);
  }
}
run();
