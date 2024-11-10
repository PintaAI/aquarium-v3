import { NextResponse } from 'next/server';

const API_KEY = process.env.KOREAN_DICT_API_KEY;
const API_URL = process.env.KOREAN_DICT_API_URL;

export async function GET(request: Request) {
  try {
    if (!API_KEY || !API_URL) {
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Get search parameters with defaults
    const q = searchParams.get('q');
    
    // Return error if no search query is provided
    if (!q) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Build search parameters
    const params = new URLSearchParams({
      key: API_KEY,
      q: q,
      start: '1',
      num: '10',
      sort: 'dict',
      part: 'word',
      translated: 'y',
      trans_lang: '9', // Indonesian
      advanced: 'n'
    });

    const apiUrl = `${API_URL}?${params.toString()}`;
    console.log('Requesting URL:', apiUrl); // Log the full URL being requested

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('API Response not OK:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.text();
    console.log('API Response:', data); // Log the response data
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error) {
    console.error('Korean dictionary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Korean dictionary API' },
      { status: 500 }
    );
  }
}
