import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ResultPage } from '@/shared/components/result-page';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  let message = 'An unexpected error interrupted this page.';

  if (isRouteErrorResponse(error)) {
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <ResultPage
      code="500 / interrupted"
      title="The page caught fire"
      description={message}
      actions={
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Reload the page
        </button>
      }
    />
  );
};
