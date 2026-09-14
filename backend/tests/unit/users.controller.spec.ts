import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    getProfile: jest.Mock;
    upsertProfile: jest.Mock;
    deleteProfile: jest.Mock;
    listVersions: jest.Mock;
    createVersion: jest.Mock;
    restoreVersion: jest.Mock;
  };

  beforeEach(() => {
    usersService = {
      getProfile: jest.fn().mockResolvedValue({ user: { id: '1' }, profile: null }),
      upsertProfile: jest.fn().mockResolvedValue({ user: { id: '1' }, profile: { resume: {} } }),
      deleteProfile: jest.fn().mockResolvedValue(undefined),
      listVersions: jest.fn().mockResolvedValue([]),
      createVersion: jest.fn().mockResolvedValue({ id: 'v1', label: null, createdAt: new Date().toISOString() }),
      restoreVersion: jest.fn().mockResolvedValue({ user: { id: '1' }, profile: { resume: {} } }),
    };
    controller = new UsersController(usersService as unknown as UsersService);
  });

  it('reads the profile from the Authorization header', async () => {
    await controller.getProfile('Bearer abc');
    expect(usersService.getProfile).toHaveBeenCalledWith('Bearer abc');
  });

  it('creates or updates a profile payload', async () => {
    const body = { resume: { profile: { fullName: 'Ada' } } };
    await controller.updateProfile('Bearer abc', body);
    expect(usersService.upsertProfile).toHaveBeenCalledWith('Bearer abc', body);
  });

  it('deletes the stored profile', async () => {
    await controller.deleteProfile('Bearer abc');
    expect(usersService.deleteProfile).toHaveBeenCalledWith('Bearer abc');
  });

  it('lists and restores profile versions', async () => {
    await controller.listVersions('Bearer abc');
    expect(usersService.listVersions).toHaveBeenCalledWith('Bearer abc');
    await controller.createVersion('Bearer abc', { label: 'before rewrite' });
    expect(usersService.createVersion).toHaveBeenCalledWith('Bearer abc', 'before rewrite');
    await controller.restoreVersion('Bearer abc', { versionId: 'v1' });
    expect(usersService.restoreVersion).toHaveBeenCalledWith('Bearer abc', 'v1');
  });
});
