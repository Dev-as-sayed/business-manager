import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Can } from '@/shared/guards/Can';
import { usePermission } from '@/shared/hooks/usePermission';

jest.mock('@/shared/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}));

const mockedUsePermission = jest.mocked(usePermission);

describe('Can', () => {
  it('renders children when the permission is present', async () => {
    mockedUsePermission.mockReturnValue({
      user: null,
      role: 'ADMIN',
      can: () => true,
    });

    const { getByText } = await render(
      <Can resource="quotations" action="approve">
        <Text>Approve quotation</Text>
      </Can>,
    );

    expect(getByText('Approve quotation')).toBeTruthy();
  });

  it('renders the fallback when permission is missing', async () => {
    mockedUsePermission.mockReturnValue({
      user: null,
      role: 'CUSTOMER',
      can: () => false,
    });

    const { queryByText, getByText } = await render(
      <Can resource="quotations" action="delete" fallback={<Text>Not allowed</Text>}>
        <Text>Delete quotation</Text>
      </Can>,
    );

    expect(queryByText('Delete quotation')).toBeNull();
    expect(getByText('Not allowed')).toBeTruthy();
  });
});
