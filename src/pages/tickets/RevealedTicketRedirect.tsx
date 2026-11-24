import { Navigate, useParams } from 'react-router-dom';

import ROUTES from '@constants/routes.constants';

/**
 * Redirects legacy /tickets/:ticketId links to the public spin verification page.
 */
const RevealedTicketRedirect = () => {
  const { ticketId } = useParams<{ ticketId: string }>();

  return <Navigate to={ROUTES.SPIN_VERIFICATION.replace(':ticketId', ticketId ?? '')} replace />;
};

export default RevealedTicketRedirect;
