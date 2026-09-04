package mh.michael.conference_scheduler.security;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Parses RSA keys supplied as raw PEM strings (e.g. straight out of an
 * environment variable) rather than from a file/classpath resource.
 *
 * Environment variables can't hold real newlines very comfortably, so this
 * also copes with PEM content where the line breaks were escaped as the two
 * literal characters "\n" (common when a multi-line PEM file is exported as
 * a single-line env var / K8s secret / Docker --env value).
 *
 * Expected formats:
 *  - Private key: PKCS#8, "-----BEGIN PRIVATE KEY-----" ... "-----END PRIVATE KEY-----"
 *      (generate with: openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem)
 *  - Public key:  X.509, "-----BEGIN PUBLIC KEY-----" ... "-----END PUBLIC KEY-----"
 *      (generate with: openssl rsa -in private.pem -pubout -out public.pem)
 */
public final class PemKeyParser {

  private PemKeyParser() {
  }

  public static RSAPublicKey parsePublicKey(String pem) {
    try {
      byte[] decoded = decode(pem, "PUBLIC KEY");
      KeyFactory factory = KeyFactory.getInstance("RSA");
      return (RSAPublicKey) factory.generatePublic(new X509EncodedKeySpec(decoded));
    } catch (Exception ex) {
      throw new IllegalStateException(
        "Failed to parse RSA public key from RSA_PUBLIC_KEY environment variable. "
          + "Make sure it is a PEM-encoded X.509 public key (BEGIN PUBLIC KEY).", ex);
    }
  }

  public static RSAPrivateKey parsePrivateKey(String pem) {
    try {
      byte[] decoded = decode(pem, "PRIVATE KEY");
      KeyFactory factory = KeyFactory.getInstance("RSA");
      return (RSAPrivateKey) factory.generatePrivate(new PKCS8EncodedKeySpec(decoded));
    } catch (Exception ex) {
      throw new IllegalStateException(
        "Failed to parse RSA private key from RSA_PRIVATE_KEY environment variable. "
          + "Make sure it is a PEM-encoded PKCS#8 private key (BEGIN PRIVATE KEY), "
          + "not a PKCS#1 \"BEGIN RSA PRIVATE KEY\" key. Convert with: "
          + "openssl pkcs8 -topk8 -nocrypt -in rsa_private.pem -out private.pem", ex);
    }
  }

  private static byte[] decode(String pem, String label) {
    if (pem == null || pem.isBlank()) {
      throw new IllegalArgumentException("PEM content is empty");
    }
    String normalized = pem
      .replace("\\n", "\n") // undo literal-\n escaping from env vars
      .replace("-----BEGIN " + label + "-----", "")
      .replace("-----END " + label + "-----", "")
      .replaceAll("\\s", "");
    return Base64.getDecoder().decode(normalized);
  }
}
