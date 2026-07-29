// Validaciones específicas del sistema Urbanito

/**
 * Valida el formato del código de estudiante de la UNAB
 * Formato flexible: de 5 a 25 caracteres (números, letras, puntos o guiones)
 * Ejemplo: 111.0222.033 o 12345678
 */
export function validarCodigoEstudiante(codigo: string): boolean {
  const regex = /^[\w.-]{5,25}$/;
  return regex.test(codigo.trim());
}

/**
 * Valida el formato del DNI peruano
 * Formato: 8 dígitos numéricos
 */
export function validarDNI(dni: string): boolean {
  const regex = /^\d{8}$/;
  return regex.test(dni);
}

/**
 * Valida el formato de placa vehicular peruana
 * Formatos: ABC-123 (antiguo) o ABC-1234 (nuevo)
 */
export function validarPlacaVehicular(placa: string): boolean {
  const regex = /^[A-Z]{3}-\d{3,4}$/;
  return regex.test(placa.toUpperCase());
}

/**
 * Valida correo institucional de la UNAB
 */
export function validarCorreoInstitucional(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@unab\.edu\.pe$/i;
  return regex.test(email);
}

/**
 * Valida número de teléfono peruano (celular)
 * Formato: 9 dígitos comenzando con 9
 */
export function validarTelefonoPeruano(telefono: string): boolean {
  const regex = /^9\d{8}$/;
  return regex.test(telefono);
}

/**
 * Valida que la contraseña cumpla requisitos mínimos de seguridad
 * - Al menos 8 caracteres
 * - Al menos una letra
 * - Al menos un número
 */
export function validarPassword(password: string): boolean {
  if (password.length < 8) return false;
  const tieneLetra = /[a-zA-Z]/.test(password);
  const tieneNumero = /\d/.test(password);
  return tieneLetra && tieneNumero;
}

/**
 * Formatea el código de estudiante para mostrar
 */
export function formatearCodigoEstudiante(codigo: string): string {
  return codigo.padStart(8, '0');
}

/**
 * Formatea el DNI para mostrar
 */
export function formatearDNI(dni: string): string {
  return dni.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
}

/**
 * Formatea la placa vehicular para mostrar
 */
export function formatearPlaca(placa: string): string {
  return placa.toUpperCase();
}

/**
 * Formatea el teléfono para mostrar
 * Formato: +51 999 999 999
 */
export function formatearTelefono(telefono: string): string {
  if (telefono.length === 9) {
    return `+51 ${telefono.slice(0, 3)} ${telefono.slice(3, 6)} ${telefono.slice(6)}`;
  }
  return telefono;
}
