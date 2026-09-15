import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';

function fakeRequest(sessionId = 'sess-1') {
  return { sessionId } as never;
}

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

  it('reads the profile using the session id the guard attached to the request', async () => {
    await controller.getProfile(fakeRequest('sess-1'));
    expect(usersService.getProfile).toHaveBeenCalledWith('sess-1');
  });

  it('creates or updates a profile payload', async () => {
    const body = { resume: { profile: { fullName: 'Ada' } } };
    await controller.updateProfile(fakeRequest('sess-1'), body);
    expect(usersService.upsertProfile).toHaveBeenCalledWith('sess-1', body);
  });

  it('deletes the stored profile', async () => {
    await controller.deleteProfile(fakeRequest('sess-1'));
    expect(usersService.deleteProfile).toHaveBeenCalledWith('sess-1');
  });

  it('lists and restores profile versions', async () => {
    await controller.listVersions(fakeRequest('sess-1'));
    expect(usersService.listVersions).toHaveBeenCalledWith('sess-1');
    await controller.createVersion(fakeRequest('sess-1'), { label: 'before rewrite' });
    expect(usersService.createVersion).toHaveBeenCalledWith('sess-1', 'before rewrite');
    await controller.restoreVersion(fakeRequest('sess-1'), { versionId: 'v1' });
    expect(usersService.restoreVersion).toHaveBeenCalledWith('sess-1', 'v1');
  });
});
