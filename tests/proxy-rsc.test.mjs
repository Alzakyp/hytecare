import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRefreshSession } from '../src/lib/supabase/proxy-routing.js';

test('RSC navigation skips duplicate proxy auth refresh',()=>{
 assert.equal(shouldRefreshSession(new Headers({rsc:'1'})),false);
 assert.equal(shouldRefreshSession(new Headers({'next-router-prefetch':'1'})),false);
});
test('document and server action requests still refresh auth',()=>{
 assert.equal(shouldRefreshSession(new Headers()),true);
 assert.equal(shouldRefreshSession(new Headers({accept:'text/html'})),true);
 assert.equal(shouldRefreshSession(new Headers({'next-action':'action-id'})),true);
});
