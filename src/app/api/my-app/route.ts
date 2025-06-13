import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { createMetadata, Metadata, ValidatedMetadata, ExecutionResponse } from '@sherrylinks/sdk';
import { serialize } from 'wagmi';
import { encodeFunctionData, TransactionSerializable } from 'viem';
import { abi } from '@/blockchain/abi';

const CONTRACT_ADDRESS = '0xA9Eaf8E76966b60e9aB63C74a42605E84adF9EcE';

export async function GET(req: NextRequest) {
    try {
        // Get server base URL
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        
        //construct the base url
        const serverUrl = `${protocol}://${host}`;

        const metadata: Metadata = {
            url: "https://sherry.social", // Your main website URL
            icon: "https://drive.google.com/uc?export=view&id=1S-S6BzeV52cMsWuR6JAOTkKxHRlYuM9K", // Your app icon URL
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

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const message = searchParams.get('message');

    if (!message) {
      return NextResponse.json(
        { error: 'Message parameter is required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      );
    }

    // Calculate optimized timestamp using custom algorithm
    const optimizedTimestamp = calculateOptimizedTimestamp(message);

    // Encode the contract function data
    const data = encodeFunctionData({
      abi: abi,
      functionName: 'storeMessage',
      args: [message, BigInt(optimizedTimestamp)],
    });

    // Create smart contract transaction
    const tx: TransactionSerializable = {
      to: CONTRACT_ADDRESS,
      data: data,
      chainId: avalancheFuji.id,
      type: 'legacy',
    };

    // Serialize transaction
    const serialized = serialize(tx);

    // Create response
    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };

    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Custom algorithm to calculate optimized timestamp based on message content
function calculateOptimizedTimestamp(message: string): number {
  // Get the current timestamp as a starting point
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Custom algorithm: Add character codes to create a unique offset
  // This is your unique business logic - you can make this as complex as needed
  let offset = 0;

  for (let i = 0; i < message.length; i++) {
    // Sum character codes and use position as a multiplier
    offset += message.charCodeAt(i) * (i + 1);
  }

  // Ensure offset is reasonable (1 hour max)
  const maxOffset = 3600;
  offset = offset % maxOffset;

  // Calculate final optimized timestamp
  return currentTimestamp + offset;
}

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
