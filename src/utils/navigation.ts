/**
 * Utilitários de navegação segura
 */

/**
 * Redireciona para uma URL de forma segura, tentando diferentes métodos
 * @param url - URL para redirecionar
 * @param router - Router do Next.js (opcional)
 */
export function safeRedirect(url: string, router?: any) {
  console.log(`🔄 Tentando redirecionar para: ${url}`);
  
  try {
    // Método 1: window.location.href (mais confiável)
    console.log('📱 Usando window.location.href...');
    window.location.href = url;
  } catch (error) {
    console.log('❌ Erro com window.location.href:', error);
    
    // Método 2: router.push (se disponível)
    if (router) {
      try {
        console.log('🧭 Tentando router.push...');
        router.push(url);
      } catch (routerError) {
        console.log('❌ Erro com router.push:', routerError);
        
        // Método 3: window.location.replace (último recurso)
        try {
          console.log('🔄 Tentando window.location.replace...');
          window.location.replace(url);
        } catch (replaceError) {
          console.log('❌ Erro com window.location.replace:', replaceError);
          console.log('💥 Todos os métodos de redirecionamento falharam!');
        }
      }
    } else {
      // Se não há router, tentar window.location.replace
      try {
        console.log('🔄 Tentando window.location.replace...');
        window.location.replace(url);
      } catch (replaceError) {
        console.log('❌ Erro com window.location.replace:', replaceError);
        console.log('💥 Todos os métodos de redirecionamento falharam!');
      }
    }
  }
}

/**
 * Redireciona para o dashboard de forma segura
 * @param router - Router do Next.js (opcional)
 */
export function redirectToDashboard(router?: any) {
  safeRedirect('/dashboard', router);
}

/**
 * Redireciona para o login de forma segura
 * @param router - Router do Next.js (opcional)
 */
export function redirectToLogin(router?: any) {
  safeRedirect('/login', router);
}

/**
 * Verifica se uma URL é válida
 * @param url - URL para verificar
 * @returns true se a URL é válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
}
