/**
 * Admin Route Security Utilities
 * Handles secret route resolution and URL generation to keep the admin path obscure and configurable.
 */

export function getAdminSecretPath(): string {
  const secretPath =
    process.env.ADMIN_SECRET_PATH ||
    process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH ||
    "/portal-x9k-manage";

  const normalized = secretPath.trim();
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function getAdminPath(subPath: string = ""): string {
  const basePath = getAdminSecretPath();
  const cleanSubPath = subPath.startsWith("/") ? subPath : `/${subPath}`;
  
  if (!subPath || subPath === "/") {
    return basePath;
  }
  
  return `${basePath}${cleanSubPath}`;
}

export function isAdminSecretPath(pathname: string): boolean {
  const secretPath = getAdminSecretPath();
  return pathname === secretPath || pathname.startsWith(`${secretPath}/`);
}
