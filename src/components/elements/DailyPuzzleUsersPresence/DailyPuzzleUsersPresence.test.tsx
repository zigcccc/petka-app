import { render, screen } from '@testing-library/react-native';

import { DailyPuzzleUsersPresence } from './DailyPuzzleUsersPresence';

describe('<DailyPuzzleUsersPresence />', () => {
  it('should not render anything when there are no online users', () => {
    const { toJSON } = render(
      <DailyPuzzleUsersPresence
        currentUserNickname="notTheTarget"
        presence={[{ lastDisconnected: 1756888381508, online: false, userId: 'testUser1' }]}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('should not render anything when the only online user is the current user', () => {
    const { toJSON } = render(
      <DailyPuzzleUsersPresence
        currentUserNickname="testUser1"
        presence={[{ lastDisconnected: 1756888381508, online: true, userId: 'testUser1' }]}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('should render list of online user badges', () => {
    render(
      <DailyPuzzleUsersPresence
        currentUserNickname="notTheTarget"
        presence={[
          { lastDisconnected: 1756888381508, online: true, userId: 'firstTestUser' },
          { lastDisconnected: 1756888381510, online: true, userId: 'secondTestUser' },
        ]}
      />
    );

    expect(screen.queryByText('f')).toBeOnTheScreen();
    expect(screen.queryByText('s')).toBeOnTheScreen();
    expect(screen.queryByText('2 uporabnika igrata dnevni izziv 🧠')).toBeOnTheScreen();
  });

  it('should render "+X" badge when there are more than 4 users online', () => {
    render(
      <DailyPuzzleUsersPresence
        currentUserNickname="notTheTarget"
        presence={[
          { lastDisconnected: 1756888381508, online: true, userId: 'firstTestUser' },
          { lastDisconnected: 1756888381510, online: true, userId: 'secondTestUser' },
          { lastDisconnected: 1756888381510, online: true, userId: 'thirdTestUser' },
          { lastDisconnected: 1756888381510, online: true, userId: 'fourthTestUser' },
          { lastDisconnected: 1756888381510, online: true, userId: 'fifthTestUser' },
        ]}
      />
    );

    expect(screen.queryByText('+1')).toBeOnTheScreen();
    expect(screen.queryByText('5 uporabnikov igra dnevni izziv 🧠')).toBeOnTheScreen();
  });

  it.each([
    { numOfOnlinePlayers: 1, expectedText: '1 uporabnik igra' },
    { numOfOnlinePlayers: 2, expectedText: '2 uporabnika igrata' },
    { numOfOnlinePlayers: 3, expectedText: '3 uporabniki igrajo' },
    { numOfOnlinePlayers: 4, expectedText: '4 uporabniki igrajo' },
    { numOfOnlinePlayers: 5, expectedText: '5 uporabnikov igra' },
  ])(
    'should render "$expectedText" when there are $numberOfOnlinePlayers online',
    ({ expectedText, numOfOnlinePlayers }) => {
      const presence = Array.from({ length: numOfOnlinePlayers })
        .fill(null)
        .map((_, idx) => ({ lastDisconnected: 1756888381508, online: true, userId: `user-${idx + 1}` }));
      render(<DailyPuzzleUsersPresence currentUserNickname="notTheTarget" presence={presence} />);

      expect(screen.queryByText(expectedText, { exact: false })).toBeOnTheScreen();
    }
  );
});
