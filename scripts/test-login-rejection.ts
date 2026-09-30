import { loginUser } from '../app/actions/auth';

async function testAuth() {
  const fd1 = new FormData();
  fd1.set('email', 'unknown@gmail.com');
  fd1.set('password', 'password123');
  const r1 = await loginUser(fd1);
  console.log('Test 1 (Non-existent user):', r1);

  const fd2 = new FormData();
  fd2.set('email', 'admin@marketplace.pk');
  fd2.set('password', 'wrongpassword999');
  const r2 = await loginUser(fd2);
  console.log('Test 2 (Wrong password):', r2);
}

testAuth();
