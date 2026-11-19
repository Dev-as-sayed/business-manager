import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ResultPage } from '@/shared/components/result-page';

export const ForbiddenPage = () => (
  <ResultPage
    code="403 / restricted"
    title="This desk is not yours"
    description="Your role does not include access to this area. If you think that is wrong, ask an administrator to review your permissions."
    actions={
      <>
        <Button asChild>
          <Link to="/">Back to the desk</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/profile">View your access</Link>
        </Button>
      </>
    }
  />
);
