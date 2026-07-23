/**
 * Re-export the shared, interceptored axios instance.
 * Use `src/api/axios.ts` as the single source of truth.
 * This file exists for backwards compatibility with imports from 'lib/api'.
 */
export { api as default } from '../api/axios';
