import 'dotenv/config';
import { TokenService } from '../services/token.service';
import * as assert from 'assert';

async function runTests() {
  console.log('Starting Token Counter Unit Tests...');

  try {
    await assert.rejects(
      async () => {
        await TokenService.generateToken('');
      },
      /Active Business Day ID is required to generate order tokens/
    );
    console.log('✓ Test 1: Empty BusinessDay validation passed');
  } catch (error) {
    console.error('✗ Test 1 failed', error);
    process.exit(1);
  }

  console.log('Token unit tests passed successfully!');
}

runTests();
