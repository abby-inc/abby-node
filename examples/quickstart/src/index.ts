/**
 * Abby SDK Quickstart Example
 *
 * This example demonstrates basic usage of the Abby Node.js SDK:
 * - Initializing the client with an API key
 * - Fetching company information
 * - Listing contacts with pagination
 * - Basic error handling
 *
 * Run with: npm start
 */

import Abby from '@abby-inc/abby';

// Get API key from environment variable
const apiKey = process.env.ABBY_API_KEY;

if (!apiKey) {
  console.error('Error: ABBY_API_KEY environment variable is required.');
  console.error('');
  console.error('Get your API key from: https://app.abby.fr/settings/integrations');
  console.error('Then run: ABBY_API_KEY=your_key npm start');
  process.exit(1);
}

// Initialize the Abby client
const abby = new Abby(apiKey);

async function main() {
  console.log('Abby SDK Quickstart Example');
  console.log('===========================\n');

  // 1. Get current company information
  console.log('1. Fetching company information...');
  try {
    // With throwOnError enabled, data is guaranteed to be defined on success
    const { data: me } = await abby.company.getMe({});
    console.log(`   Company: ${me!.company.commercialName || '(not set)'}`);
    console.log(`   User: ${me!.user.firstname} ${me!.user.lastname}`);
    console.log(`   Email: ${me!.user.email}\n`);
  } catch (error) {
    handleError('Failed to fetch company info', error);
    return;
  }

  // 2. List contacts
  console.log('2. Listing contacts (first 5)...');
  try {
    const { data: contacts } = await abby.contact.retrieveContacts({
      query: { page: 1, limit: 5, archived: false },
    });

    if (contacts!.docs.length === 0) {
      console.log('   No contacts found.\n');
    } else {
      contacts!.docs.forEach((contact, index) => {
        const email = contact.emails?.[0] || 'no email';
        console.log(`   ${index + 1}. ${contact.fullname} (${email})`);
      });
      console.log(`   ... and ${contacts!.totalDocs - contacts!.docs.length} more\n`);
    }
  } catch (error) {
    handleError('Failed to list contacts', error);
  }

  console.log('Done! Check out the SDK documentation for more features.');
}

/**
 * Handle and display errors in a user-friendly way.
 */
function handleError(message: string, error: unknown): void {
  console.error(`   Error: ${message}`);

  // Handle hey-api client errors (have status property)
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Check for HTTP status code (status or statusCode)
    const status = err.status ?? err.statusCode;
    if (typeof status === 'number') {
      switch (status) {
        case 401:
          console.error('   Invalid API key. Check your ABBY_API_KEY.');
          break;
        case 403:
          console.error('   Access denied. Your API key may lack permissions.');
          break;
        case 404:
          console.error('   Resource not found.');
          break;
        case 429:
          console.error('   Rate limited. Please wait and try again.');
          break;
        default:
          console.error(`   HTTP ${status}`);
      }
      return;
    }

    // Check for error message in body
    if ('message' in err) {
      console.error(`   ${err.message}`);
      return;
    }

    // Fallback: stringify the error object
    console.error(`   ${JSON.stringify(err, null, 2)}`);
  }
}

// Run the example
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
