const API_URL = import.meta.env.VITE_MONGODB_API_URL;
const API_KEY = import.meta.env.VITE_MONGODB_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'api-key': API_KEY,
};

export async function findDocuments(collection: string, filter = {}) {
  const response = await fetch(`${API_URL}/action/find`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection,
      database: 'wallet_warden',
      dataSource: 'Cluster0',
      filter,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  const data = await response.json();
  return data.documents;
}

export async function insertDocument(collection: string, document: any) {
  const response = await fetch(`${API_URL}/action/insertOne`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection,
      database: 'wallet_warden',
      dataSource: 'Cluster0',
      document,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to insert document');
  }

  return response.json();
}

export async function updateDocument(collection: string, filter: any, update: any) {
  const response = await fetch(`${API_URL}/action/updateOne`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection,
      database: 'wallet_warden',
      dataSource: 'Cluster0',
      filter,
      update: { $set: update },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update document');
  }

  return response.json();
}

export async function deleteDocument(collection: string, filter: any) {
  const response = await fetch(`${API_URL}/action/deleteOne`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection,
      database: 'wallet_warden',
      dataSource: 'Cluster0',
      filter,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return response.json();
}