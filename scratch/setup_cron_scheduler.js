const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const PROJECT_ID = 'studio-1410114603-9e1f6';
const LOCATION = 'us-central1';
const CRON_SECRET = process.env.CRON_SECRET || 't3_cron_secret_key_2026';

async function main() {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const accessToken = tokenRes.token;
  
  const baseUrl = `https://cloudscheduler.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}`;
  
  // 1. List existing scheduler jobs
  console.log('── Existing Cloud Scheduler Jobs ──');
  try {
    const listRes = await axios.get(`${baseUrl}/jobs`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const jobs = listRes.data.jobs || [];
    if (jobs.length === 0) {
      console.log('  No scheduler jobs found.');
    } else {
      for (const job of jobs) {
        console.log(`  • ${job.name} — schedule: "${job.schedule}" — state: ${job.state}`);
        if (job.httpTarget) {
          console.log(`    URL: ${job.httpTarget.uri}`);
        }
      }
    }
  } catch (err) {
    if (err.response?.status === 404) {
      console.log('  Cloud Scheduler API not enabled or no jobs exist.');
    } else {
      console.log(`  Error listing jobs: ${err.response?.data?.error?.message || err.message}`);
    }
  }
  
  // 2. Create the 3x-daily blog cron job if it doesn't exist
  const APP_URL = 'https://studio--studio-1410114603-9e1f6.us-central1.hosted.app';
  const cronUrl = `${APP_URL}/api/cron/generate-blogs?secret=${CRON_SECRET}`;
  
  // Schedule: 8am, 1pm, 6pm EST = 12:00, 17:00, 22:00 UTC
  const jobName = `${baseUrl}/jobs/t3-blog-generation-3x-daily`;
  const schedule = '0 12,17,22 * * *'; // UTC times matching 8am, 1pm, 6pm EST

  console.log('\n── Creating/Updating 3x-Daily Blog Cron ──');
  console.log(`  Schedule: ${schedule} (UTC = 8am/1pm/6pm EST)`);
  console.log(`  Target: ${cronUrl}`);
  
  try {
    // Try to create
    await axios.post(`${baseUrl}/jobs`, {
      name: jobName,
      schedule: schedule,
      timeZone: 'America/New_York',
      httpTarget: {
        uri: cronUrl,
        httpMethod: 'GET',
        headers: {
          'x-cron-secret': CRON_SECRET,
        },
      },
      retryConfig: {
        retryCount: 1,
        maxRetryDuration: '60s',
      },
    }, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });
    console.log('  ✅ Cron job created successfully!');
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('  ℹ️  Job already exists. Updating schedule...');
      // PATCH to update
      try {
        await axios.patch(`${jobName}`, {
          schedule: '0 8,13,18 * * *',
          timeZone: 'America/New_York',
          httpTarget: {
            uri: cronUrl,
            httpMethod: 'GET',
            headers: {
              'x-cron-secret': CRON_SECRET,
            },
          },
        }, {
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          params: { updateMask: 'schedule,timeZone,httpTarget' },
        });
        console.log('  ✅ Cron job updated successfully!');
      } catch (patchErr) {
        console.log(`  ❌ Update failed: ${patchErr.response?.data?.error?.message || patchErr.message}`);
      }
    } else {
      console.log(`  ❌ Creation failed: ${err.response?.data?.error?.message || err.message}`);
      console.log('  Full error:', JSON.stringify(err.response?.data, null, 2));
    }
  }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
