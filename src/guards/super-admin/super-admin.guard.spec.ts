import { SuperAdminGuard } from './super-admin.guard';

describe('SuperAdminGuard', () => {
  it('should be defined', () => {
    expect(new SuperAdminGuard()).toBeDefined();
  });
});
