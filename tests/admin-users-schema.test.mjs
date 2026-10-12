import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('supabase/migrations/202610120002_admin_users_and_dashboard.sql','utf8');
test('account status, audit, aggregate and protected role/status RPC',()=>{
 for(const part of ['create table if not exists public.account_status','create table if not exists public.admin_audit_log','admin_dashboard_counts','admin_update_user_role','admin_set_user_status','public.is_admin()','for update','revoke all on function']) assert.ok(sql.includes(part),part);
 assert.doesNotMatch(sql,/blood_pressure_readings|emergency_contacts/);
});
