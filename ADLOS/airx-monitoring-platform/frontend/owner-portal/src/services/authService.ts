import { auth } from '../config/firebase';

/**
 * Retrieves the current Firebase JWT token.
 * 
 * ARCHITECTURE NOTE:
 * This token MUST be attached to the Authorization header of all REST API
 * requests and the initial WebSocket handshake sent to the Spring Boot backend.
 * 
 * Example HTTP usage:
 * headers: { 'Authorization': Bearer  + await getAuthToken() }
 * 
 * Example WebSocket usage (STOMP):
 * const stompClient = new StompJs.Client({
 *   brokerURL: 'ws://localhost:8080/ws-telemetry',
 *   connectHeaders: {
 *     Authorization: Bearer  + await getAuthToken()
 *   }
 * });
 */
export const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  // Force refresh if needed
  return await user.getIdToken(true);
};
