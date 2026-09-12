package mh.michael.conference_scheduler.exceptions;

/**
 * Thrown for any refresh token that can't be exchanged: unknown, expired, or
 * already used (rotated away). Map this to a 401 in your exception handling -
 * it means "log in again," not a transient error.
 */
public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
