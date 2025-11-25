const { query } = require('../../config/postgres');

/**
 * Cria um novo consentimento
 * O consentimento é automaticamente autorizado com validade de 1 ano
 */
const createConsent = async (id, customerId, permissions) => {
  // Definir data de expiração (1 ano a partir de agora)
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  const text = `
    INSERT INTO consents (id, customer_id, permissions, status, expiration_date, created_at, updated_at)
    VALUES ($1, $2, $3, 'AUTHORIZED', $4, NOW(), NOW())
    RETURNING *
  `;
  const values = [id, customerId, JSON.stringify(permissions), expirationDate];
  const result = await query(text, values);

  // Parse o JSON de permissions para retornar
  const consent = result.rows[0];
  consent.permissions = typeof consent.permissions === 'string'
    ? JSON.parse(consent.permissions)
    : consent.permissions;

  return consent;
};

/**
 * Busca consentimento por ID
 */
const findConsentById = async (id) => {
  const text = 'SELECT * FROM consents WHERE id = $1';
  const result = await query(text, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const consent = result.rows[0];
  // Parse o JSON de permissions
  consent.permissions = typeof consent.permissions === 'string'
    ? JSON.parse(consent.permissions)
    : consent.permissions;

  return consent;
};

/**
 * Busca consentimento ativo por customer_id
 * Retorna apenas se status = AUTHORIZED e não expirado
 */
const findActiveConsentByCustomerId = async (customerId) => {
  const text = `
    SELECT * FROM consents
    WHERE customer_id = $1
      AND status = 'AUTHORIZED'
      AND expiration_date > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await query(text, [customerId]);

  if (result.rows.length === 0) {
    return null;
  }

  const consent = result.rows[0];
  // Parse o JSON de permissions
  consent.permissions = typeof consent.permissions === 'string'
    ? JSON.parse(consent.permissions)
    : consent.permissions;

  return consent;
};

/**
 * Revoga um consentimento (altera status para REVOKED)
 */
const revokeConsent = async (id) => {
  const text = `
    UPDATE consents
    SET status = 'REVOKED', updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(text, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const consent = result.rows[0];
  // Parse o JSON de permissions
  consent.permissions = typeof consent.permissions === 'string'
    ? JSON.parse(consent.permissions)
    : consent.permissions;

  return consent;
};

/**
 * Busca todos os consentimentos de um cliente
 */
const findConsentsByCustomerId = async (customerId) => {
  const text = `
    SELECT * FROM consents
    WHERE customer_id = $1
    ORDER BY created_at DESC
  `;
  const result = await query(text, [customerId]);

  // Parse o JSON de permissions para cada consent
  return result.rows.map(consent => ({
    ...consent,
    permissions: typeof consent.permissions === 'string'
      ? JSON.parse(consent.permissions)
      : consent.permissions
  }));
};

module.exports = {
  createConsent,
  findConsentById,
  findActiveConsentByCustomerId,
  revokeConsent,
  findConsentsByCustomerId
};
