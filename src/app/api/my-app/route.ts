import { NextRequest, NextResponse } from 'next/server';
import { createMetadata, Metadata, ValidatedMetadata } from '@sherrylinks/sdk';

export async function GET(req: NextRequest) {
    try {
        // Get server base URL
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        
        //construct the base url
        const serverUrl = `${protocol}://${host}`;

        const metadata: Metadata = {
            url: "https://sherry.social", // Your main website URL
            icon: "hhttps://drive.google.com/file/d/1S-S6BzeV52cMsWuR6JAOTkKxHRlYuM9K", // Your app icon URL
            title: "Timestamped Message", // Title that will appear on platforms
            baseUrl: serverUrl, // Base URL where your app is hosted
            description: "Store a message with an optimized timestamp calculated by our algorithm",
            
            // define actions that can be done by users
            actions: [
                {
                    type: 'dynamic', // Action type (always "dynamic" for mini apps)
                    label: 'Store Message', // Text that will appear on the button
                    description: 'Store your message with a custom timestamp calculated for optimal storage',
                    chains: {
                        source: 'fuji', // Blockchain where it will execute (fuji = Avalanche Fuji Testnet)
                    },
                    path: `/api/my-app`, // Path of the POST endpoint that will handle execution

                    params: [
                        {
                            name: 'message', // Parameter name (will be used as query param)
                            label: 'Your Message', // Label that the user will see
                            type: 'text', // Input type (text, number, email, etc.)
                            required: true, // Whether it's mandatory or not
                            description: 'Enter the message you want to store on the blockchain',
                        },
                        {
                            name: 'amount',
                            label: 'Amount (ETH)',
                            type: 'number',
                            required: false,
                            description: 'Amount in ETH (optional)',
                        },
                    ],
                },
            ]
        };
        // Validate metadata using SDK
        const validated: ValidatedMetadata = createMetadata(metadata);

        // Return with CORS headers
        return NextResponse.json(validated, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        });
        } catch (error) {
    console.error('Error creating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to create metadata' },
      {
        status: 500,
      },
    );
  }
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept',
    },
  });
}