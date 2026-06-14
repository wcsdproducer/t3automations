// Simulate a call to POST /api/check-domain-status
const { POST } = require('../src/app/api/check-domain-status/route');

// Mock request/response objects
class MockRequest {
  constructor(body) {
    this.bodyData = body;
  }
  async json() {
    return this.bodyData;
  }
}

async function runTest() {
  console.log("Simulating POST /api/check-domain-status for tampaconcretepaving.com...");
  
  // Mock NextRequest using standard node objects if necessary, but since our POST only calls req.json(),
  // passing a simple object with a json method is sufficient.
  const req = new MockRequest({
    domain: 'tampaconcretepaving.com',
    userId: 'jjIga7v1wyWPKCrYHDw0X8m7Rrx2'
  });

  const res = await POST(req);
  const data = await res.json();
  
  console.log("API HTTP Response Status:", res.status);
  console.log("API Response Data:", JSON.stringify(data, null, 2));
}

// We need to set env variables since it runs outside Next.js config
process.env.NODE_ENV = 'development';
runTest().catch(console.error);
