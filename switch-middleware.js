const fs = require('fs');
const path = require('path');

const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
const middlewareDebugPath = path.join(__dirname, 'src', 'middleware-debug.ts');
const middlewareBackupPath = path.join(__dirname, 'src', 'middleware-backup.ts');

function switchMiddleware() {
  try {
    // Verificar se existe backup
    if (fs.existsSync(middlewareBackupPath)) {
      console.log('🔄 Restaurando middleware original...');
      fs.copyFileSync(middlewareBackupPath, middlewarePath);
      fs.unlinkSync(middlewareBackupPath);
      console.log('✅ Middleware original restaurado');
    } else {
      console.log('🔄 Ativando middleware debug...');
      // Fazer backup do middleware original
      fs.copyFileSync(middlewarePath, middlewareBackupPath);
      // Usar middleware debug
      fs.copyFileSync(middlewareDebugPath, middlewarePath);
      console.log('✅ Middleware debug ativado');
    }
  } catch (error) {
    console.error('❌ Erro ao alternar middleware:', error);
  }
}

switchMiddleware();
