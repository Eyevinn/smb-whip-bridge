#!/usr/bin/env -S npx ts-node

if (!process.env.SMB_URL) {
  throw new Error('SMB_URL environment variable is required');
}

const sfuUrl = new URL('/conferences/', process.env.SMB_URL);

async function getEndpoints(conferenceId: string) {
  const response = await fetch(
    new URL('/conferences/' + conferenceId, sfuUrl),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SMB_API_KEY
          ? { Authorization: `Bearer ${process.env.SMB_API_KEY}` }
          : {})
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
}

async function removeConference(conferenceId: string) {
  console.log('Deleting conference', conferenceId);
  const endpoints: any = await getEndpoints(conferenceId);
  for (const endpoint of endpoints) {
    console.log('Deleting endpoint', endpoint.id);
    await fetch(
      new URL(`/conferences/${conferenceId}/${endpoint.id}`, sfuUrl),
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.SMB_API_KEY
            ? { Authorization: `Bearer ${process.env.SMB_API_KEY}` }
            : {})
        }
      }
    );
  }
}

async function cleanUpDanglingConferences() {
  const response = await fetch(sfuUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SMB_API_KEY
        ? { Authorization: `Bearer ${process.env.SMB_API_KEY}` }
        : {})
    }
  });
  if (response.ok) {
    const conferences: any = await response.json();
    const failedConferences: string[] = [];
    for (const conferenceId of conferences) {
      const endpoints: any = await getEndpoints(conferenceId);
      if (
        endpoints.find((e: any) => e.id == 'ingest' && e.iceState == 'FAILED')
      ) {
        failedConferences.push(conferenceId);
      }
    }
    for (const conferenceId of failedConferences) {
      await removeConference(conferenceId);
    }
  }
}

cleanUpDanglingConferences();
